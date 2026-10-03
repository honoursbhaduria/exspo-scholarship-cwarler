import React from 'react';
import { ExternalLink, Hash, Quote, BookmarkCheck } from 'lucide-react';
import { EvidenceItem } from '../types';

interface Props {
  evidence: EvidenceItem[];
  officialUrl: string;
}

export const EvidenceViewer: React.FC<Props> = ({ evidence, officialUrl }) => {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border">
        No evidence items registered for this scholarship.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b">
        <span>Traceable Audit Chain: Field $\rightarrow$ Quote $\rightarrow$ Snapshot Hash $\rightarrow$ Official URL</span>
        <a
          href={officialUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:text-sky-700 flex items-center gap-1 font-medium"
        >
          View Live Source <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid gap-3">
        {evidence.map((item) => (
          <div key={item.id} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded">
                {item.field_name.replace('_', ' ')}
              </span>
              <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                <Hash className="w-3 h-3 text-slate-400" />
                Snapshot: {item.snapshot_hash.slice(0, 12)}...
              </span>
            </div>

            <div className="text-xs text-slate-600">
              <span className="font-semibold text-slate-700">Extracted Value: </span>
              <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {item.extracted_value}
              </span>
            </div>

            <div className="bg-white border border-slate-200 rounded p-2.5 text-xs text-slate-800 italic relative">
              <Quote className="w-3.5 h-3.5 text-slate-300 absolute top-2 left-2" />
              <div className="pl-4">"{item.quote}"</div>
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
