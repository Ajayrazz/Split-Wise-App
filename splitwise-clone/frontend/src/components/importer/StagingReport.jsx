import React, { useState } from 'react';
import AnomalyRow from './AnomalyRow';

export default function StagingReport({ rows, onApprove, onExclude }) {
  const [filter, setFilter] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Rows' },
    { id: 'awaiting_approval', label: 'Awaiting' },
    { id: 'needs_review', label: 'Needs Review' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'skipped', label: 'Skipped' },
    { id: 'approved', label: 'Approved' },
    { id: 'excluded', label: 'Excluded' }
  ];

  const filteredRows = filter === 'all' 
    ? rows 
    : rows.filter(r => r.frontendStatus === filter || r.status === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Data Conflict & Import Report</h3>
      </div>
      
      <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex space-x-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap
              ${filter === t.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'}
            `}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex items-center px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="w-12">Row</div>
        <div className="w-24 mr-2">Date</div>
        <div className="flex-1 mr-4">Description</div>
        <div className="w-24 mr-2">Paid By</div>
        <div className="w-24 text-right mr-4">Amount</div>
        <div className="w-80">Status / Issues</div>
      </div>

      <div className="divide-y divide-slate-100">
        {filteredRows.length > 0 ? (
          filteredRows.map(row => (
            <AnomalyRow 
              key={row.id} 
              row={row} 
              onApprove={onApprove} 
              onExclude={onExclude} 
            />
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            No rows found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
