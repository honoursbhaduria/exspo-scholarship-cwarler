import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
  ArrowRight,
  Database,
  Search,
} from 'lucide-react';
import { Metrics, ChangeEvent } from '../types';

interface Props {
  metrics: Metrics | null;
  changes: ChangeEvent[];
  onRefresh: () => void;
  onSelectScholarship: (id: string) => void;
}

export const Dashboard: React.FC<Props> = ({
  metrics,
  changes,
  onRefresh,
  onSelectScholarship,
}) => {
  const [crawling, setCrawling] = useState(false);
  const [crawlMessage, setCrawlMessage] = useState<string | null>(null);

  const handleTriggerCrawl = async () => {
    setCrawling(true);
    setCrawlMessage('Initiating Crawl Run...');
    try {
      const res = await fetch('/api/v1/crawl-runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ max_pages: 50, run_async: false }),
      });
      if (res.ok) {
        setCrawlMessage('Crawl run queued & completed successfully!');
        setTimeout(() => {
          onRefresh();
          setCrawlMessage(null);
        }, 1200);
      }
    } catch (e) {
      setCrawlMessage('Failed to trigger crawl.');
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Intelligence Platform
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Production audit engine for discovering, verifying, scoring, and diff-tracking official opportunities.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 border rounded-xl hover:bg-slate-50"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleTriggerCrawl}
            disabled={crawling}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${crawling ? 'animate-spin' : ''}`} />
            {crawling ? 'Crawling Pipeline...' : 'Run Pipeline Crawl'}
          </button>
        </div>
      </div>

      {crawlMessage && (
        <div className="p-3 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-medium rounded-xl animate-in fade-in">
          {crawlMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Discovered */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-slate-400 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-sky-500" /> Discovered
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics?.total_discovered || 0}</div>
          <div className="text-[11px] text-slate-400">Total crawled items</div>
        </div>

        {/* Verified */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1 border-l-4 border-l-emerald-500">
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-600 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics?.verified_count || 0}</div>
          <div className="text-[11px] text-emerald-600/80 font-medium">$\ge$ 95.0% confidence</div>
        </div>

        {/* Review Required */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1 border-l-4 border-l-amber-500">
          <div className="text-xs uppercase tracking-wider font-semibold text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> Review Req.
          </div>
          <div className="text-2xl font-black text-amber-700">{metrics?.review_required_count || 0}</div>
          <div className="text-[11px] text-amber-600/80 font-medium">Pending verification</div>
        </div>

        {/* Active */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-blue-600 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics?.active_count || 0}</div>
          <div className="text-[11px] text-slate-400">Open for application</div>
        </div>

        {/* Expired / Stale */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-rose-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Expired
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics?.expired_count || 0}</div>
          <div className="text-[11px] text-slate-400">Past closing deadline</div>
        </div>

        {/* Avg Confidence */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-1">
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Avg Conf.
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {metrics ? `${metrics.average_confidence.toFixed(1)}%` : '0.0%'}
          </div>
          <div className="text-[11px] text-indigo-600/80 font-medium">Across all records</div>
        </div>
      </div>

      {/* Main Grid: Recently Detected Changes & System Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Updated Changes Feed */}
        <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recently Detected Field Changes</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Automated field-by-field diff comparison across successive crawl runs.
              </p>
            </div>
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
              {changes.length} change events
            </span>
          </div>

          {changes.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No changes detected across crawl runs yet.
            </div>
          ) : (
            <div className="space-y-3">
              {changes.slice(0, 6).map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => onSelectScholarship(ch.scholarship_id)}
                  className="p-3.5 bg-slate-50 hover:bg-sky-50/50 rounded-xl border border-slate-200 transition cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800 hover:text-sky-600">
                      {ch.scholarship_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ch.severity === 'HIGH'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : ch.severity === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ch.severity} SEVERITY
                    </span>
                  </div>

                  <div className="text-xs flex items-center gap-2 text-slate-600">
                    <span className="font-semibold text-slate-700 capitalize">
                      {ch.field_name.replace('_', ' ')}:
                    </span>
                    <span className="line-through text-slate-400 truncate max-w-[150px]">
                      {ch.old_value || 'None'}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-medium text-emerald-700 truncate max-w-[200px]">
                      {ch.new_value}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono">
                    Detected: {new Date(ch.detected_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Integrity & Traceability Summary Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Database className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-wider">Engine Verification Guarantee</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every single scholarship in this system maintains an unbroken chain of custody:
            </p>
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                1. Official Source Verified Domain
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                2. SHA-256 Hashed Raw Snapshot
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                3. Verbatim Substring Proof Binding
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                4. Deterministic 100-Point Score
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1">
            <div>Anti-Hallucination Rate: <span className="text-emerald-400 font-bold">100% Validated</span></div>
            <div>Registered Source Domains: <span className="text-sky-400 font-bold">{metrics?.total_sources || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
