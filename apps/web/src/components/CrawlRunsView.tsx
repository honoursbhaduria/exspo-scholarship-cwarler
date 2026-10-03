import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Pipeline Execution Runs</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Traceable audit of discovery, crawling, extraction, and verification batch jobs.
          </p>
        </div>
        <button
          onClick={fetchRuns}
          className="p-2 border rounded-xl hover:bg-slate-50 text-slate-600"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading crawl runs...</div>
      ) : runs.length === 0 ? (
        <div className="py-12 text-center text-slate-400">No crawl runs recorded.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b">
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
                <tr key={r.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-xs">
                    <div className="font-bold text-slate-800">{r.id.slice(0, 8)}...</div>
                    <div className="text-slate-400">{new Date(r.started_at).toLocaleString()}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        r.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === 'RUNNING'
                          ? 'bg-sky-100 text-sky-800 animate-pulse'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono">{r.pages_crawled}</td>
                  <td className="py-3 px-4 font-mono">{r.records_extracted}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600 font-bold">{r.records_verified}</td>
                  <td className="py-3 px-4 font-mono text-amber-600 font-bold">{r.changes_detected}</td>
                  <td className="py-3 px-4 font-mono text-rose-500">{r.error_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
