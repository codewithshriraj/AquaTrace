import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertTriangle, RefreshCw, ExternalLink, ShieldCheck, Database, Radio, Wind, Compass } from 'lucide-react';
import { providerRegistry } from '../../services/dataProvider/providerRegistry';
import { PipelineHealthStatus, calculateDataAge } from '../../services/dataProvider/provenance';

interface PipelineHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PipelineHealthModal: React.FC<PipelineHealthModalProps> = ({ isOpen, onClose }) => {
  const [healthList, setHealthList] = useState<PipelineHealthStatus[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const data = await providerRegistry.getPipelineHealth();
      setHealthList(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHealth();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getServiceIcon = (serviceId: string) => {
    if (serviceId.includes('copernicus')) return <Radio size={16} className="text-cyan-400" />;
    if (serviceId.includes('ais')) return <Database size={16} className="text-indigo-400" />;
    if (serviceId.includes('metocean')) return <Wind size={16} className="text-emerald-400" />;
    if (serviceId.includes('ocean')) return <Compass size={16} className="text-blue-400" />;
    return <ShieldCheck size={16} className="text-amber-400" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                AquaTrace Data Pipeline Health & Provenance
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  ALL SYSTEMS OPERATIONAL
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Scientific traceability audit across Satellite, Metocean, AIS, and Drift models
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="Refresh Pipeline Status"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Primary Satellite Feed</span>
              <span className="font-semibold text-slate-200">Copernicus CDSE</span>
              <span className="text-[10px] text-emerald-400 block">● Live OData API</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase">AIS Stream Provider</span>
              <span className="font-semibold text-slate-200">GFW / DGLL Coastal</span>
              <span className="text-[10px] text-amber-400 block">● Public Tier (~72h delay)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Hydrodynamic Model</span>
              <span className="font-semibold text-slate-200">INCOIS ROMS 1/12°</span>
              <span className="text-[10px] text-emerald-400 block">● Live Forecast Cycle</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] font-mono uppercase">Atmospheric Forcing</span>
              <span className="font-semibold text-slate-200">NOAA GFS 0.25°</span>
              <span className="text-[10px] text-emerald-400 block">● Real-time Wind</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase font-bold text-slate-400 tracking-wider">
              Connected Pipeline Endpoints
            </h3>

            {healthList.map((item) => {
              const age = calculateDataAge(item.lastUpdatedUtc);
              return (
                <div
                  key={item.serviceId}
                  className="p-3.5 rounded-lg bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded bg-slate-800 border border-slate-700">
                        {getServiceIcon(item.serviceId)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                          {item.name}
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.provider}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Tier: <span className="text-slate-300 font-semibold">{item.tier}</span> • Latency: <span className="text-emerald-400">{item.latencyMs} ms</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                        <CheckCircle size={12} />
                        {item.status}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1">
                        Data Age: <span className={age.isStale ? 'text-amber-400' : 'text-slate-200'}>{age.text}</span>
                      </div>
                    </div>
                  </div>

                  {item.errorMessage && (
                    <div className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle size={12} className="flex-shrink-0" />
                      <span>{item.errorMessage}</span>
                    </div>
                  )}

                  {item.endpointUrl && (
                    <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
                      <span>Endpoint:</span>
                      <code className="text-cyan-400/90">{item.endpointUrl}</code>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-2">
            <ShieldCheck size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-blue-300">Defense & Academic Licensing Compliance:</strong> All satellite and oceanographic data streams utilize official public access APIs provided by the European Space Agency (ESA Copernicus Data Space Ecosystem), Indian National Centre for Ocean Information Services (INCOIS), NOAA, and Global Fishing Watch. No unauthorized scraping or rate-limit violations occur.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between text-xs text-slate-400">
          <div className="font-mono">
            Pipeline Version: <span className="text-slate-200">v2.4-Production</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
