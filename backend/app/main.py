"""
AquaTrace Scientific SAR Processing API Server
FastAPI backend providing asynchronous Copernicus Sentinel-1 GRD discovery,
pixel-level radiometric calibration, dark-spot segmentation, and investigation creation.
"""

import os
import sys
import logging
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.copernicus.cdse_client import CopernicusCDSEClient
from backend.app.jobs.job_manager import SARJobManager, PROCESSING_VERSION

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("aquatrace.api")

app = FastAPI(
    title="AquaTrace Scientific SAR Processing Backend",
    version=PROCESSING_VERSION,
    description="Sentinel-1 GRD pixel-level oil-spill detection and forensic traceback API"
)

# Enable CORS for frontend Vite development & production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

cdse_client = CopernicusCDSEClient()
job_manager = SARJobManager()


class SearchRequest(BaseModel):
    minLon: float = Field(77.0, description="Minimum longitude")
    minLat: float = Field(8.0, description="Minimum latitude")
    maxLon: float = Field(80.5, description="Maximum longitude")
    maxLat: float = Field(10.5, description="Maximum latitude")
    startDate: str = Field("2026-03-20", description="Start date YYYY-MM-DD")
    endDate: str = Field("2026-03-25", description="End date YYYY-MM-DD")
    maxResults: int = Field(10, description="Maximum scenes to return")


class ProcessRequest(BaseModel):
    scene: Dict[str, Any] = Field(..., description="Sentinel-1 GRD scene metadata object")
    config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Operational detector tuning parameters")


class CreateInvestigationRequest(BaseModel):
    jobId: str = Field(..., description="Completed SAR processing job ID")
    candidateId: Optional[str] = Field(None, description="Selected candidate ID (defaults to primary)")
    investigatorNotes: Optional[str] = Field("Live investigation initialized from authentic Sentinel-1 SAR pixels.")


@app.get("/")
def read_root():
    return {
        "system": "AquaTrace Scientific SAR Processing Engine",
        "version": PROCESSING_VERSION,
        "status": "OPERATIONAL",
        "documentation": "/docs"
    }


@app.get("/api/health/sar")
def get_sar_health():
    """Returns service health, CDSE authentication status, and worker capacity."""
    return {
        "status": "HEALTHY",
        "engineVersion": PROCESSING_VERSION,
        "cdseAuthenticated": cdse_client.is_authenticated(),
        "pixelLevelProcessingAvailable": True,
        "activeJobs": len(job_manager.jobs),
        "dataDirectory": job_manager.data_dir,
        "capabilities": [
            "Sentinel-1 Level-1 GRD Amplitude Decoding",
            "Radiometric Calibration (sigma0)",
            "Decibel Conversion (10*log10(sigma0))",
            "Enhanced Lee Speckle Filtering",
            "Coastal Boundary Water Masking",
            "Adaptive Local Anomaly Segmentation",
            "Multi-Scale Morphological Object Cleanup",
            "Geodesic Spherical Shoelace Area Calculation",
            "Look-Alike Risk Assessment (Wind/Wake/Coastal)",
            "Web-Ready False Color Raster Overlays"
        ]
    }


@app.post("/api/sar/search")
async def search_sar_scenes(req: SearchRequest):
    """Searches Copernicus CDSE Catalogue for authentic Sentinel-1 GRD products."""
    try:
        products = await cdse_client.search_sentinel1_grd(
            min_lon=req.minLon,
            min_lat=req.minLat,
            max_lon=req.maxLon,
            max_lat=req.maxLat,
            start_date=req.startDate,
            end_date=req.endDate,
            max_results=req.maxResults
        )
        return {
            "source": "Copernicus Data Space Ecosystem (CDSE)",
            "queryBounds": [req.minLon, req.minLat, req.maxLon, req.maxLat],
            "productType": "Sentinel-1 IW GRD",
            "resultCount": len(products),
            "products": products
        }
    except Exception as e:
        logger.error(f"Search endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/sar/process")
async def process_sar_scene(req: ProcessRequest, background_tasks: BackgroundTasks):
    """Submits a Sentinel-1 scene for pixel-level SAR processing."""
    try:
        job_id = job_manager.create_job(req.scene, req.config)
        # Dispatch asynchronous worker task
        background_tasks.add_task(job_manager.execute_processing_pipeline, job_id)
        return {
            "jobId": job_id,
            "status": "QUEUED",
            "message": "SAR processing job queued for execution"
        }
    except Exception as e:
        logger.error(f"Process submission error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sar/jobs/{job_id}")
def get_job_status(job_id: str):
    """Polls progress of an active or completed SAR processing job."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    
    return {
        "jobId": job["jobId"],
        "status": job["status"],
        "progress": job["progress"],
        "currentStage": job["currentStage"],
        "stages": job["stages"],
        "error": job.get("error"),
        "hasResult": job.get("result") is not None
    }


@app.get("/api/sar/results/{job_id}")
def get_job_results(job_id: str):
    """Retrieves full GeoJSON candidate objects, radiometric stats, and raster overlays."""
    job = job_manager.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found")
    if job["status"] != "COMPLETE":
        raise HTTPException(status_code=400, detail=f"Job {job_id} is not complete (current status: {job['status']})")
    
    return job["result"]


@app.post("/api/investigations/from-sar")
def create_investigation_from_sar(req: CreateInvestigationRequest):
    """
    Transforms a processed SAR candidate into a full AquaTrace investigation dossier,
    ready to bind to NOAA GFS metocean, backward Lagrangian drift, and real AIS correlation.
    """
    job = job_manager.get_job(req.jobId)
    if not job or job["status"] != "COMPLETE":
        raise HTTPException(status_code=400, detail="Valid completed SAR job required.")

    result = job["result"]
    candidates = result.get("candidates", [])
    if not candidates:
        raise HTTPException(status_code=400, detail="No candidate dark features detected in scene.")

    # Select candidate
    selected = None
    if req.candidateId:
        for c in candidates:
            if c["id"] == req.candidateId:
                selected = c
                break
    if not selected:
        selected = candidates[0]

    scene = result["scene"]
    prod_id = scene.get("productId", "S1A-UNKNOWN")
    acq_time = scene.get("acquisitionStart", "2026-03-24T00:40:58Z")
    
    # Generate canonical incident
    short_date = acq_time[:10].replace("-", "")
    incident_id = f"AT-SAR-{short_date}-{req.jobId[-4:]}"

    return {
        "incidentId": incident_id,
        "status": "ACTIVE_INVESTIGATION",
        "provenanceTier": "REAL_OBSERVATION",
        "isSyntheticDemo": False,
        "sceneId": scene.get("productName", prod_id),
        "sourceUrl": scene.get("downloadUrl"),
        "quicklookUrl": scene.get("quicklookUrl"),
        "acquisitionTime": acq_time,
        "platform": scene.get("platform", "SENTINEL-1A"),
        "polarization": scene.get("polarization", "VV+VH"),
        "sarProcessingEngine": result.get("engineVersion"),
        "provenanceHash": result.get("provenanceHash"),
        "selectedCandidate": selected,
        "slickObservation": {
            "coordinates": [selected["centroid"]["lat"], selected["centroid"]["lon"]],
            "areaKm2": selected["areaKm2"],
            "perimeterKm": selected["perimeterKm"],
            "orientationDeg": selected["orientationDeg"],
            "aspectRatio": selected["aspectRatio"],
            "lengthKm": selected["lengthKm"],
            "widthKm": selected["widthKm"],
            "dampingRatioDb": selected["dampingContrastDb"],
            "meanSigma0Db": selected["meanSigma0Db"],
            "lookAlikeRisk": selected["lookAlikeRisk"],
            "classification": selected["classification"],
            "evidenceScore": selected["evidenceScore"],
            "polygon": selected["geometry"]["coordinates"][0]
        },
        "environmentalContext": result.get("environmentalContext"),
        "visualizations": result.get("visualizations"),
        "investigatorNotice": (
            f"REAL SENTINEL-1 PIXEL PROCESSING VERIFIED. Investigation initialized from candidate {selected['id']} "
            f"extracted via adaptive SAR backscatter segmentation ({result['engineVersion']}). "
            f"Measured Area: {selected['areaKm2']} km², Damping Contrast: {selected['dampingContrastDb']} dB. "
            f"Provenance Hash: {result.get('provenanceHash')}."
        )
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
