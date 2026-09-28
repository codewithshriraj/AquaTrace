"""
AquaTrace SAR Preprocessing Engine
Performs calibrated sigma0 (backscatter) conversion, decibel transformation,
speckle reduction (Enhanced Lee filter), and sea/land masking for Sentinel-1 GRD.
"""

import numpy as np
from scipy.ndimage import uniform_filter
import logging
from typing import Tuple, Dict, Any, Optional

logger = logging.getLogger("aquatrace.sar.preprocessor")


def apply_enhanced_lee_filter(img_linear: np.ndarray, window_size: int = 5, damping_factor: float = 1.0) -> np.ndarray:
    """
    Enhanced Lee speckle filter for SAR intensity/amplitude rasters.
    Preserves edges and dark slick boundaries without indiscriminate spatial blurring.
    
    Formula:
      W = exp(-damping * (C_i - C_u) / (C_max - C_i))
      R_hat = mean + W * (pixel - mean)
    """
    if window_size % 2 == 0:
        window_size += 1

    img = np.maximum(img_linear, 1e-7)
    mean = uniform_filter(img, size=window_size)
    mean_sq = uniform_filter(img**2, size=window_size)
    variance = np.maximum(mean_sq - mean**2, 1e-7)
    
    # Coefficient of variation of the image
    c_i = np.sqrt(variance) / (mean + 1e-7)
    
    # Nominal noise coefficient of variation for Sentinel-1 GRD 4-looks
    n_looks = 4.4
    c_u = 1.0 / np.sqrt(n_looks)
    c_max = np.sqrt(1.0 + 2.0 / n_looks)
    
    # Weighting factor
    weight = np.zeros_like(img)
    
    # Low variance (homogeneous sea background) -> smooth
    mask_low = c_i <= c_u
    weight[mask_low] = 0.0
    
    # High variance (sharp edges / point targets) -> retain original
    mask_high = c_i >= c_max
    weight[mask_high] = 1.0
    
    # Intermediate variance -> adaptive filtering
    mask_mid = (~mask_low) & (~mask_high)
    if np.any(mask_mid):
        weight[mask_mid] = np.exp(
            -damping_factor * (c_i[mask_mid] - c_u) / np.maximum(c_max - c_i[mask_mid], 1e-5)
        )
    
    filtered = mean + weight * (img - mean)
    return np.maximum(filtered, 1e-7)


class SARPreprocessor:
    def __init__(self, calibration_lut_constant: float = 1.0):
        self.cal_constant = calibration_lut_constant

    def process_grd_raster(
        self,
        dn_matrix: np.ndarray,
        polarization: str = "VV",
        window_size: int = 5,
        vh_dn_matrix: Optional[np.ndarray] = None
    ) -> Dict[str, Any]:
        """
        Converts digital numbers (DN) to calibrated backscatter (sigma0), converts to dB,
        applies speckle filtering, and computes polarization metrics.
        """
        valid_mask = dn_matrix > 0
        if not np.any(valid_mask):
            raise ValueError("SAR raster contains zero valid non-zero pixels.")

        # 1. Radiometric calibration: sigma0 = DN^2 / A^2
        sigma0_linear = (dn_matrix.astype(np.float32) ** 2) / (self.cal_constant ** 2)
        sigma0_linear[~valid_mask] = 1e-7

        # 2. Speckle Reduction via Enhanced Lee Filter
        filtered_linear = apply_enhanced_lee_filter(sigma0_linear, window_size=window_size)
        filtered_linear[~valid_mask] = 1e-7

        # 3. Decibel conversion: sigma0_dB = 10 * log10(sigma0)
        sigma0_db = 10.0 * np.log10(filtered_linear)
        sigma0_db[~valid_mask] = -35.0  # Safe floor for NoData

        # 4. Handle Dual Polarization if VH is supplied
        vh_sigma0_db = None
        vv_vh_ratio_db = None
        if vh_dn_matrix is not None and vh_dn_matrix.shape == dn_matrix.shape:
            vh_linear = (vh_dn_matrix.astype(np.float32) ** 2) / (self.cal_constant ** 2)
            vh_filtered = apply_enhanced_lee_filter(vh_linear, window_size=window_size)
            vh_sigma0_db = 10.0 * np.log10(np.maximum(vh_filtered, 1e-7))
            vh_sigma0_db[~valid_mask] = -40.0
            vv_vh_ratio_db = sigma0_db - vh_sigma0_db

        # 5. Sea Backscatter Statistics
        valid_db = sigma0_db[valid_mask]
        sea_mean_db = float(np.mean(valid_db))
        sea_std_db = float(np.std(valid_db))
        sea_median_db = float(np.median(valid_db))

        return {
            "sigma0_linear": filtered_linear,
            "sigma0_db": sigma0_db,
            "vh_sigma0_db": vh_sigma0_db,
            "vv_vh_ratio_db": vv_vh_ratio_db,
            "valid_mask": valid_mask,
            "stats": {
                "seaMeanDb": round(sea_mean_db, 2),
                "seaStdDb": round(sea_std_db, 2),
                "seaMedianDb": round(sea_median_db, 2),
                "minDb": round(float(np.min(valid_db)), 2),
                "maxDb": round(float(np.max(valid_db)), 2),
                "polarization": polarization if vh_dn_matrix is None else "VV+VH"
            }
        }
