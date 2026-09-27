import React, { useState } from 'react';
import { defaultConfig } from '../../services/attributionEngine';
import { Sliders, Save, CheckCircle2, RotateCcw, ShieldCheck, Database, Radio } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [weights, setWeights] = useState(defaultConfig.weights);
  const [abstentionThreshold, setAbstentionThreshold] = useState(defaultConfig.abstentionThreshold);
  const [lookAlikeCutoff, setLookAlikeCutoff] = useState(defaultConfig.lookAlikeCutoff);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setWeights(defaultConfig.weights);
    setAbstentionThreshold(defaultConfig.abstentionThreshold);
    setLookAlikeCutoff(defaultConfig.lookAlikeCutoff);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '24px', backgroundColor: 'var(--bg-body)' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-blue">SYSTEM CONFIGURATION</span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                OPERATIONAL EVIDENCE PARAMETERS
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
              Attribution Model Tuning & Governance Controls
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handleReset} className="btn btn-secondary btn-sm">
              <RotateCcw size={13} /> Reset Defaults
            </button>
            <button onClick={handleSave} className="btn btn-primary btn-sm">
              {isSaved ? <CheckCircle2 size={13} /> : <Save size={13} />}
              {isSaved ? 'Parameters Saved' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Evidence Channel Weights Card */}
        <div className="gis-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
            Composite Evidence Channel Weights
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            Controls the relative weight assigned to each analytical channel when fusing multi-source evidence into an operational composite evidence score.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { key: 'satellite', label: 'Satellite Radar Contrast & SAR Mask (20%)', val: weights.satellite },
              { key: 'drift', label: 'Lagrangian Drift Hindcast Spacetime Fit (25%)', val: weights.drift },
              { key: 'ais', label: 'AIS Spacetime Proximity to Origin Apex (20%)', val: weights.ais },
              { key: 'behaviour', label: 'Speed Drop & Kinematic Anomaly (10%)', val: weights.behaviour },
              { key: 'counterfactual', label: 'In-Silico Counterfactual IoU Match (20%)', val: weights.counterfactual },
              { key: 'history', label: 'Port State Control & Compliance History (5%)', val: weights.history },
            ].map(({ key, label, val }) => (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>
                    {Math.round(val * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.50"
                  step="0.05"
                  value={val}
                  onChange={(e) =>
                    setWeights({ ...weights, [key]: parseFloat(e.target.value) })
                  }
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Abstention & Look-Alike Thresholds */}
        <div className="gis-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
            Uncertainty & Principled Abstention Cutoffs
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Defines the threshold where AquaTrace must declare INCONCLUSIVE to prevent unverified allegations.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                MINIMUM SCORE FOR ATTRIBUTION
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                {abstentionThreshold}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Scores below this trigger automatic INCONCLUSIVE verdict.
              </div>
            </div>

            <div style={{ padding: '14px', backgroundColor: 'var(--bg-subtle)', borderRadius: '4px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>
                LOOK-ALIKE RISK CUTOFF
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--spill-amber)', fontFamily: 'var(--font-mono)' }}>
                {Math.round(lookAlikeCutoff * 100)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Biogenic / sediment risk above this enforces field sampling advisory.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
