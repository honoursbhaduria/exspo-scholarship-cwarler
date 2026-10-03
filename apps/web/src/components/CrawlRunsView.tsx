import React, { useState, useEffect } from 'react';
import {
  HugeiconsIcon,
  RefreshIcon,
  Activity01Icon,
  CheckmarkCircle02Icon,
} from './ui/icons';
import { CrawlRun } from '../types';

export const CrawlRunsView: React.FC = () => {
  const [runs, setRuns] = useState<CrawlRun[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRuns = () => {
    setLoading(true);
    fetch('/api/v1/crawl-runs')
      .then((r) => r.json())
      .then((data) => setRuns(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  return (
    <div className="clay-card p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pipeline Execution Runs</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Traceable audit of discovery, crawling, extraction, and verification batch jobs.
          </p>
        </div>
        <button
          onClick={fetchRuns}
          className="p-2.5 border border-slate-200 rounded-2xl bg-white/80 hover:bg-white text-slate-700 clay-pill transition"
          title="Refresh"
        >
          <HugeiconsIcon icon={RefreshIcon} size={16} />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading crawl runs...</div>
      ) : runs.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs">No crawl runs recorded.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/40">
          <table className="w-full text-left text-xs sm:text-sm text-slate-600">
            <thead className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/60">
              <tr>
                <th className="py-3 px-4">Run ID & Started</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Crawled</th>
                <th className="py-3 px-4">Extracted</th>
                <th className="py-3 px-4">Verified</th>
                <th className="py-3 px-4">Changes</th>
                <th className="py-3 px-4">Errors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {runs.map((r) => (
                <tr key={r.id} className="hover:bg-white/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-xs">
                    <div className="font-bold text-slate-800">{r.id.slice(0, 8)}...</div>
                    <div className="text-slate-400 text-[11px]">{new Date(r.started_at).toLocaleString()}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                          : r.status === 'RUNNING'
                          ? 'bg-slate-100 text-slate-800 animate-pulse border border-slate-300'
                          : 'bg-rose-50 text-rose-800 border border-rose-200/80'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">{r.pages_crawled}</td>
                  <td className="py-3.5 px-4 font-mono">{r.records_extracted}</td>
                  <td className="py-3.5 px-4 font-mono text-emerald-700 font-bold">{r.records_verified}</td>
                  <td className="py-3.5 px-4 font-mono text-amber-700 font-bold">{r.changes_detected}</td>
                  <td className="py-3.5 px-4 font-mono text-rose-600">{r.error_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
