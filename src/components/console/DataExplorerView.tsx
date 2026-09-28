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
  Compass
} from 'lucide-react';
import { copernicusService } from '../../services/satellite/copernicusService';
import { providerRegistry } from '../../services/dataProvider/providerRegistry';
import { SatelliteProduct, SatelliteSearchParams } from '../../services/satellite/satelliteTypes';
import { ProvenanceBadge } from '../common/ProvenanceBadge';

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

  const handleCreateInvestigation = async (product: SatelliteProduct) => {
    setCreatingId(product.id);
    try {
      const newInc = await providerRegistry.createInvestigationFromObservation(product);
      // Seamlessly navigate to the newly created real-data incident
      onSelectIncident(newInc.id);
    } catch (err) {
      console.error('Failed to create investigation from satellite observation:', err);
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
              Live Satellite Data Explorer & AOI Ingestion
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-semibold">
              COPERNICUS CDSE ODATA
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Query genuine ESA Sentinel-1 C-Band SAR products across the Indian EEZ and launch end-to-end forensic investigations from real satellite scenes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Catalogue Endpoint</span>
            <span className="text-xs font-mono text-cyan-300">dataspace.copernicus.eu</span>
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
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
          >
            {Object.keys(predefinedRegions).map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
          <span className="text-[10px] text-slate-400 mt-1 block truncate">
            {predefinedRegions[selectedRegion]?.desc}
          </span>
        </div>

        {/* Date Range Start */}
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar size={12} className="text-emerald-400" />
            Acquisition Start (UTC)
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Date Range End */}
        <div>
          <label className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-1.5 flex items-center gap-1.5">
            <Calendar size={12} className="text-emerald-400" />
            Acquisition End (UTC)
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Search Action */}
        <div className="flex items-end">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-md shadow-cyan-900/30 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Querying Catalogue...
              </>
            ) : (
              <>
                <Search size={14} />
                Search Copernicus OData
              </>
            )}
          </button>
        </div>
      </div>

      {/* Query Status Banner */}
      {searchMetadata && (
        <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-slate-900/70 border border-slate-800 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle size={13} className="text-emerald-400" />
            <span>Retrieved <strong>{results.length}</strong> matching Sentinel-1 products in <strong>{searchMetadata.durationMs}ms</strong></span>
          </div>
          <div className="text-[11px]">
            Source: <code className="text-cyan-300">{searchMetadata.endpoint}</code>
          </div>
        </div>
      )}

      {/* Results List */}
      <div className="space-y-4">
        <h2 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
          <span>Observed Satellite Products</span>
          <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px]">
            {results.length} Available
          </span>
        </h2>

        {results.length === 0 && !loading && (
          <div className="p-12 text-center rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400">
            <Info size={24} className="mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">No scenes found matching the current search parameters.</p>
            <p className="text-xs mt-1">Try expanding the date window or selecting another maritime AOI.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((product) => {
            const isCreating = creatingId === product.id;
            return (
              <div
                key={product.id}
                className="rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-lg overflow-hidden flex flex-col justify-between"
              >
                <div className="p-4 space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold">
                      {product.mission} • {product.sensor}
                    </span>
                    <ProvenanceBadge classification={product.provenance.classification} compact />
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
                  <button
                    onClick={() => handleCreateInvestigation(product)}
                    disabled={isCreating}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/40 disabled:opacity-60"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Initializing Investigation Dossier...
                      </>
                    ) : (
                      <>
                        <PlusCircle size={14} />
                        Create Investigation From Scene
                      </>
                    )}
                  </button>

                  {product.quicklookUrl && (
                    <a
                      href={product.quicklookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-mono transition"
                    >
                      <ExternalLink size={12} />
                      View Copernicus Browser Quicklook
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
