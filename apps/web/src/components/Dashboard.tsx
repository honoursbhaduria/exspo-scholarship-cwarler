import React, { useState } from 'react';
import {
  HugeiconsIcon,
  Radar01Icon,
  CheckmarkBadge01Icon,
  AlertDiamondIcon,
  Pulse01Icon,
  HourglassIcon,
  AnalyticsUpIcon,
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

const formatDiffVal = (val: string | null) => {
  if (!val) return 'None';
  if (val.startsWith('{') || val.startsWith('[')) {
    try {
      const parsed = JSON.parse(val);
      if (parsed.all_of && Array.isArray(parsed.all_of)) {
        return parsed.all_of
          .map((r: any) => {
            if (r.academic) return `Score ${r.academic.operator}${r.academic.value}%`;
            if (r.income_limit) return `Income <= ₹${r.income_limit.value?.toLocaleString()}`;
            return 'Rule';
          })
          .join(', ');
      }
      return 'Updated AST Criteria';
    } catch {
      return val.slice(0, 30) + '...';
    }
  }
  return val;
};

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
      {/* Top Banner / Actions Card - Compact, Clean, No Heavy Shadows */}
      <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-extrabold text-black tracking-tight">
            Scholarship Intelligence Platform
          </h1>
          <p className="text-xs text-black/75 mt-0.5 font-medium">
            Continuous discovery, evidence verification, and version diff tracking for official Indian education schemes.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefresh}
            className="p-2.5 clay-btn flex items-center justify-center text-black"
            title="Refresh Metrics"
          >
            <HugeiconsIcon icon={RefreshIcon} size={16} />
          </button>
          <button
            onClick={handleTriggerCrawl}
            disabled={crawling}
            className="px-4 py-2 clay-btn-dark flex items-center gap-2 text-xs font-bold"
          >
            <HugeiconsIcon
              icon={RefreshIcon}
              size={14}
              className={crawling ? 'animate-spin' : ''}
            />
            <span>{crawling ? 'Crawling Pipeline...' : 'Run Pipeline Crawl'}</span>
          </button>
        </div>
      </div>

      {crawlMessage && (
        <div className="p-3 bg-white/90 border border-slate-200 text-black text-xs font-semibold rounded-2xl shadow-sm animate-in fade-in">
          {crawlMessage}
        </div>
      )}

      {/* KPI Cards Grid - All White Clay Cards with Pure Black Typography */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Discovered */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Discovered
            </span>
            <HugeiconsIcon icon={Radar01Icon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics?.total_discovered || 0}
            </div>
            <div className="text-xs font-bold text-black mt-1">Total crawled items</div>
          </div>
        </div>

        {/* Verified */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Verified
            </span>
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics?.verified_count || 0}
            </div>
            <div className="text-xs font-bold text-black mt-1">≥ 95.0% confidence</div>
          </div>
        </div>

        {/* Review Required */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Review Req.
            </span>
            <HugeiconsIcon icon={AlertDiamondIcon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics?.review_required_count || 0}
            </div>
            <div className="text-xs font-bold text-black mt-1">Flagged items</div>
          </div>
        </div>

        {/* Active */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Active
            </span>
            <HugeiconsIcon icon={Pulse01Icon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics?.active_count || 0}
            </div>
            <div className="text-xs font-bold text-black mt-1">Open applications</div>
          </div>
        </div>

        {/* Expired / Stale */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Expired
            </span>
            <HugeiconsIcon icon={HourglassIcon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics?.expired_count || 0}
            </div>
            <div className="text-xs font-bold text-black mt-1">Past deadline</div>
          </div>
        </div>

        {/* Avg Confidence */}
        <div className="clay-card bg-white/95 p-5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-black">
              Avg Conf.
            </span>
            <HugeiconsIcon icon={AnalyticsUpIcon} size={22} className="text-black shrink-0" />
          </div>
          <div>
            <div className="text-3xl font-black text-black font-mono tracking-tight">
              {metrics ? `${metrics.average_confidence.toFixed(1)}%` : '0.0%'}
            </div>
            <div className="text-xs font-bold text-black mt-1">All opportunities</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Recently Detected Changes & System Integrity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recently Updated Changes Feed - Compact Little Section */}
        <div className="lg:col-span-2 clay-card p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between pb-0.5">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-black">Recently Detected Field Changes</h2>
              <p className="text-[11px] text-black/70 mt-0.5 font-medium">
                Automated field-by-field diff comparison across successive crawl runs.
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold clay-btn px-2.5 py-0.5 text-black">
              {changes.length} events
            </span>
          </div>

          {changes.length === 0 ? (
            <div className="py-8 text-center text-black/50 text-xs font-medium">
              No changes detected across crawl runs yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-[320px] overflow-y-auto no-scrollbar pr-0.5">
              {changes.slice(0, 6).map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => onSelectScholarship(ch.scholarship_id)}
                  className="clay-diff-card p-3 space-y-1.5 cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-black hover:text-slate-800 truncate max-w-[260px]">
                      {ch.scholarship_name}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 uppercase tracking-wider shrink-0 ${
                        ch.severity === 'HIGH'
                          ? 'clay-badge-high'
                          : ch.severity === 'MEDIUM'
                          ? 'clay-badge-medium'
                          : 'clay-badge-low'
                      }`}
                    >
                      {ch.severity} SEVERITY
                    </span>
                  </div>

                  <div className="text-[11px] flex items-center gap-1.5 text-black/80 font-medium">
                    <span className="font-bold text-black capitalize shrink-0">
                      {ch.field_name.replace('_', ' ')}:
                    </span>
                    <span className="line-through text-black/50 truncate max-w-[120px]">
                      {formatDiffVal(ch.old_value)}
                    </span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="text-black/60 shrink-0" />
                    <span className="font-bold text-emerald-800 truncate max-w-[160px]">
                      {formatDiffVal(ch.new_value)}
                    </span>
                  </div>

                  <div className="text-[10px] text-black/55 font-mono">
                    Detected: {new Date(ch.detected_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Integrity & Traceability Summary Card - Compact */}
        <div className="clay-card-dark text-white p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <HugeiconsIcon icon={Database01Icon} size={16} />
              <h3 className="font-bold text-xs uppercase tracking-wider">Repository Audit Chain</h3>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
              Every funding opportunity in this repository maintains a complete audit trail:
            </p>
            <div className="space-y-1.5 text-xs text-slate-200 font-mono">
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                1. Official Source Domain Validation
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                2. SHA-256 Snapshot Storage
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                3. Substring Evidence Proof Binding
              </div>
              <div className="p-2 bg-slate-800/80 rounded-xl border border-slate-700/80 text-[11px]">
                4. Automated Field Change Diffing
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-3 text-xs text-slate-300 space-y-1 font-medium">
            <div>Verified Records: <span className="text-emerald-400 font-bold">{metrics?.verified_count || 0}</span></div>
            <div>Registered Source Domains: <span className="text-white font-bold">{metrics?.total_sources || 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
