import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, XCircle } from 'lucide-react';

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
    <div className="bg-white border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Deterministic Confidence Audit</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">{score.toFixed(1)}%</span>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
                isVerified
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : isReview
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <div>Assignment Benchmark:</div>
          <div className="font-semibold text-slate-700">Verified $\ge$ 95.0% + Zero Conflicts</div>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(breakdown).map(([key, item]) => {
          const isMax = item.score === item.max;
          const isZero = item.score === 0;

          return (
            <div key={key} className="text-sm border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-700 flex items-center gap-1.5">
                  {isMax ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : isZero ? (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                  {categoryLabels[key] || key}
                </span>
                <span className="font-mono font-semibold text-slate-800">
                  +{item.score} / {item.max}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 ml-5.5">{item.reason}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
