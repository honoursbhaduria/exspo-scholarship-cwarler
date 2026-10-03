import React from 'react';
import {
  HugeiconsIcon,
  CheckmarkCircle02Icon,
  AlertCircleIcon,
  Cancel01Icon,
} from './ui/icons';

interface Props {
  score: number;
  status: string;
  breakdown: Record<string, { score: number; max: number; reason: string }>;
}

export const ScoreBreakdown: React.FC<Props> = ({ score, status, breakdown }) => {
  const isVerified = status === 'VERIFIED';
  const isReview = status === 'REVIEW_REQUIRED';

  const categoryLabels: Record<string, string> = {
    official_primary_source: 'Official Primary Source Verified',
    current_presence: 'Scholarship Present on Current Page',
    application_url: 'Official Application URL Supported',
    eligibility_supported: 'Eligibility Supported with Evidence',
    deadline_supported: 'Deadline Supported with Evidence',
    source_freshness: 'Source Freshness SLA',
    extraction_consistency: 'Extraction Consistency (Regex vs LLM)',
    conflict_check: 'Absence of Source Conflicts',
    evidence_completeness: 'Evidence Completeness Ratio',
  };

  return (
    <div className="clay-subcard p-4 sm:p-6 space-y-3 sm:space-y-4 bg-white shadow-sm hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-3 sm:pb-4 gap-2">
        <div>
          <div className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-500 font-semibold">Confidence Audit Evaluation</div>
          <div className="flex items-center gap-2 sm:gap-2.5 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{score.toFixed(1)}%</span>
            <span
              className={`px-2 sm:px-2.5 py-0.5 text-[11px] sm:text-xs font-semibold rounded-full uppercase tracking-wider ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : isReview
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-left sm:text-right text-xs text-slate-500">
          <div>Verification Standard:</div>
          <div className="font-semibold text-slate-700">Score ≥ 95.0% + Zero Conflicts</div>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-3">
        {Object.entries(breakdown).map(([key, item]) => {
          const isMax = item.score === item.max;
          const isZero = item.score === 0;

          return (
            <div key={key} className="text-xs sm:text-sm border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
              <div className="flex items-start sm:items-center justify-between gap-2">
                <span className="font-medium text-slate-700 flex items-center gap-2 break-words">
                  {isMax ? (
                    <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} className="text-emerald-600 shrink-0" />
                  ) : isZero ? (
                    <HugeiconsIcon icon={Cancel01Icon} size={16} className="text-rose-500 shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={AlertCircleIcon} size={16} className="text-amber-500 shrink-0" />
                  )}
                  <span>{categoryLabels[key] || key}</span>
                </span>
                <span className="font-mono font-semibold text-slate-800 text-xs shrink-0">
                  +{item.score} / {item.max}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 mt-0.5 ml-6 break-words">{item.reason}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
