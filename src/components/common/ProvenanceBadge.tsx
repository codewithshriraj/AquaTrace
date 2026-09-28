import React from 'react';
import { ProvenanceClassification, getProvenanceBadgeConfig } from '../../services/dataProvider/provenance';

interface ProvenanceBadgeProps {
  classification: ProvenanceClassification;
  sourceText?: string;
  timestampUtc?: string;
  latencyText?: string;
  compact?: boolean;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  classification,
  sourceText,
  timestampUtc,
  latencyText,
  compact = false
}) => {
  const config = getProvenanceBadgeConfig(classification);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-semibold border ${config.bgClass}`}
        title={`${config.desc} ${sourceText ? `• Source: ${sourceText}` : ''}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
        <span>{config.label}</span>
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded border text-[11px] font-mono ${config.bgClass}`}
      title={config.desc}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      <span className="font-bold tracking-tight">{config.label}</span>
      {sourceText && (
        <>
          <span className="opacity-40">•</span>
          <span className="opacity-90">{sourceText}</span>
        </>
      )}
      {latencyText && (
        <>
          <span className="opacity-40">•</span>
          <span className="text-[10px] text-amber-300 font-medium">{latencyText}</span>
        </>
      )}
      {timestampUtc && (
        <>
          <span className="opacity-40">•</span>
          <span className="opacity-75 text-[10px]">{timestampUtc.slice(11, 19)} UTC</span>
        </>
      )}
    </div>
  );
};
