/**
 * AquaTrace SAR Processing Client Service
 * Connects frontend to Python FastAPI SAR processing backend.
 * Handles authentic Sentinel-1 GRD acquisition, asynchronous pixel processing,
 * adaptive dark-spot segmentation polling, and investigation creation.
 */

export interface SarBackendHealth {
  status: string;
  engineVersion: string;
  cdseAuthenticated: boolean;
  pixelLevelProcessingAvailable: boolean;
  activeJobs: number;
  capabilities: string[];
}

export interface SarCandidate {
  id: string;
  pixelCount: number;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  centroid: {
    lat: number;
    lon: number;
  };
  areaKm2: number;
  perimeterKm: number;
  lengthKm: number;
  widthKm: number;
  aspectRatio: number;
  orientationDeg: number;
  meanSigma0Db: number;
  minSigma0Db: number;
  backgroundSigma0Db: number;
  dampingContrastDb: number;
  evidenceScore: number;
  lookAlikeRisk: "LOW" | "MODERATE" | "HIGH";
  classification: "OIL_SPILL_CANDIDATE" | "POSSIBLE_OIL_LIKE_FEATURE" | "LIKELY_LOOK_ALIKE";
  primaryCall: string;
  detectedRisks: string[];
  evaluations: {
    windAssessment: string;
    wakeAssessment: string;
    coastalAssessment: string;
    dampingAssessment: string;
  };
}

export interface SarProcessingJobResult {
  jobId: string;
  engineVersion: string;
  provenanceHash: string;
  scene: any;
  stats: {
    seaMeanDb: number;
    seaStdDb: number;
    seaMedianDb: number;
    minDb: number;
    maxDb: number;
    polarization: string;
  };
  candidates: SarCandidate[];
  candidateCount: number;
  primaryCandidate: SarCandidate | null;
  visualizations: {
    rawSar: string;
    backscatterDb: string;
    detectionMask: string;
  };
  geoBounds: {
    minLon: number;
    minLat: number;
    maxLon: number;
    maxLat: number;
  };
  environmentalContext: {
    windSpeedKnots: number;
    windDirectionDeg: number;
    source: string;
  };
}

export interface SarJobStatus {
  jobId: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETE" | "FAILED";
  progress: number;
  currentStage: string;
  stages: Array<{ name: string; status: string }>;
  error?: string;
  hasResult: boolean;
}

const BACKEND_BASE_URL = "http://127.0.0.1:8000";

class SarProcessingService {
  private isAvailable: boolean | null = null;

  async checkHealth(): Promise<SarBackendHealth | null> {
    try {
      const resp = await fetch(`${BACKEND_BASE_URL}/api/health/sar`, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(3000)
      });
      if (resp.ok) {
        this.isAvailable = true;
        return await resp.json();
      }
      this.isAvailable = false;
      return null;
    } catch {
      this.isAvailable = false;
      return null;
    }
  }

  isBackendAvailable(): boolean {
    return this.isAvailable === true;
  }

  async searchScenes(
    minLon: number,
    minLat: number,
    maxLon: number,
    maxLat: number,
    startDate: string,
    endDate: string
  ): Promise<any[]> {
    try {
      const resp = await fetch(`${BACKEND_BASE_URL}/api/sar/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          minLon,
          minLat,
          maxLon,
          maxLat,
          startDate,
          endDate,
          maxResults: 10
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data.products || [];
      }
    } catch (e) {
      console.warn("Backend search failed, fallback to local Copernicus service:", e);
    }
    return [];
  }

  async submitProcessingJob(scene: any, config?: any): Promise<string> {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/sar/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scene,
        config: config || { windSpeedKnots: 15.1, windDirectionDeg: 208.0 }
      })
    });
    if (!resp.ok) {
      throw new Error(`Failed to submit SAR processing job: HTTP ${resp.status}`);
    }
    const data = await resp.json();
    return data.jobId;
  }

  async getJobStatus(jobId: string): Promise<SarJobStatus> {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/sar/jobs/${jobId}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch job status: HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  async getJobResults(jobId: string): Promise<SarProcessingJobResult> {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/sar/results/${jobId}`);
    if (!resp.ok) {
      throw new Error(`Failed to fetch job results: HTTP ${resp.status}`);
    }
    return await resp.json();
  }

  async createInvestigationFromSar(jobId: string, candidateId?: string): Promise<any> {
    const resp = await fetch(`${BACKEND_BASE_URL}/api/investigations/from-sar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, candidateId })
    });
    if (!resp.ok) {
      throw new Error(`Failed to create investigation: HTTP ${resp.status}`);
    }
    return await resp.json();
  }
}

export const sarProcessingService = new SarProcessingService();
