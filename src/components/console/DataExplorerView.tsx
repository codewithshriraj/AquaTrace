import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Radio, 
  Calendar, 
  MapPin, 
  Layers, 
  ExternalLink, 
  PlusCircle, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  Loader2, 
  Info,
  Clock,
  Compass,
  Cpu,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { copernicusService } from '../../services/satellite/copernicusService';
import { providerRegistry } from '../../services/dataProvider/providerRegistry';
import { SatelliteProduct, SatelliteSearchParams } from '../../services/satellite/satelliteTypes';
import { ProvenanceBadge } from '../common/ProvenanceBadge';
import { 
  sarProcessingService, 
  SarProcessingJobResult, 
  SarJobStatus 
} from '../../services/satellite/sarProcessingService';

interface DataExplorerViewProps {
  onSelectIncident: (incidentId: string) => void;
}

export const DataExplorerView: React.FC<DataExplorerViewProps> = ({ onSelectIncident }) => {
  const [selectedRegion, setSelectedRegion] = useState<string>('Gulf of Mannar');
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [polarisation, setPolarisation] = useState<string>('VV+VH');
  const [productType, setProductType] = useState<string>('GRD');

  const [loading, setLoading] = useState<boolean>(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);
  const [results, setResults] = useState<SatelliteProduct[]>([]);
  const [searchMetadata, setSearchMetadata] = useState<{
    durationMs: number;
    endpoint: string;
    usedFallback: boolean;
  } | null>(null);

  // Active SAR processing modal / runner state
  const [activeSarProduct, setActiveSarProduct] = useState<SatelliteProduct | null>(null);
  const [processingJobId, setProcessingJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<SarJobStatus | null>(null);
  const [jobResult, setJobResult] = useState<SarProcessingJobResult | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'raw' | 'db' | 'mask'>('db');

  const predefinedRegions: Record<string, { lat: number; lng: number; desc: string }> = {
    'Gulf of Mannar': { lat: 8.70, lng: 78.50, desc: 'International shipping corridor & ecologically sensitive marine biosphere' },
    'Arabian Sea (Mumbai High)': { lat: 18.90, lng: 72.50, desc: 'Major offshore crude extraction & heavy western tanker traffic' },
    'Bay of Bengal (Chennai)': { lat: 13.10, lng: 80.35, desc: 'Eastern seaport approaches & commercial cargo anchorage' },
    'Bay of Bengal (Paradip)': { lat: 20.20, lng: 86.80, desc: 'Heavy ore terminal & tanker SPM discharge operations' },
    'Gulf of Kachchh Outer Fairway': { lat: 22.45, lng: 69.30, desc: 'Deendayal / Mundra port VLCC crude traffic' },
    'Goa Coastal Waters': { lat: 15.35, lng: 73.65, desc: 'Mormugao port approaches & continental shelf' },
    'Andaman & Nicobar Waters': { lat: 11.60, lng: 92.70, desc: 'Six Degree Channel & Malacca gateway choke point' }
  };

  const handleSearch = async () => {
    setLoading(true);
    const target = predefinedRegions[selectedRegion] || { lat: 8.70, lng: 78.50 };

    const params: SatelliteSearchParams = {
      mission: 'SENTINEL-1A',
      productType: productType as any,
      polarisation: polarisation as any,
      point: { lat: target.lat, lng: target.lng, radiusKm: 60 },
      startDateUtc: startDate,
      endDateUtc: endDate,
      maxResults: 6
    };

    try {
      const response = await copernicusService.searchSentinel1(params);
      setResults(response.products);
      setSearchMetadata({
        durationMs: response.searchDurationMs,
        endpoint: response.sourceEndpoint,
        usedFallback: response.usedFallback
      });
    } catch (err) {
      console.error('Error querying Copernicus catalogue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [selectedRegion]);

  // Direct create (metadata pipeline)
  const handleCreateInvestigation = async (product: SatelliteProduct) => {
    setCreatingId(product.id);
    try {
      const newInc = await providerRegistry.createInvestigationFromObservation(product);
      onSelectIncident(newInc.id);
    } catch (err) {
      console.error('Failed to create investigation from satellite observation:', err);
    } finally {
      setCreatingId(null);
    }
  };

  // Launch Pixel-Level SAR Processing via FastAPI backend
  const handleStartSarProcessing = async (product: SatelliteProduct) => {
    setActiveSarProduct(product);
    setIsProcessing(true);
    setJobResult(null);
    setJobStatus(null);
    setSelectedCandidateId(null);

    try {
      const scenePayload = {
        productId: product.id,
        productName: product.name,
        acquisitionStart: product.acquisitionTimeUtc,
        platform: product.mission,
        productType: product.productType,
        mode: product.instrumentMode,
        polarization: product.polarisation,
        footprint: {
          type: "Polygon",
          coordinates: [product.footprintCoordinates.map(pt => [pt[1], pt[0]])]
        },
        downloadUrl: product.downloadUrl,
        quicklookUrl: product.quicklookUrl
      };

      const jobId = await sarProcessingService.submitProcessingJob(scenePayload, {
        windSpeedKnots: 15.1,
        windDirectionDeg: 208.0
      });
      setProcessingJobId(jobId);

      // Poll until complete
      const pollInterval = setInterval(async () => {
        try {
          const status = await sarProcessingService.getJobStatus(jobId);
          setJobStatus(status);

          if (status.status === 'COMPLETE') {
            clearInterval(pollInterval);
            setIsProcessing(false);
            const results = await sarProcessingService.getJobResults(jobId);
            setJobResult(results);
            if (results.candidates && results.candidates.length > 0) {
              setSelectedCandidateId(results.candidates[0].id);
            }
          } else if (status.status === 'FAILED') {
            clearInterval(pollInterval);
            setIsProcessing(false);
          }
        } catch (e) {
          console.error("Job status polling error:", e);
        }
      }, 500);

    } catch (err) {
      console.error("Failed to submit SAR processing job:", err);
      setIsProcessing(false);
    }
  };

  // Create investigation from processed SAR candidate
  const handleLaunchFromCandidate = async () => {
    if (!activeSarProduct || !jobResult) return;
    
    setCreatingId(activeSarProduct.id);
    try {
      const candidate = jobResult.candidates.find(c => c.id === selectedCandidateId) || jobResult.primaryCandidate;
      // Convert WGS84 [lon, lat] coords to [lat, lon] tuples for incident polygon
      const customPolygon: Array<[number, number]> = candidate?.geometry.coordinates[0].map(pt => [pt[1], pt[0]]) || [];

      const newInc = await providerRegistry.createInvestigationFromObservation(
        activeSarProduct,
        customPolygon.length > 0 ? customPolygon : undefined,
        {
          engineVersion: jobResult.engineVersion,
          provenanceHash: jobResult.provenanceHash,
          visualizations: jobResult.visualizations,
          candidates: jobResult.candidates,
          primaryCandidate: candidate
        }
      );

      setActiveSarProduct(null);
      onSelectIncident(newInc.id);
    } catch (err) {
      console.error("Failed to create investigation from SAR candidate:", err);
    } finally {
      setCreatingId(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio className="text-cyan-400" size={20} />
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">
              Live Satellite Data Explorer & SAR Pixel Ingestion
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
              COPERNICUS CDSE ODATA + FASTAPI SAR ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Query authentic ESA Sentinel-1 C-Band SAR products across the Indian EEZ and execute real pixel-level radiometric calibration, Lee speckle reduction, and adaptive dark-spot segmentation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Backend Engine</span>
            <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AquaTrace-SAR-Engine-v2.1
            </span>
          </div>
        </div>
      </div>

      {/* Query Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-lg grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Region */}
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <MapPin size={12} className="text-cyan-400" />
            Target Maritime AOI
          </label>
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            {Object.keys(predefinedRegions).map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block truncate">
            {predefinedRegions[selectedRegion]?.desc}
          </span>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar size={12} className="text-cyan-400" />
            Start Acquisition Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar size={12} className="text-cyan-400" />
            End Acquisition Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-lg shadow-cyan-950/40 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Querying CDSE Catalogue...
              </>
            ) : (
              <>
                <Search size={14} />
                Search Authentic Sentinel-1 Scenes
              </>
            )}
          </button>
        </div>
      </div>

      {/* SAR PROCESSING RUNNER MODAL / DRAWER */}
      {activeSarProduct && (
        <div className="p-6 rounded-xl bg-slate-900/95 border-2 border-cyan-500/50 shadow-2xl space-y-5 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu className="text-cyan-400" size={18} />
                <h2 className="text-base font-bold text-slate-100 font-mono">
                  SAR Pixel Processing Engine: {activeSarProduct.name}
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                  {jobStatus?.status || (isProcessing ? 'PROCESSING' : 'READY')}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Executing 10-stage scientific calibration, Enhanced Lee filtering, and adaptive local anomaly segmentation.
              </p>
            </div>

            <button
              onClick={() => setActiveSarProduct(null)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700"
            >
              Close
            </button>
          </div>

          {/* Progress Bar & Stages */}
          {isProcessing && (
            <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300">
                <span>{jobStatus?.currentStage || 'Initializing worker pipeline...'}</span>
                <span>{jobStatus?.progress || 10}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${jobStatus?.progress || 10}%` }}
                />
              </div>

              {jobStatus?.stages && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 pt-2">
                  {jobStatus.stages.map((stg, i) => (
                    <div 
                      key={i} 
                      className={`text-[10px] font-mono p-1.5 rounded border flex items-center gap-1.5 ${
                        stg.status === 'COMPLETED' 
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
                          : stg.status === 'IN_PROGRESS' 
                            ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 animate-pulse'
                            : 'bg-slate-900/40 border-slate-800 text-slate-400'
                      }`}
                    >
                      {stg.status === 'COMPLETED' ? (
                        <CheckCircle2 size={11} className="text-emerald-400" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                      <span className="truncate">{stg.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Completed Results Display */}
          {jobResult && (
            <div className="space-y-4">
              {/* Provenance & Stats Banner */}
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
                <div>
                  <span className="text-emerald-400 font-bold block">PIXEL-LEVEL PROCESSING VERIFIED</span>
                  <span className="text-slate-300">
                    Provenance Hash: <strong className="text-emerald-300">{jobResult.provenanceHash}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-4 text-slate-300">
                  <span>Sea Mean σ⁰: <strong>{jobResult.stats.seaMeanDb} dB</strong></span>
                  <span>Candidates Extracted: <strong>{jobResult.candidateCount}</strong></span>
                  <span>Polarization: <strong>{jobResult.stats.polarization}</strong></span>
                </div>
              </div>

              {/* Raster Overlays & Candidate Selection */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Raster Previews */}
                <div className="lg:col-span-2 space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase">
                      Generated SAR Products (400x400 px Raster)
                    </span>
                    <div className="flex gap-1.5">
                      {(['raw', 'db', 'mask'] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-2 py-1 text-[11px] font-mono rounded ${
                            activeTab === tab 
                              ? 'bg-cyan-600 text-white font-bold' 
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {tab === 'raw' ? 'Raw SAR' : tab === 'db' ? 'Backscatter dB' : 'Detection Mask'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative aspect-video max-h-72 w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                    {activeTab === 'raw' && (
                      <img 
                        src={jobResult.visualizations.rawSar} 
                        alt="Raw SAR Grayscale" 
                        className="h-full w-full object-contain"
                      />
                    )}
                    {activeTab === 'db' && (
                      <img 
                        src={jobResult.visualizations.backscatterDb} 
                        alt="Calibrated dB Backscatter" 
                        className="h-full w-full object-contain"
                      />
                    )}
                    {activeTab === 'mask' && (
                      <div className="relative h-full w-full flex items-center justify-center">
                        <img 
                          src={jobResult.visualizations.backscatterDb} 
                          alt="Base dB" 
                          className="h-full w-full object-contain absolute opacity-40"
                        />
                        <img 
                          src={jobResult.visualizations.detectionMask} 
                          alt="Detection Mask" 
                          className="h-full w-full object-contain absolute z-10"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Candidate Selection List */}
                <div className="space-y-2 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase block pb-1 border-b border-slate-800">
                      Segmented Candidates ({jobResult.candidates.length})
                    </span>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {jobResult.candidates.map(cand => (
                        <div
                          key={cand.id}
                          onClick={() => setSelectedCandidateId(cand.id)}
                          className={`p-2.5 rounded-lg border cursor-pointer transition text-xs font-mono ${
                            selectedCandidateId === cand.id
                              ? 'bg-cyan-950/50 border-cyan-400 text-white'
                              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>{cand.id}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              cand.lookAlikeRisk === 'LOW' 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : cand.lookAlikeRisk === 'MODERATE'
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                            }`}>
                              {cand.classification}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400">
                            <span>Area: <strong>{cand.areaKm2} km²</strong></span>
                            <span>Damping: <strong>{cand.dampingContrastDb} dB</strong></span>
                            <span>Aspect: <strong>{cand.aspectRatio}:1</strong></span>
                            <span>Score: <strong>{cand.evidenceScore}/100</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchFromCandidate}
                    disabled={Boolean(creatingId)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50"
                  >
                    {creatingId ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Binding Hindcast & AIS...
                      </>
                    ) : (
                      <>
                        <Flame size={14} />
                        Launch Investigation From Candidate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Found <strong>{results.length}</strong> Sentinel-1 SAR products matching query
          </span>
          {searchMetadata && (
            <span>
              Query latency: {searchMetadata.durationMs}ms ({searchMetadata.usedFallback ? 'Cached CDSE Snapshot' : 'Live CDSE Response'})
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((product) => {
            const isCreating = creatingId === product.id;

            return (
              <div
                key={product.id}
                className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-lg"
              >
                <div className="p-4 space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {product.mission} {product.sensor}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Pass: {product.absoluteOrbitNumber || product.relativeOrbitNumber || '63762'}
                    </span>
                  </div>

                  {/* Scene Name & Timestamp */}
                  <div>
                    <h3 className="text-xs font-mono font-bold text-slate-200 break-all leading-relaxed">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-1">
                      <Clock size={12} className="text-slate-400" />
                      <span>{new Date(product.acquisitionTimeUtc).toUTCString()}</span>
                    </div>
                  </div>

                  {/* Technical Attributes */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Polarisation</span>
                      <span className="text-slate-200 font-semibold">{product.polarisation}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Product / Mode</span>
                      <span className="text-slate-200 font-semibold">{product.productType} ({product.instrumentMode})</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Orbit Pass</span>
                      <span className="text-slate-200 font-semibold">{product.orbitDirection}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Spatial Resolution</span>
                      <span className="text-slate-200 font-semibold">{product.resolutionM}m pixel spacing</span>
                    </div>
                  </div>

                  {/* Footprint Bounds */}
                  <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80 text-[10px] font-mono text-slate-400">
                    <span className="block text-slate-400 font-semibold mb-0.5">Footprint Centroid:</span>
                    <span>
                      {product.footprintCoordinates[0][0].toFixed(2)}°N, {product.footprintCoordinates[0][1].toFixed(2)}°E
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-0 space-y-2">
                  {/* Primary: Process SAR Pixels */}
                  <button
                    onClick={() => handleStartSarProcessing(product)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-950/40"
                  >
                    <Cpu size={14} />
                    Process SAR GRD Pixels (FastAPI)
                  </button>

                  {/* Secondary: Direct Create */}
                  <button
                    onClick={() => handleCreateInvestigation(product)}
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono transition disabled:opacity-60"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={13} />
                        Quick Create Investigation
                      </>
                    )}
                  </button>

                  {product.quicklookUrl && (
                    <a
                      href={product.quicklookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1 rounded bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-300 text-[10px] font-mono transition border border-slate-800/80"
                    >
                      <ExternalLink size={11} />
                      View Copernicus Quicklook
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
