import React, { useState, useEffect } from 'react';
import {
  HugeiconsIcon,
  ShieldAlertIcon,
  ArrowUpRight01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
} from './ui/icons';
import { ReviewItem } from '../types';

export const ReviewQueue: React.FC = () => {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchItems = () => {
    setLoading(true);
    fetch('/api/v1/review-queue')
      .then((r) => r.json())
      .then((data) => setItems(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAction = async (itemId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await fetch(`/api/v1/review-queue/${itemId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewer: 'Administrator',
          decision_notes: `Manual review override: ${action} applied by administrator.`,
        }),
      });
      if (res.ok) {
        setActionMessage(`Item ${action.toLowerCase()}d successfully.`);
        fetchItems();
        setTimeout(() => setActionMessage(null), 2500);
      }
    } catch (e) {
      setActionMessage('Failed to execute action.');
    }
  };

  return (
    <div className="clay-card p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 sm:pb-2">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900">Human Review Workbench</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagged opportunities due to non-authoritative sources, conflicting deadlines, or low confidence scores.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full self-start sm:self-auto shrink-0">
          {items.length} Pending
        </span>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-2xl shadow-xs">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading pending review items...</div>
      ) : items.length === 0 ? (
        <div className="p-8 sm:p-12 text-center text-slate-500 bg-white/60 rounded-2xl border border-slate-200/60">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-200/70">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
          </div>
          <div className="font-semibold text-slate-800 text-sm">All opportunities verified</div>
          <div className="text-xs text-slate-400 mt-1">No pending review flags in the system.</div>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {items.map((item) => (
            <div key={item.id} className="clay-subcard p-3.5 sm:p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base break-words">{item.scholarship_name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{item.provider}</div>
                </div>
                <div className="text-left sm:text-right self-start sm:self-auto shrink-0">
                  <span className="text-xs font-bold font-mono text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full inline-block">
                    {item.confidence_score.toFixed(1)}%
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Flagged: {item.reason.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 space-y-1">
                <div className="font-semibold text-slate-700">Source Candidate URL:</div>
                <a
                  href={item.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 hover:text-slate-900 underline font-mono break-all flex items-center gap-1.5"
                >
                  <span>{item.official_source_url}</span>
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="shrink-0" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
                <button
                  onClick={() => handleAction(item.id, 'REJECT')}
                  className="w-full sm:w-auto justify-center px-3.5 py-2 sm:py-1.5 clay-btn text-black text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-rose-600" />
                  <span>Reject Candidate</span>
                </button>
                <button
                  onClick={() => handleAction(item.id, 'APPROVE')}
                  className="w-full sm:w-auto justify-center px-3.5 py-2 sm:py-1.5 clay-btn-dark text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={14} className="text-emerald-400" />
                  <span>Approve & Elevate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
