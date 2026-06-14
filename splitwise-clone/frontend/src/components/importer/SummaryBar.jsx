import React from 'react';

export default function SummaryBar({ stats }) {
  // stats is an object with counts
  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
      <StatTile label="Total Rows" count={stats.total} colorClass="bg-blue-100 text-blue-700 border-blue-200" />
      <StatTile label="Awaiting Approval" count={stats.awaiting} colorClass="bg-emerald-50 text-emerald-700 border-emerald-400" />
      <StatTile label="Warnings" count={stats.warnings} colorClass="bg-amber-50 text-amber-700 border-amber-400" />
      <StatTile label="Rejected" count={stats.rejected} colorClass="bg-red-50 text-red-700 border-red-400" />
      <StatTile label="Skipped" count={stats.skipped} colorClass="bg-slate-50 text-slate-700 border-slate-400" />
      <StatTile label="Needs Review" count={stats.needs_review} colorClass="bg-purple-50 text-purple-700 border-purple-400" />
    </div>
  );
}

function StatTile({ label, count, colorClass }) {
  return (
    <div className={`p-4 rounded-xl border ${colorClass} flex flex-col items-center justify-center`}>
      <span className="text-2xl font-bold">{count || 0}</span>
      <span className="text-xs font-medium uppercase tracking-wider mt-1 text-center">{label}</span>
    </div>
  );
}
