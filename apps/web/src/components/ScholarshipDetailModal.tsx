import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, DollarSign, Award, FileText, CheckCircle2 } from 'lucide-react';
import { ScholarshipDetail, EvidenceItem, VersionItem } from '../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { EvidenceViewer } from './EvidenceViewer';
import { ChangeHistory } from './ChangeHistory';
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
  const [showRawAst, setShowRawAst] = useState(false);

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
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700 uppercase tracking-wider">
                {detail?.source_type || 'SOURCE'}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  detail?.status === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}
              >
                {detail?.status}
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white border px-2 py-0.5 rounded">
                Score: {detail?.confidence_score.toFixed(1)}%
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{detail?.name || 'Loading details...'}</h2>
            <p className="text-sm text-slate-500">{detail?.provider}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            title="Close (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 px-6 gap-6 text-sm font-medium text-slate-500 bg-white">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'overview'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Overview & Criteria
          </button>
          <button
            onClick={() => setActiveTab('score')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'score'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Why This Score? (+100pt Audit)
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'evidence'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Source Evidence ({evidence.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'history'
                ? 'border-sky-600 text-sky-600 font-semibold'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Change History ({history.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400">Loading intelligence data...</div>
          ) : detail ? (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Key Facts */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <DollarSign className="w-4 h-4 text-emerald-600" /> Benefit Amount
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {formatCurrency(detail.amount)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-sky-600" /> Closing Date
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {formatDate(detail.closing_date)}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Award className="w-4 h-4 text-amber-600" /> Income Limit
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1 font-mono">
                        {detail.income_limit ? `${formatCurrency(detail.income_limit)} / year` : 'No Income Ceiling'}
                      </div>
                    </div>
                  </div>

                  {/* Structured Eligibility Criteria */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Structured Eligibility Criteria (Atlas Match Engine)
                      </h3>
                      <button
                        onClick={() => setShowRawAst(!showRawAst)}
                        className="text-[11px] font-mono font-semibold text-sky-600 hover:text-sky-800 underline"
                      >
                        {showRawAst ? 'Hide Machine AST (JSON)' : 'View Machine AST (JSON)'}
                      </button>
                    </div>

                    {/* Official Raw Text Description */}
                    {detail.eligibility_json?.raw_text && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed italic">
                        "{detail.eligibility_json.raw_text}"
                      </div>
                    )}

                    {/* Human-Readable Criteria Badges */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {detail.academic_requirements.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                          Academic: {detail.academic_requirements[0]}
                        </span>
                      )}
                      {detail.income_limit && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium font-mono">
                          Income Limit: $\le$ {formatCurrency(detail.income_limit)}
                        </span>
                      )}
                      {detail.gender_criteria && detail.gender_criteria !== 'ALL' && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                          Gender: {detail.gender_criteria.replace('_', ' ')}
                        </span>
                      )}
                      {detail.category_criteria && detail.category_criteria.length > 0 && (
                        <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                          Categories: {detail.category_criteria.join(', ')}
                        </span>
                      )}
                    </div>

                    {/* Optional Machine-Readable JSON AST */}
                    {showRawAst && (
                      <div className="mt-3 bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-lg overflow-x-auto border border-slate-800">
                        <div className="text-[10px] text-slate-400 mb-1">// Atlas Universal Boolean Logic Model (all_of / any_of AST):</div>
                        {JSON.stringify(detail.eligibility_json, null, 2)}
                      </div>
                    )}
                  </div>

                  {/* Academic Requirements & Documents */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Academic Criteria
                      </h4>
                      {detail.academic_requirements.length > 0 ? (
                        <ul className="text-xs space-y-1.5 text-slate-700">
                          {detail.academic_requirements.map((req, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-slate-400">See full overview text.</p>
                      )}
                    </div>

                    <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                      <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                        Documents Required
                      </h4>
                      {detail.documents_required.length > 0 ? (
                        <ul className="text-xs space-y-1.5 text-slate-700">
                          {detail.documents_required.map((doc, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-sky-500 mt-0.5 shrink-0" />
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
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {detail?.application_url && (
              <a
                href={detail.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                Official Application Portal <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {detail?.official_source_url && (
              <a
                href={detail.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-slate-300 hover:bg-white text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                Official Primary Source <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
