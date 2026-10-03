import React from 'react';
import {
  HugeiconsIcon,
  ArrowUpRight01Icon,
  QuoteDownIcon,
  FingerPrintIcon,
} from './ui/icons';
import { EvidenceItem } from '../types';

interface Props {
  evidence: EvidenceItem[];
  officialUrl: string;
}

export const EvidenceViewer: React.FC<Props> = ({ evidence, officialUrl }) => {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white/60 rounded-2xl border border-slate-200/60">
        No evidence items registered for this scholarship.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200/60">
        <span>Field-Level Evidence Audit Binding</span>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-800 hover:text-slate-900 underline flex items-center gap-1 font-medium"
        >
          <span>View Primary Source</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
        </a>
      </div>

      <div className="grid gap-3">
        {evidence.map((item) => (
          <div key={item.id} className="bg-white/70 border border-slate-200/70 rounded-2xl p-4 space-y-2.5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-800 bg-slate-100 border border-slate-200/80 px-2.5 py-0.5 rounded-lg">
                {item.field_name.replace('_', ' ')}
              </span>
              <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                <HugeiconsIcon icon={FingerPrintIcon} size={13} className="text-slate-400" />
                <span>SHA-256: {item.snapshot_hash.slice(0, 12)}...</span>
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Extracted Value: </span>
              <span className="font-mono bg-white px-2 py-0.5 rounded-lg border border-slate-200/80 text-slate-900 font-medium">
                {item.extracted_value}
              </span>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3 text-xs text-slate-800 italic relative">
              <div className="flex items-start gap-2">
                <HugeiconsIcon icon={QuoteDownIcon} size={14} className="text-slate-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">"{item.quote}"</div>
              </div>
            </div>

            {item.char_start !== null && (
              <div className="text-[11px] text-slate-400 font-mono">
                Verified substring offsets: [{item.char_start} : {item.char_end}]
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
