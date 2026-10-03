import React, { useState, useEffect } from 'react';
import { X, ExternalLink, Calendar, DollarSign, Award, FileText, CheckCircle2 } from 'lucide-react';
import { ScholarshipDetail, EvidenceItem, VersionItem } from '../types';
import { ScoreBreakdown } from './ScoreBreakdown';
import { EvidenceViewer } from './EvidenceViewer';
import { ChangeHistory } from './ChangeHistory';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
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
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        {detail.amount ? `₹${detail.amount.toLocaleString()} ${detail.currency}` : 'Full Waiver / Specified in rules'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-sky-600" /> Closing Date
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        {detail.closing_date ? new Date(detail.closing_date).toLocaleDateString() : 'Not Specified'}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                        <Award className="w-4 h-4 text-amber-600" /> Income Limit
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        {detail.income_limit ? `₹${detail.income_limit.toLocaleString()} / year` : 'No Income Ceiling'}
                      </div>
                    </div>
                  </div>

                  {/* Structured Eligibility AST */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-xs">
                      Structured Eligibility Model (Boolean AST)
                    </h3>
                    <div className="bg-slate-900 text-slate-200 font-mono text-xs p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(detail.eligibility_json, null, 2)}
                    </div>
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

                  {/* Action Links */}
                  <div className="flex items-center gap-3 pt-4 border-t">
                    {detail.application_url && (
                      <a
                        href={detail.application_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                      >
                        Official Application Portal <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <a
                      href={detail.official_source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium flex items-center gap-1.5"
                    >
                      Official Primary Source Page <ExternalLink className="w-4 h-4" />
                    </a>
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
      </div>
    </div>
  );
};
