import React from 'react';
import {
  HugeiconsIcon,
  Time02Icon,
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
} from './ui/icons';
import { VersionItem } from '../types';

interface Props {
  versions: VersionItem[];
}

export const ChangeHistory: React.FC<Props> = ({ versions }) => {
  if (!versions || versions.length <= 1) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white/60 rounded-2xl border border-slate-200/60">
        <div className="w-10 h-10 mx-auto rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-2 border border-slate-200/70">
          <HugeiconsIcon icon={Time02Icon} size={20} />
        </div>
        <div className="font-semibold text-slate-800 text-sm">Initial version recorded (v1)</div>
        <div className="text-xs text-slate-400 mt-1">No subsequent changes detected yet across runs.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 border-b border-slate-200/60 pb-2">
        Immutable Version History: Preserving both previous and updated states across repeated crawl runs.
      </div>

      <div className="space-y-3">
        {versions.map((ver, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={ver.id}
              className={`p-4 rounded-2xl border ${
                isLatest
                  ? 'bg-white border-slate-300/80 shadow-xs'
                  : 'bg-white/60 border-slate-200/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900">Version {ver.version_number}</span>
                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded-full">
                      Current Active State
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(ver.valid_from).toLocaleString()}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400">Closing Date: </span>
                  <span className="font-medium text-slate-800">{ver.payload_json?.closing_date || 'N/A'}</span>
                </div>
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60">
                  <span className="text-slate-400">Benefit Amount: </span>
                  <span className="font-medium text-slate-800">
                    {ver.payload_json?.amount ? `₹${ver.payload_json.amount.toLocaleString()}` : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="mt-2 text-[11px] text-slate-400 font-mono truncate">
                Snapshot Content Hash: {ver.content_hash}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
