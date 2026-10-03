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
    <div className="clay-card p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Human Review Workbench</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Flagged opportunities due to non-authoritative sources, conflicting deadlines, or low confidence scores.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 rounded-full">
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
        <div className="p-12 text-center text-slate-500 bg-white/60 rounded-2xl border border-slate-200/60">
          <div className="w-10 h-10 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2 border border-emerald-200/70">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} />
          </div>
          <div className="font-semibold text-slate-800 text-sm">All opportunities verified</div>
          <div className="text-xs text-slate-400 mt-1">No pending review flags in the system.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-5 border border-slate-200/70 rounded-2xl bg-white/70 space-y-3 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">{item.scholarship_name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{item.provider}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
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
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleAction(item.id, 'REJECT')}
                  className="px-3.5 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition clay-pill"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={14} className="text-rose-500" />
                  <span>Reject Candidate</span>
                </button>
                <button
                  onClick={() => handleAction(item.id, 'APPROVE')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
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
