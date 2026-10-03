import React, { useState } from 'react';
import {
  HugeiconsIcon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  CodeIcon,
  File01Icon,
  Coins01Icon,
  DiplomaIcon,
  User02Icon,
  ArrowRight01Icon,
} from './ui/icons';
import { formatCurrency } from '../utils';

interface Props {
  eligibilityJson: {
    all_of?: any[];
    any_of?: any[];
    raw_text?: string;
  };
  academicReqs: string[];
  incomeLimit: number | null;
  categoryCriteria: string[];
  genderCriteria?: string | null;
}

export const EligibilityVisualizer: React.FC<Props> = ({
  eligibilityJson,
  academicReqs,
  incomeLimit,
  categoryCriteria,
  genderCriteria,
}) => {
  const [showJson, setShowJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const allOf = eligibilityJson?.all_of || [];
  const anyOf = eligibilityJson?.any_of || [];
  const rawText = eligibilityJson?.raw_text || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(eligibilityJson, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="clay-card p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-center text-slate-700">
            <HugeiconsIcon icon={DiplomaIcon} size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Atlas Structured Eligibility Criteria
            </h3>
            <p className="text-[11px] text-slate-500">Machine-readable Boolean AST matching rules</p>
          </div>
        </div>

        <button
          onClick={() => setShowJson(!showJson)}
          className="px-3 py-1.5 text-xs font-mono font-semibold rounded-xl border border-slate-200/80 bg-white/80 hover:bg-white text-slate-700 flex items-center gap-1.5 transition clay-pill"
        >
          <HugeiconsIcon icon={CodeIcon} size={14} className="text-slate-600" />
          <span>{showJson ? 'Hide AST JSON' : 'Inspect AST JSON'}</span>
        </button>
      </div>

      {/* Visual Logic Group: ALL OF (Mandatory Conditions) */}
      {allOf.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              ALL OF (Mandatory)
            </span>
            <span className="text-[11px] text-slate-400">All conditions below must be satisfied:</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {allOf.map((rule, idx) => {
              if (rule.academic) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                      <HugeiconsIcon icon={DiplomaIcon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Academic Requirement</div>
                      <div className="font-bold text-slate-800">
                        Score {rule.academic.operator} {rule.academic.value}% in qualifying examination
                      </div>
                    </div>
                  </div>
                );
              }

              if (rule.income_limit && rule.income_limit.value !== null) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                      <HugeiconsIcon icon={Coins01Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Annual Family Income</div>
                      <div className="font-bold text-slate-800 font-mono">
                        Income {rule.income_limit.operator} {formatCurrency(rule.income_limit.value)} / year
                      </div>
                    </div>
                  </div>
                );
              }

              if (rule.citizenship) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                      <HugeiconsIcon icon={User02Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Nationality</div>
                      <div className="font-bold text-slate-800">
                        {rule.citizenship.value === 'IN' ? 'Indian National (IN)' : rule.citizenship.value}
                      </div>
                    </div>
                  </div>
                );
              }

              if (rule.gender) {
                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-white/70 border border-slate-200/70 shadow-xs flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                      <HugeiconsIcon icon={User02Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Gender Criterion</div>
                      <div className="font-bold text-slate-800">Female / Girl Students Only</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="p-3 rounded-xl border border-slate-200/70 bg-white/60 text-xs font-mono">
                  {JSON.stringify(rule)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Logic Group: ANY OF (Optional / Alternative Conditions) */}
      {anyOf.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              ANY OF (Alternative)
            </span>
            <span className="text-[11px] text-slate-400">Must belong to at least one eligible category:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {anyOf.map((rule, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white/80 text-slate-800 border border-slate-200/80 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600" />
                {rule.category || JSON.stringify(rule)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Official Verbatim Clause from Snapshot */}
      {rawText && (
        <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
          <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
            <HugeiconsIcon icon={File01Icon} size={14} className="text-slate-400" />
            <span>Official Published Clause (Raw Snapshot Text)</span>
          </div>
          <div className="text-xs text-slate-700 bg-white/70 p-3.5 rounded-2xl border border-slate-200/70 whitespace-pre-line leading-relaxed italic">
            "{rawText}"
          </div>
        </div>
      )}

      {/* Machine-Readable JSON AST (Collapsible Drawer) */}
      {showJson && (
        <div className="space-y-2 pt-2 border-t border-slate-200/60 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">// Universal Machine-Readable Schema (JSONB):</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-[11px] font-mono text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-white border border-slate-200 rounded-lg clay-pill"
            >
              <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={12} className={copied ? "text-emerald-600" : ""} />
              <span>{copied ? 'Copied!' : 'Copy AST'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 shadow-inner">
            {JSON.stringify(eligibilityJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
