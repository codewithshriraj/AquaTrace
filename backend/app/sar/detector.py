"""
AquaTrace Adaptive Dark-Spot Detection Engine
Performs adaptive local anomaly segmentation, multi-scale morphological cleanup,
connected-component object extraction, and geodesic geometric feature computation.
"""

import math
import numpy as np
from scipy.ndimage import uniform_filter, binary_fill_holes
from skimage.morphology import opening, remove_small_objects, disk
from skimage.measure import label, regionprops, find_contours
from shapely.geometry import Polygon, MultiPolygon, mapping
from typing import List, Dict, Any, Tuple, Optional
import logging

logger = logging.getLogger("aquatrace.sar.detector")

EARTH_RADIUS_KM = 6371.0088


def pixel_to_wgs84(
    r: float,
    c: float,
    min_lon: float,
    min_lat: float,
    max_lon: float,
    max_lat: float,
    height: int,
    width: int
) -> Tuple[float, float]:
    """Linearly maps raster pixel (row, col) to WGS84 (lon, lat)."""
    lon = min_lon + (c / max(width - 1, 1)) * (max_lon - min_lon)
    lat = max_lat - (r / max(height - 1, 1)) * (max_lat - min_lat)
    return round(float(lon), 6), round(float(lat), 6)


def calculate_spherical_polygon_area_km2(coordinates: List[List[float]]) -> float:
    """Computes exact spherical excess area of a polygon defined in WGS84 lon, lat."""
    if len(coordinates) < 3:
        return 0.0

    # Ensure closed ring
    ring = coordinates
    if ring[0] != ring[-1]:
        ring = ring + [ring[0]]

    area_rad = 0.0
    for i in range(len(ring) - 1):
        p1 = ring[i]
        p2 = ring[i + 1]
        lon1 = math.radians(p1[0])
        lat1 = math.radians(p1[1])
        lon2 = math.radians(p2[0])
        lat2 = math.radians(p2[1])
        area_rad += (lon2 - lon1) * (2.0 + math.sin(lat1) + math.sin(lat2))

    area_rad = abs(area_rad / 2.0)
    area_km2 = area_rad * (EARTH_RADIUS_KM ** 2)
    return round(float(area_km2), 4)


def calculate_haversine_perimeter_km(coordinates: List[List[float]]) -> float:
    """Computes total geodesic perimeter in kilometers using Haversine formula."""
    if len(coordinates) < 2:
        return 0.0

    total_dist = 0.0
    for i in range(len(coordinates) - 1):
        p1 = coordinates[i]
        p2 = coordinates[i + 1]
        lon1, lat1 = math.radians(p1[0]), math.radians(p1[1])
        lon2, lat2 = math.radians(p2[0]), math.radians(p2[1])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = math.sin(dlat / 2.0)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        total_dist += EARTH_RADIUS_KM * c

    return round(float(total_dist), 3)


class AdaptiveDarkSpotDetector:
    def __init__(
        self,
        dark_anomaly_threshold_db: float = 4.0,
        local_window_size: int = 51,
        min_candidate_area_km2: float = 0.1,
        max_candidate_area_km2: float = 1000.0,
        min_aspect_ratio: float = 1.0,
        max_aspect_ratio: float = 30.0
    ):
        self.anomaly_threshold = dark_anomaly_threshold_db
        self.local_window_size = local_window_size
        self.min_area_km2 = min_candidate_area_km2
        self.max_area_km2 = max_candidate_area_km2
        self.min_aspect_ratio = min_aspect_ratio
        self.max_aspect_ratio = max_aspect_ratio

    def detect_dark_spots(
        self,
        sigma0_db: np.ndarray,
        valid_mask: np.ndarray,
        geo_bounds: Tuple[float, float, float, float]
    ) -> Dict[str, Any]:
        """
        Executes adaptive local anomaly estimation, segmentation, and candidate extraction.
        
        geo_bounds: (min_lon, min_lat, max_lon, max_lat)
        """
        min_lon, min_lat, max_lon, max_lat = geo_bounds
        height, width = sigma0_db.shape

        # 1. Estimate local sea background using large uniform filter over valid pixels
        sea_pixels = np.where(valid_mask, sigma0_db, np.nan)
        # Replace NaNs with local mean for smooth background filtering
        valid_mean = float(np.mean(sigma0_db[valid_mask])) if np.any(valid_mask) else -15.0
        filled_sea = np.where(valid_mask, sigma0_db, valid_mean)
        
        local_background_db = uniform_filter(filled_sea, size=self.local_window_size)
        
        # 2. Local dark anomaly: Delta_dB = Local_Background_dB - Pixel_dB
        anomaly_db = local_background_db - sigma0_db
        
        # 3. Adaptive thresholding:
        # A dark spot must exceed the anomaly threshold AND be below the sea background mean
        sea_std = float(np.std(sigma0_db[valid_mask])) if np.any(valid_mask) else 2.5
        dark_mask = (anomaly_db >= self.anomaly_threshold) & (sigma0_db < (valid_mean - 0.5 * sea_std)) & valid_mask

        # 4. Multi-scale morphological filtering
        opened = opening(dark_mask, disk(2))
        filled = binary_fill_holes(opened)
        cleaned = remove_small_objects(filled, min_size=15)

        # 5. Connected-Component Labeling
        labeled_mask, num_features = label(cleaned, connectivity=2, return_num=True)
        props = regionprops(labeled_mask, intensity_image=sigma0_db)

        candidates = []
        for prop in props:
            # Extract boundary contour using find_contours on the region sub-mask
            bbox = prop.bbox  # (min_r, min_c, max_r, max_c)
            sub_mask = (labeled_mask[bbox[0]:bbox[2], bbox[1]:bbox[3]] == prop.label)
            padded = np.pad(sub_mask, pad_width=1, mode='constant', constant_values=False)
            contours = find_contours(padded, level=0.5)

            if not contours:
                continue

            # Pick largest contour for this connected object
            main_contour = max(contours, key=len)
            
            # Map contour local pixels back to global raster coordinates, then to WGS84
            wgs84_coords = []
            for pt in main_contour:
                global_r = bbox[0] + pt[0] - 1.0
                global_c = bbox[1] + pt[1] - 1.0
                lon, lat = pixel_to_wgs84(global_r, global_c, min_lon, min_lat, max_lon, max_lat, height, width)
                wgs84_coords.append([lon, lat])

            if len(wgs84_coords) < 4:
                continue

            # Ensure closing point
            if wgs84_coords[0] != wgs84_coords[-1]:
                wgs84_coords.append(wgs84_coords[0])

            # Compute geodesic measurements
            area_km2 = calculate_spherical_polygon_area_km2(wgs84_coords)
            if area_km2 < self.min_area_km2 or area_km2 > self.max_area_km2:
                continue

            perimeter_km = calculate_haversine_perimeter_km(wgs84_coords)

            # Centroid in WGS84
            cr_pixel, cc_pixel = prop.centroid
            centroid_lon, centroid_lat = pixel_to_wgs84(cr_pixel, cc_pixel, min_lon, min_lat, max_lon, max_lat, height, width)

            # Principal inertia tensor orientation & aspect ratio
            # prop.orientation is in radians from -pi/2 to pi/2 (major axis from horizontal)
            orientation_deg = round((math.degrees(prop.orientation) + 90.0) % 180.0, 1)
            
            major_axis = max(getattr(prop, "axis_major_length", getattr(prop, "major_axis_length", 1.0)), 1.0)
            minor_axis = max(getattr(prop, "axis_minor_length", getattr(prop, "minor_axis_length", 1.0)), 1.0)
            aspect_ratio = round(major_axis / minor_axis, 2)
            
            # Approximate length and width in km
            length_km = round(perimeter_km / 2.5, 2)
            width_km = round(area_km2 / max(length_km, 0.1), 2)
            
            # Radiometric statistics using modern skimage property names
            mean_intensity = getattr(prop, "intensity_mean", getattr(prop, "mean_intensity", -20.0))
            min_intensity = getattr(prop, "intensity_min", getattr(prop, "min_intensity", -25.0))
            mean_sigma0_db = round(float(mean_intensity), 2)
            min_sigma0_db = round(float(min_intensity), 2)
            
            # Ambient background around the object: use ambient sea mean or local background
            sub_bg = local_background_db[bbox[0]:bbox[2], bbox[1]:bbox[3]]
            bg_sigma0_db = round(float(np.mean(sub_bg)), 2) if sub_bg.size > 0 else valid_mean
            if bg_sigma0_db < valid_mean:
                bg_sigma0_db = round(valid_mean, 2)
            damping_contrast_db = round(bg_sigma0_db - mean_sigma0_db, 2)

            candidate_id = f"SAR-CAND-{len(candidates) + 1:02d}"

            candidates.append({
                "id": candidate_id,
                "pixelCount": int(prop.area),
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [wgs84_coords]
                },
                "centroid": {
                    "lat": centroid_lat,
                    "lon": centroid_lon
                },
                "areaKm2": area_km2,
                "perimeterKm": perimeter_km,
                "lengthKm": length_km,
                "widthKm": width_km,
                "aspectRatio": aspect_ratio,
                "orientationDeg": orientation_deg,
                "meanSigma0Db": mean_sigma0_db,
                "minSigma0Db": min_sigma0_db,
                "backgroundSigma0Db": bg_sigma0_db,
                "dampingContrastDb": damping_contrast_db
            })

        # Sort candidates descending by area
        candidates.sort(key=lambda x: x["areaKm2"], reverse=True)

        return {
            "detectionMask": cleaned.astype(np.uint8),
            "anomalyDb": anomaly_db,
            "candidateCount": len(candidates),
            "candidates": candidates
        }
