"""
AquaTrace Look-Alike Validation Layer
Assesses SAR dark features against environmental forcing (wind/waves),
morphological characteristics (ship wakes, internal waves), and coastal proximity.
"""

import math
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger("aquatrace.sar.lookalike")


class LookAlikeValidator:
    def __init__(self):
        pass

    def evaluate_candidate(
        self,
        candidate: Dict[str, Any],
        wind_speed_knots: float,
        wind_direction_deg: float,
        distance_to_coast_km: float = 18.5,
        wave_height_m: Optional[float] = 1.5
    ) -> Dict[str, Any]:
        """
        Calculates look-alike risk indicators, analytical evidence score,
        and scientific classification for a candidate dark feature.
        """
        aspect_ratio = candidate.get("aspectRatio", 1.5)
        length_km = candidate.get("lengthKm", 5.0)
        width_km = candidate.get("widthKm", 2.0)
        damping_db = candidate.get("dampingContrastDb", 6.0)
        orientation_deg = candidate.get("orientationDeg", 0.0)
        area_km2 = candidate.get("areaKm2", 10.0)

        wind_speed_ms = wind_speed_knots * 0.514444

        risks = []
        penalties = 0

        # 1. Wind Sanity Check
        # Wind < 3 m/s (~6 kts): Glassy calm sea / wind shadow risk
        # Wind > 12 m/s (~23 kts): High sea state / slick dispersion risk
        if wind_speed_ms < 3.0:
            risks.append("LOW_WIND_GLASSY_SEA_RISK")
            penalties += 25
            wind_assessment = "Low wind (<3 m/s): High susceptibility to natural calm-water look-alikes"
        elif wind_speed_ms > 12.0:
            risks.append("HIGH_WIND_DISPERSION_RISK")
            penalties += 20
            wind_assessment = "High wind (>12 m/s): Strong mechanical dispersion and wave mixing expected"
        else:
            wind_assessment = "Moderate wind (3-12 m/s): Favorable SAR sea-clutter conditions for surfactant detection"

        # 2. Ship-Wake Geometric Filter
        # Wakes typically have very high elongation (L/W > 8), narrow width (<0.5 km)
        is_ship_wake = False
        if aspect_ratio > 8.0 and width_km < 0.6:
            risks.append("SHIP_WAKE_GEOMETRY_RISK")
            penalties += 35
            is_ship_wake = True
            wake_assessment = "Highly elongated narrow structure consistent with vessel hydrodynamic wake"
        else:
            wake_assessment = "Geometric shape consistent with surface film spreading rather than linear wake"

        # 3. Coastal Proximity / Bathymetric Effects
        if distance_to_coast_km < 3.0:
            risks.append("SHALLOW_COASTAL_FRONT_RISK")
            penalties += 20
            coastal_assessment = "Close proximity to coastline (<3 km); potential coastal runoff or mudbank artifact"
        else:
            coastal_assessment = "Offshore deep water location; minimal coastal bathymetric distortion"

        # 4. Biogenic / Natural Surfactant Slick Check
        # Biogenic films often have lower damping contrast (<4 dB) or very irregular diffuse borders
        if damping_db < 4.0:
            risks.append("WEAK_DAMPING_BIOGENIC_RISK")
            penalties += 15
            damping_assessment = "Moderate damping (<4 dB); possible biogenic film or low surfactant concentration"
        elif damping_db >= 10.0:
            damping_assessment = "Strong Bragg capillary wave suppression (>10 dB); consistent with mineral oil film"
        else:
            damping_assessment = f"Pronounced surface damping ({damping_db} dB); consistent with surfactant dampening"

        # 5. Calculate Calibrated Analytical Evidence Score (0 - 100)
        # Base score 85, modified by contrast, geometry, and penalties
        base_score = 85.0
        contrast_boost = min(damping_db * 2.0, 15.0)  # Up to +15 for high contrast
        
        # Moderate aspect ratio (1.5 to 5.0) is typical for wind-sheared oil slicks
        if 1.5 <= aspect_ratio <= 6.0:
            geometry_boost = 10.0
        else:
            geometry_boost = 0.0

        raw_score = base_score + contrast_boost + geometry_boost - penalties
        evidence_score = max(min(round(raw_score), 95), 15)

        # 6. Scientific Classification
        if is_ship_wake:
            classification = "LIKELY_LOOK_ALIKE"
            look_alike_risk = "HIGH"
            primary_call = "Likely Look-Alike (Vessel Wake Pattern)"
        elif penalties >= 40:
            classification = "LIKELY_LOOK_ALIKE"
            look_alike_risk = "HIGH"
            primary_call = "Likely Look-Alike (Environmental / Oceanographic)"
        elif penalties >= 20:
            classification = "POSSIBLE_OIL_LIKE_FEATURE"
            look_alike_risk = "MODERATE"
            primary_call = "Possible Oil-Like Dark Feature"
        else:
            classification = "OIL_SPILL_CANDIDATE"
            look_alike_risk = "LOW"
            primary_call = "Potential Oil Spill Candidate"

        return {
            "evidenceScore": evidence_score,
            "lookAlikeRisk": look_alike_risk,
            "classification": classification,
            "primaryCall": primary_call,
            "detectedRisks": risks,
            "evaluations": {
                "windAssessment": wind_assessment,
                "wakeAssessment": wake_assessment,
                "coastalAssessment": coastal_assessment,
                "dampingAssessment": damping_assessment
            }
        }
