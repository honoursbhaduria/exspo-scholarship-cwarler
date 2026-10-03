import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Code2,
  FileText,
  Layers,
  ChevronDown,
  ChevronUp,
  Percent,
  Coins,
  Users,
  Award,
} from 'lucide-react';
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
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Atlas Universal Eligibility Logic
            </h3>
            <p className="text-[11px] text-slate-500">Machine-readable Boolean AST matching criteria</p>
          </div>
        </div>

        <button
          onClick={() => setShowJson(!showJson)}
          className="px-2.5 py-1 text-xs font-mono font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition"
        >
          <Code2 className="w-3.5 h-3.5 text-sky-600" />
          <span>{showJson ? 'Hide Machine AST' : 'View Machine AST'}</span>
          {showJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      <div className="p-5 space-y-4">
        {/* Visual Logic Group: ALL OF (Mandatory Conditions) */}
        {allOf.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                ALL OF (Mandatory)
              </span>
              <span className="text-[11px] text-slate-400">Must satisfy all of the following rules:</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {allOf.map((rule, idx) => {
                if (rule.academic) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Percent className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold">Academic Merit</div>
                        <div className="font-bold text-slate-800">
                          Percentage {rule.academic.operator} {rule.academic.value}% marks
                        </div>
                      </div>
                    </div>
                  );
                }

                if (rule.income_limit && rule.income_limit.value !== null) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold">Annual Income Ceiling</div>
                        <div className="font-bold text-slate-800 font-mono">
                          Income {rule.income_limit.operator} {formatCurrency(rule.income_limit.value)}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (rule.citizenship) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold">Nationality</div>
                        <div className="font-bold text-slate-800">
                          Citizenship: {rule.citizenship.value === 'IN' ? 'Indian Citizen (IN)' : rule.citizenship.value}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (rule.gender) {
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <div className="text-slate-400 text-[10px] uppercase font-semibold">Gender Criterion</div>
                        <div className="font-bold text-slate-800">Female Girl Students Only</div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-mono">
                    {JSON.stringify(rule)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Visual Logic Group: ANY OF (Optional / Alternative Conditions) */}
        {anyOf.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                ANY OF (Alternative)
              </span>
              <span className="text-[11px] text-slate-400">Must belong to at least one eligible category:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {anyOf.map((rule, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-200 text-xs font-semibold flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                  {rule.category || JSON.stringify(rule)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Official Verbatim Clause from Snapshot */}
        {rawText && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Official Published Clause (Raw Snapshot Text)
            </div>
            <div className="text-xs text-slate-700 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 whitespace-pre-line leading-relaxed font-sans italic">
              "{rawText}"
            </div>
          </div>
        )}

        {/* Machine-Readable JSON AST (Collapsible Drawer) */}
        {showJson && (
          <div className="space-y-2 pt-2 border-t border-slate-100 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">// Universal Machine-Readable Schema (JSONB):</span>
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 text-[11px] font-mono text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 rounded"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy AST'}
              </button>
            </div>
            <pre className="p-3.5 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-slate-800 shadow-inner">
              {JSON.stringify(eligibilityJson, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
