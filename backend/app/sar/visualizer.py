"""
AquaTrace SAR Raster Visualization Engine
Generates web-ready PNG visualization overlays and base64 payloads for
raw SAR amplitude, backscatter dB, binary dark-spot masks, and candidate overlays.
"""

import io
import base64
from typing import Dict, Any, Optional
import numpy as np
from PIL import Image
import logging

logger = logging.getLogger("aquatrace.sar.visualizer")


def normalize_to_uint8(arr: np.ndarray, vmin: float = None, vmax: float = None) -> np.ndarray:
    """Clips and normalizes an array to 0..255 uint8 using percentiles if bounds not specified."""
    if vmin is None:
        vmin = float(np.percentile(arr[arr > -35.0], 2)) if np.any(arr > -35.0) else -25.0
    if vmax is None:
        vmax = float(np.percentile(arr[arr > -35.0], 98)) if np.any(arr > -35.0) else -5.0

    clipped = np.clip(arr, vmin, vmax)
    norm = (clipped - vmin) / max(vmax - vmin, 1e-5)
    return (norm * 255.0).astype(np.uint8)


class SARVisualizer:
    def __init__(self):
        pass

    def generate_raw_sar_png(self, sigma0_linear: np.ndarray) -> bytes:
        """Generates 8-bit grayscale contrast-stretched SAR intensity image."""
        # Logarithmic amplitude stretch
        amp = np.log10(np.maximum(sigma0_linear, 1e-6))
        u8 = normalize_to_uint8(amp)
        img = Image.fromarray(u8, mode="L")
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    def generate_backscatter_db_png(self, sigma0_db: np.ndarray, valid_mask: np.ndarray) -> bytes:
        """
        Generates false-color visualization for backscatter in dB.
        Colormap: Dark blue (-25 dB) -> Cyan (-15 dB) -> Green (-10 dB) -> Yellow/White (-5 dB).
        """
        # Normalize -25 dB to -5 dB range
        norm = np.clip((sigma0_db - (-25.0)) / (20.0), 0.0, 1.0)
        
        # Color mapping (R, G, B)
        # 0.0 (very dark, slick/calm): (15, 23, 42) slate-900 / dark blue
        # 0.3: (14, 116, 144) cyan
        # 0.6: (16, 185, 129) emerald
        # 1.0: (254, 240, 138) bright yellow
        h, w = sigma0_db.shape
        rgb = np.zeros((h, w, 3), dtype=np.uint8)

        # Apply simple piecewise gradient
        r = np.clip(255 * (norm - 0.5) * 2.0, 0, 255).astype(np.uint8)
        g = np.clip(255 * (norm * 1.4), 0, 255).astype(np.uint8)
        b = np.clip(255 * (1.0 - norm * 0.8), 20, 255).astype(np.uint8)

        rgb[..., 0] = r
        rgb[..., 1] = g
        rgb[..., 2] = b
        
        # Set invalid pixels to transparent/black
        rgb[~valid_mask] = 0

        img = Image.fromarray(rgb, mode="RGB")
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    def generate_detection_mask_png(self, mask: np.ndarray) -> bytes:
        """Generates RGBA overlay where detected candidate pixels are bright amber with transparency."""
        h, w = mask.shape
        rgba = np.zeros((h, w, 4), dtype=np.uint8)
        
        # Detected pixels: Vibrant orange/amber (245, 158, 11) with alpha 200
        detected = mask > 0
        rgba[detected, 0] = 245
        rgba[detected, 1] = 158
        rgba[detected, 2] = 11
        rgba[detected, 3] = 200
        
        img = Image.fromarray(rgba, mode="RGBA")
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    def generate_all_visualizations(
        self,
        sigma0_linear: np.ndarray,
        sigma0_db: np.ndarray,
        valid_mask: np.ndarray,
        detection_mask: np.ndarray
    ) -> Dict[str, str]:
        """Returns base64 data URLs for all 3 visualization layers."""
        raw_png = self.generate_raw_sar_png(sigma0_linear)
        db_png = self.generate_backscatter_db_png(sigma0_db, valid_mask)
        mask_png = self.generate_detection_mask_png(detection_mask)

        return {
            "rawSar": f"data:image/png;base64,{base64.b64encode(raw_png).decode('ascii')}",
            "backscatterDb": f"data:image/png;base64,{base64.b64encode(db_png).decode('ascii')}",
            "detectionMask": f"data:image/png;base64,{base64.b64encode(mask_png).decode('ascii')}"
        }
