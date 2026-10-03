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
    <div className="clay-card p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 bg-white/95 border border-slate-200/80 shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1 sm:pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-slate-700 shrink-0">
            <HugeiconsIcon icon={DiplomaIcon} size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 break-words">
              Atlas Structured Eligibility Criteria
            </h3>
            <p className="text-[11px] text-slate-500">Machine-readable Boolean AST matching rules</p>
          </div>
        </div>

        <button
          onClick={() => setShowJson(!showJson)}
          className={`px-3.5 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md hover:shadow-lg self-start sm:self-auto shrink-0 ${
            showJson ? 'clay-btn-dark' : 'clay-btn text-black'
          }`}
        >
          <HugeiconsIcon icon={CodeIcon} size={14} className={showJson ? 'text-white' : 'text-black'} />
          <span>{showJson ? 'Hide AST JSON' : 'Inspect AST JSON'}</span>
        </button>
      </div>

      {/* Visual Logic Group: ALL OF (Mandatory Conditions) */}
      {allOf.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-300 shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-emerald-700" />
              <span>ALL OF (Mandatory)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">All conditions below must be satisfied:</span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {allOf.map((rule, idx) => {
              if (rule.academic) {
                return (
                  <div
                    key={idx}
                    className="clay-subcard p-3.5 flex items-center gap-3 bg-white shadow-md hover:shadow-lg transition-all border border-slate-200/90 rounded-2xl"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                      <HugeiconsIcon icon={DiplomaIcon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Academic Requirement</div>
                      <div className="font-bold text-slate-900">
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
                    className="clay-subcard p-3.5 flex items-center gap-3 bg-white shadow-md hover:shadow-lg transition-all border border-slate-200/90 rounded-2xl"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                      <HugeiconsIcon icon={Coins01Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Annual Family Income</div>
                      <div className="font-bold text-slate-900 font-mono">
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
                    className="clay-subcard p-3.5 flex items-center gap-3 bg-white shadow-md hover:shadow-lg transition-all border border-slate-200/90 rounded-2xl"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                      <HugeiconsIcon icon={User02Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Nationality</div>
                      <div className="font-bold text-slate-900">
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
                    className="clay-subcard p-3.5 flex items-center gap-3 bg-white shadow-md hover:shadow-lg transition-all border border-slate-200/90 rounded-2xl"
                  >
                    <div className="w-8.5 h-8.5 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0 border border-slate-200/80 shadow-xs">
                      <HugeiconsIcon icon={User02Icon} size={16} />
                    </div>
                    <div className="text-xs">
                      <div className="text-slate-400 text-[10px] uppercase font-semibold">Gender Criterion</div>
                      <div className="font-bold text-slate-900">Female / Girl Students Only</div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={idx} className="p-3.5 rounded-2xl border border-slate-200/90 bg-white text-xs font-mono shadow-md">
                  {JSON.stringify(rule)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visual Logic Group: ANY OF (Optional / Alternative Conditions) */}
      {anyOf.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-full bg-slate-100 text-slate-900 border border-slate-300 shadow-sm hover:shadow transition-all inline-flex items-center gap-1.5">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={13} className="text-slate-600" />
              <span>ANY OF (Alternative)</span>
            </span>
            <span className="text-[11px] text-slate-500 font-medium">Must belong to at least one eligible category:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {anyOf.map((rule, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-200/80 text-xs font-semibold flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
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
          <div className="text-xs text-slate-800 clay-subcard p-3 sm:p-4 whitespace-pre-line leading-relaxed italic bg-white shadow-md hover:shadow-lg transition-all break-words border border-slate-200/90 rounded-2xl">
            "{rawText}"
          </div>
        </div>
      )}

      {/* Machine-Readable JSON AST (Collapsible Drawer) */}
      {showJson && (
        <div className="space-y-2 pt-2 border-t border-slate-200/60 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-mono text-slate-400">// Machine-Readable AST (JSONB):</span>
            <button
              onClick={handleCopy}
              className="px-2.5 py-1 text-[11px] font-mono font-bold text-black flex items-center gap-1 clay-btn"
            >
              <HugeiconsIcon icon={copied ? CheckmarkCircle02Icon : Copy01Icon} size={12} className={copied ? "text-emerald-700" : "text-black"} />
              <span>{copied ? 'Copied!' : 'Copy AST'}</span>
            </button>
          </div>
          <pre className="p-3 sm:p-4 bg-slate-950 text-slate-200 font-mono text-[11px] sm:text-xs rounded-xl sm:rounded-2xl overflow-x-auto border border-slate-800 shadow-inner">
            {JSON.stringify(eligibilityJson, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
