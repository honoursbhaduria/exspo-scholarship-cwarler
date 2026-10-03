import React, { useState, useEffect } from 'react';
import { AlertCircle, Check, X, ExternalLink, ShieldAlert } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Human Review Workbench</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Flagged opportunities due to non-authoritative sources, conflicting deadlines, or low confidence scores.
          </p>
        </div>
        <span className="text-xs font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-full">
          {items.length} Pending
        </span>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl">
          {actionMessage}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading pending review items...</div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-xl border">
          <ShieldAlert className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
          <div className="font-semibold text-slate-700">All opportunities verified!</div>
          <div className="text-xs text-slate-400 mt-1">No pending review flags in the system.</div>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="p-5 border rounded-xl bg-slate-50/50 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{item.scholarship_name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">{item.provider}</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    {item.confidence_score.toFixed(1)}%
                  </span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Flagged: {item.reason.replace('_', ' ')}
                  </div>
                </div>
              </div>

              <div className="text-xs bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700">Source Candidate URL:</div>
                <a
                  href={item.official_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-600 hover:text-sky-700 font-mono break-all flex items-center gap-1"
                >
                  {item.official_source_url} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleAction(item.id, 'REJECT')}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <X className="w-3.5 h-3.5 text-rose-500" /> Reject Candidate
                </button>
                <button
                  onClick={() => handleAction(item.id, 'APPROVE')}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                >
                  <Check className="w-3.5 h-3.5" /> Approve & Elevate to Verified
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
