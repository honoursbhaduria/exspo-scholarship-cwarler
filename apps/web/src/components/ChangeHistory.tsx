import React from 'react';
import { History, ArrowRight, ShieldAlert } from 'lucide-react';
import { VersionItem } from '../types';

interface Props {
  versions: VersionItem[];
}

export const ChangeHistory: React.FC<Props> = ({ versions }) => {
  if (!versions || versions.length <= 1) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border">
        <History className="w-8 h-8 mx-auto text-slate-400 mb-2" />
        <div>Initial version recorded (v1). No subsequent changes detected yet.</div>
        <div className="text-xs text-slate-400 mt-1">Run <code>python scripts/replay_change.py</code> to simulate changes.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-xs text-slate-500 border-b pb-2">
        Immutable Version History: Preserving both previous and updated states across repeated crawl runs.
      </div>

      <div className="space-y-3">
        {versions.map((ver, idx) => {
          const isLatest = idx === 0;
          return (
            <div
              key={ver.id}
              className={`p-4 rounded-xl border ${
                isLatest ? 'bg-sky-50/50 border-sky-200' : 'bg-white border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">Version {ver.version_number}</span>
                  {isLatest && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded">
                      Current Active State
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(ver.valid_from).toLocaleString()}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-400">Closing Date: </span>
                  <span className="font-medium text-slate-800">{ver.payload_json?.closing_date || 'N/A'}</span>
                </div>
                <div className="bg-white p-2 rounded border border-slate-100">
                  <span className="text-slate-400">Amount: </span>
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
