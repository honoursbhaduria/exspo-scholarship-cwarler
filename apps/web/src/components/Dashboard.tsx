import React, { useState } from 'react';
import {
  HugeiconsIcon,
  Compass01Icon,
  CheckmarkBadge01Icon,
  ShieldAlertIcon,
  CheckmarkCircle02Icon,
  HourglassIcon,
  Analytics01Icon,
  RefreshIcon,
  Database01Icon,
  ArrowRight01Icon,
} from './ui/icons';
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
        setCrawlMessage('Crawl run completed successfully!');
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
      {/* Top Banner / Actions Card */}
      <div className="clay-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Scholarship Intelligence Platform
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Continuous discovery, evidence verification, and version diff tracking for official Indian education schemes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 text-slate-600 hover:text-slate-900 rounded-2xl clay-pill bg-white/80 hover:bg-white transition"
            title="Refresh Metrics"
          >
            <HugeiconsIcon icon={RefreshIcon} size={18} />
          </button>
          <button
            onClick={handleTriggerCrawl}
            disabled={crawling}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-md transition"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={16}
              className={crawling ? 'animate-spin' : ''}
            />
            {crawling ? 'Crawling Pipeline...' : 'Run Pipeline Crawl'}
          </button>
        </div>
      </div>

      {crawlMessage && (
        <div className="p-3 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-800 text-xs font-medium rounded-2xl shadow-sm animate-in fade-in">
          {crawlMessage}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Discovered */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-500">
              Discovered
            </span>
            <HugeiconsIcon icon={Compass01Icon} size={22} className="text-slate-500 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {metrics?.total_discovered || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Total crawled items</div>
          </div>
        </div>

        {/* Verified */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-800">
              Verified
            </span>
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={22} className="text-emerald-600 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-800 font-mono tracking-tight">
              {metrics?.verified_count || 0}
            </div>
            <div className="text-[11px] text-emerald-700/80 font-medium mt-1">≥ 95.0% confidence</div>
          </div>
        </div>

        {/* Review Required */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-amber-800">
              Review Req.
            </span>
            <HugeiconsIcon icon={ShieldAlertIcon} size={22} className="text-amber-600 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-amber-800 font-mono tracking-tight">
              {metrics?.review_required_count || 0}
            </div>
            <div className="text-[11px] text-amber-700/80 font-medium mt-1">Flagged items</div>
          </div>
        </div>

        {/* Active */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
              Active
            </span>
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={22} className="text-slate-600 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {metrics?.active_count || 0}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Open applications</div>
          </div>
        </div>

        {/* Expired / Stale */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-rose-800">
              Expired
            </span>
            <HugeiconsIcon icon={HourglassIcon} size={22} className="text-rose-600 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-rose-800 font-mono tracking-tight">
              {metrics?.expired_count || 0}
            </div>
            <div className="text-[11px] text-rose-700/80 font-medium mt-1">Past deadline</div>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="clay-card p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-bold text-slate-600">
              Avg Conf.
            </span>
            <HugeiconsIcon icon={Analytics01Icon} size={22} className="text-slate-600 shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-slate-900 font-mono tracking-tight">
              {metrics ? `${metrics.average_confidence.toFixed(1)}%` : '0.0%'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">All opportunities</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recently Detected Changes & System Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Updated Changes Feed */}
        <div className="lg:col-span-2 clay-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recently Detected Field Changes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated field-by-field diff comparison across successive crawl runs.
              </p>
            </div>
            <span className="text-xs font-mono bg-white/80 border border-slate-200/80 px-2.5 py-1 rounded-xl text-slate-700 clay-pill">
              {changes.length} events
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
                  className="p-3.5 bg-white/60 hover:bg-white/90 rounded-2xl border border-white/80 transition cursor-pointer space-y-1.5 shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800 hover:text-slate-900">
                      {ch.scholarship_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        ch.severity === 'HIGH'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : ch.severity === 'MEDIUM'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
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
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-slate-400 shrink-0" />
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
        <div className="clay-card-dark text-white p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <HugeiconsIcon icon={Database01Icon} size={18} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Repository Audit Chain</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every funding opportunity in this repository maintains a complete audit trail:
            </p>
            <div className="space-y-2 text-xs text-slate-300 font-mono">
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                1. Official Source Domain Validation
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                2. SHA-256 Snapshot Storage
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                3. Substring Evidence Proof Binding
              </div>
              <div className="p-2.5 bg-slate-800/80 rounded-xl border border-slate-700/80">
                4. Automated Field Change Diffing
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 text-xs text-slate-400 space-y-1">
            <div>Verified Records: <span className="text-emerald-400 font-bold">{metrics?.verified_count || 0}</span></div>
            <div>Registered Source Domains: <span className="text-slate-300 font-bold">{metrics?.total_sources || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
