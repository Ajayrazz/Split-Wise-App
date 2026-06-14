import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, X } from 'lucide-react';

export default function AnomalyRow({ row, onApprove, onExclude }) {
  const [expanded, setExpanded] = useState(false);
  const issues = row.issue_codes || [];
  const messages = row.messages || [];
  const raw = row.raw_data || {};
  
  const hasIssues = issues.length > 0;
  const status = row.frontendStatus || row.status;
  
  // Truncate issues
  const displayIssues = issues.slice(0, 2);
  const overflowCount = issues.length > 2 ? issues.length - 2 : 0;
  
  const showActions = status === 'awaiting_approval' || status === 'needs_review';

  return (
    <div className={`border-b border-slate-200 bg-white ${status === 'excluded' ? 'opacity-50' : ''}`}>
      <div 
        className="flex items-center px-4 py-3 hover:bg-slate-50 cursor-pointer"
        onClick={() => hasIssues && setExpanded(!expanded)}
      >
        <div className="w-12 text-sm text-slate-500 font-medium">#{row.row_number}</div>
        <div className="w-24 text-sm text-slate-600 truncate mr-2" title={raw.date}>{raw.date || '-'}</div>
        <div className="flex-1 text-sm font-medium text-slate-800 truncate mr-4">{raw.description || 'No description'}</div>
        <div className="w-24 text-sm text-slate-600 truncate mr-2" title={raw.paid_by}>{raw.paid_by || '-'}</div>
        <div className="w-24 text-sm text-right font-medium text-slate-700 mr-4">
          {raw.amount ? `${raw.amount}` : '-'}
        </div>
        
        {/* Badges */}
        <div className="flex items-center space-x-2 w-80 justify-end">
          {displayIssues.map(code => (
            <span key={code} className={`px-2 py-0.5 text-xs font-mono rounded ${row.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
              {code}
            </span>
          ))}
          {overflowCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-600">
              +{overflowCount}
            </span>
          )}
          
          <span className={`px-2 py-1 text-xs font-medium rounded capitalize ml-2 whitespace-nowrap
            ${status === 'awaiting_approval' ? 'bg-emerald-100 text-emerald-700' : ''}
            ${status === 'needs_review' ? 'bg-purple-100 text-purple-700' : ''}
            ${status === 'rejected' ? 'bg-red-100 text-red-700' : ''}
            ${status === 'excluded' ? 'bg-slate-200 text-slate-600' : ''}
            ${status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ''}
            ${status === 'skipped' ? 'bg-slate-200 text-slate-600' : ''}
          `}>
            {status.replace('_', ' ')}
          </span>
          
          <div className="w-6 flex justify-end">
            {hasIssues && (
              expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />
            )}
          </div>
        </div>
      </div>

      {expanded && hasIssues && (
        <div className="px-16 py-4 bg-slate-50 border-t border-slate-100">
          <div className="space-y-3 mb-4">
            {issues.map((code, idx) => (
              <div key={idx} className="flex items-start">
                <span className={`px-2 py-1 text-xs font-mono rounded mt-0.5 mr-3
                  ${row.severity === 'warning' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}
                `}>
                  {code}
                </span>
                <p className="text-sm text-slate-700">{messages[idx]}</p>
              </div>
            ))}
          </div>
          
          {showActions && (
            <div className="flex space-x-3 mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(row.id); }}
                className="flex items-center px-4 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200 transition-colors"
              >
                <Check className="w-4 h-4 mr-1.5" />
                Approve Normalisation
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onExclude(row.id); }}
                className="flex items-center px-4 py-1.5 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
              >
                <X className="w-4 h-4 mr-1.5" />
                Exclude from Ingestion
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
