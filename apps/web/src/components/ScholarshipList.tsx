import React, { useState } from 'react';
import {
  HugeiconsIcon,
  Search01Icon,
  FilterIcon,
  ViewIcon,
} from './ui/icons';
import { Scholarship } from '../types';
import { formatDate, formatCurrency } from '../utils';

interface Props {
  scholarships: Scholarship[];
  onSelect: (id: string) => void;
}

export const ScholarshipList: React.FC<Props> = ({ scholarships, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceTypeFilter, setSourceTypeFilter] = useState('ALL');

  const filtered = scholarships.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.provider.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchSource = sourceTypeFilter === 'ALL' || item.source_type === sourceTypeFilter;

    return matchSearch && matchStatus && matchSource;
  });

  return (
    <div className="clay-card p-6 space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <HugeiconsIcon icon={Search01Icon} size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by scholarship name or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/70 border border-slate-200/80 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-white/70 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            <option value="VERIFIED">VERIFIED</option>
            <option value="REVIEW_REQUIRED">REVIEW REQUIRED</option>
            <option value="EXPIRING_SOON">EXPIRING SOON</option>
            <option value="EXPIRED">EXPIRED</option>
          </select>

          {/* Source Type Filter */}
          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value)}
            className="px-3.5 py-2 bg-white/70 border border-slate-200/80 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400/50 shadow-xs"
          >
            <option value="ALL">All Sources</option>
            <option value="GOVERNMENT">GOVERNMENT</option>
            <option value="UNIVERSITY">UNIVERSITY</option>
            <option value="CORPORATE">CORPORATE</option>
            <option value="FOUNDATION">FOUNDATION</option>
            <option value="AGGREGATOR">AGGREGATOR</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/60 bg-white/40">
        <table className="w-full text-left text-xs sm:text-sm text-slate-600">
          <thead className="bg-slate-100/70 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b border-slate-200/60">
            <tr>
              <th className="py-3 px-4">Scholarship & Provider</th>
              <th className="py-3 px-4">Source Type</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Deadline</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Confidence</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                  No scholarships match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isVerified = item.status === 'VERIFIED';
                const isReview = item.status === 'REVIEW_REQUIRED';
                const isExpired = item.status === 'EXPIRED';

                return (
                  <tr key={item.id} className="hover:bg-white/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.provider}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100/80 text-slate-700 border border-slate-200/60">
                        {item.source_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-900 font-mono">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-xs font-mono text-slate-700">
                      {formatDate(item.closing_date)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                            : isReview
                            ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                            : isExpired
                            ? 'bg-rose-50 text-rose-800 border border-rose-200/80'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {item.confidence_score.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.confidence_score >= 95
                                ? 'bg-emerald-600'
                                : item.confidence_score >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.confidence_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => onSelect(item.id)}
                        className="px-3 py-1.5 bg-white/80 hover:bg-white text-slate-800 rounded-xl clay-pill transition inline-flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <HugeiconsIcon icon={ViewIcon} size={14} className="text-slate-600" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
