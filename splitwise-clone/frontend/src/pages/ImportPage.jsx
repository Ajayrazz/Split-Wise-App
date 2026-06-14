import React, { useEffect } from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { useImport } from '../hooks/useImport';
import { useGlobalBalance } from '../context/GlobalBalanceContext';
import DropZone from '../components/importer/DropZone';
import SummaryBar from '../components/importer/SummaryBar';
import StagingReport from '../components/importer/StagingReport';

export default function ImportPage() {
  const { 
    stage, rows, isLoading, error, 
    uploadCsv, approveRow, excludeRow, approveAllValid, confirmIngestion, reset 
  } = useImport();
  const { triggerRefresh } = useGlobalBalance();

  useEffect(() => {
    if (stage === 'done') {
      triggerRefresh();
    }
  }, [stage, triggerRefresh]);

  const getStats = () => {
    return {
      total: rows.length,
      awaiting: rows.filter(r => r.frontendStatus === 'awaiting_approval').length,
      warnings: rows.filter(r => r.severity === 'warning').length,
      rejected: rows.filter(r => r.status === 'rejected').length,
      skipped: rows.filter(r => r.status === 'skipped').length,
      needs_review: rows.filter(r => r.frontendStatus === 'needs_review').length,
      approved: rows.filter(r => r.status === 'approved' || r.frontendStatus === 'approved').length
    };
  };

  const stats = getStats();
  const numApproved = stats.approved;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Import Expenses</h1>
          <p className="text-slate-500 mt-1">Upload CSV statements to bulk create expenses</p>
        </div>
        {stage !== 'idle' && (
          <button onClick={reset} className="text-sm font-medium text-indigo-600 hover:text-indigo-800">
            Start New Import
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          <p className="font-medium">Import Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {stage === 'idle' && (
        <DropZone onUpload={uploadCsv} isLoading={isLoading} />
      )}

      {stage === 'uploading' && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-slate-600 font-medium text-lg">Parsing and validating CSV...</p>
          <p className="text-slate-400 mt-2">This may take a moment for large files.</p>
        </div>
      )}

      {(stage === 'preview' || stage === 'confirming') && (
        <>
          <SummaryBar stats={stats} />
          
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-6 mb-6">
            <p className="text-sm text-slate-600">
              Only <span className="font-semibold text-emerald-600">Approved</span> rows will be ingested. 
              Rejected or skipped rows will be ignored.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={approveAllValid}
                disabled={stats.awaiting === 0 || isLoading}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
              >
                Approve All Valid
              </button>
              <button
                onClick={confirmIngestion}
                disabled={numApproved === 0 || isLoading}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-400 transition-colors"
              >
                {isLoading && stage === 'confirming' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirm Ingestion ({numApproved} rows)
              </button>
            </div>
          </div>

          <StagingReport rows={rows} onApprove={approveRow} onExclude={excludeRow} />
        </>
      )}

      {stage === 'done' && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Import Complete!</h2>
          <p className="text-slate-600 mb-8 max-w-md">
            Successfully imported {numApproved} expenses. These are now visible in the group ledger and balances have been updated.
          </p>
          <SummaryBar stats={stats} />
        </div>
      )}
    </div>
  );
}
