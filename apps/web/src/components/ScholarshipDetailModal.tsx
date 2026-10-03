import React, { useState, useEffect } from 'react';
import {
  HugeiconsIcon,
  Cancel01Icon,
  ArrowUpRight01Icon,
  Calendar03Icon,
  Coins01Icon,
  DiplomaIcon,
  File01Icon,
  CheckmarkCircle02Icon,
  CheckmarkBadge01Icon,
  Time02Icon,
} from './ui/icons';
import { ScholarshipDetail, EvidenceItem, VersionItem } from '../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { EvidenceViewer } from './EvidenceViewer';
import { ChangeHistory } from './ChangeHistory';
import { EligibilityVisualizer } from './EligibilityVisualizer';
import { formatDate, formatCurrency } from '../utils';

interface Props {
  scholarshipId: string | null;
  onClose: () => void;
}

export const ScholarshipDetailModal: React.FC<Props> = ({ scholarshipId, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'score' | 'evidence' | 'history'>('overview');
  const [detail, setDetail] = useState<ScholarshipDetail | null>(null);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [history, setHistory] = useState<VersionItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!scholarshipId) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/v1/scholarships/${scholarshipId}`).then((r) => r.json()),
      fetch(`/api/v1/scholarships/${scholarshipId}/evidence`).then((r) => r.json()),
      fetch(`/api/v1/scholarships/${scholarshipId}/history`).then((r) => r.json()),
    ])
      .then(([d, e, h]) => {
        setDetail(d);
        setEvidence(e);
        setHistory(h);
      })
      .finally(() => setLoading(false));
  }, [scholarshipId]);

  if (!scholarshipId) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="clay-card p-0 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden bg-white/95 backdrop-blur-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200/60 flex items-start justify-between bg-white/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 uppercase tracking-wider border border-slate-200/60">
                {detail?.source_type || 'SOURCE'}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  detail?.status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {detail?.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{detail?.name || 'Loading details...'}</h2>
            <p className="text-xs sm:text-sm text-slate-500">{detail?.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition clay-pill bg-white"
            title="Close (ESC)"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={18} />
          </button>
        </div>

        {/* Modal Segmented Navigation Bar */}
        <div className="px-6 py-3 border-b border-slate-200/60 bg-slate-50/60">
          <div className="p-1 rounded-2xl bg-slate-200/60 flex items-center gap-1 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-white text-slate-900 shadow-sm border border-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <HugeiconsIcon icon={DiplomaIcon} size={16} className={activeTab === 'overview' ? 'text-slate-900' : 'text-slate-500'} />
              <span>Overview & Criteria</span>
            </button>

            <button
              onClick={() => setActiveTab('score')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'score'
                  ? 'bg-white text-slate-900 shadow-sm border border-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className={activeTab === 'score' ? 'text-emerald-700' : 'text-slate-500'} />
              <span>Confidence Audit Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('evidence')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'evidence'
                  ? 'bg-white text-slate-900 shadow-sm border border-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <HugeiconsIcon icon={File01Icon} size={16} className={activeTab === 'evidence' ? 'text-slate-900' : 'text-slate-500'} />
              <span>Source Evidence</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'evidence' ? 'bg-slate-100 text-slate-800' : 'bg-slate-300/60 text-slate-700'
              }`}>
                {evidence.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-sm border border-white'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <HugeiconsIcon icon={Time02Icon} size={16} className={activeTab === 'history' ? 'text-slate-900' : 'text-slate-500'} />
              <span>Change History</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === 'history' ? 'bg-slate-100 text-slate-800' : 'bg-slate-300/60 text-slate-700'
              }`}>
                {history.length}
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 no-scrollbar">
          {loading ? (
            <div className="py-20 text-center text-slate-400 text-sm">Loading intelligence data...</div>
          ) : detail ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Key Facts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                    <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={Coins01Icon} size={15} className="text-slate-600" />
                        <span>Benefit Amount</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {formatCurrency(detail.amount)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={Calendar03Icon} size={15} className="text-slate-600" />
                        <span>Closing Date</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {formatDate(detail.closing_date)}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-white/80 border border-slate-200/70 shadow-xs">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <HugeiconsIcon icon={DiplomaIcon} size={15} className="text-slate-600" />
                        <span>Income Limit</span>
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {detail.income_limit ? `${formatCurrency(detail.income_limit)} / year` : 'No Income Ceiling'}
                      </div>
                    </div>
                  </div>

                  {/* Structured Eligibility Logic Visualizer */}
                  <EligibilityVisualizer
                    eligibilityJson={detail.eligibility_json}
                    academicReqs={detail.academic_requirements}
                    incomeLimit={detail.income_limit}
                    categoryCriteria={detail.category_criteria}
                    genderCriteria={detail.gender_criteria}
                  />

                  {/* Academic Requirements & Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200/70 bg-white/60 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Academic Criteria
                      </h4>
                      {detail.academic_requirements.length > 0 ? (
                        <ul className="text-xs space-y-1.5 text-slate-700">
                          {detail.academic_requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400">See full overview text.</p>
                      )}
                    </div>

                    <div className="border border-slate-200/70 bg-white/60 rounded-2xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Documents Required
                      </h4>
                      {detail.documents_required.length > 0 ? (
                        <ul className="text-xs space-y-1.5 text-slate-700">
                          {detail.documents_required.map((doc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <HugeiconsIcon icon={File01Icon} size={14} className="text-slate-600 mt-0.5 shrink-0" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400">Standard identity & academic records required.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'score' && (
                <ScoreBreakdown
                  score={detail.confidence_score}
                  status={detail.status}
                  breakdown={detail.confidence_breakdown}
                />
              )}

              {activeTab === 'evidence' && (
                <EvidenceViewer evidence={evidence} officialUrl={detail.official_source_url} />
              )}

              {activeTab === 'history' && <ChangeHistory versions={history} />}
            </>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {detail?.application_url && (
              <a
                href={detail.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
              >
                <span>Official Application Portal</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </a>
            )}
            {detail?.official_source_url && (
              <a
                href={detail.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 shadow-xs transition"
              >
                <span>Official Primary Source</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition clay-pill"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
