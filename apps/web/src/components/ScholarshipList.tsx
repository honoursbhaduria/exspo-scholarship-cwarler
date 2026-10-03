import React, { useState } from 'react';
import { Search, Filter, ExternalLink, Eye, ShieldCheck, AlertCircle } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b pb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by scholarship name or provider..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-[11px] uppercase tracking-wider font-semibold text-slate-500 border-b">
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
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  No scholarships match the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isVerified = item.status === 'VERIFIED';
                const isReview = item.status === 'REVIEW_REQUIRED';
                const isExpired = item.status === 'EXPIRED';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.provider}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.source_type}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-medium text-slate-900 font-mono">
                      {formatCurrency(item.amount)}
                    </td>

                    <td className="py-3 px-4 text-xs font-mono text-slate-700">
                      {formatDate(item.closing_date)}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : isReview
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : isExpired
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-800">
                          {item.confidence_score.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              item.confidence_score >= 95
                                ? 'bg-emerald-500'
                                : item.confidence_score >= 75
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${item.confidence_score}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelect(item.id)}
                        className="p-1.5 hover:bg-sky-50 text-sky-600 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Eye className="w-4 h-4" /> Inspect
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
