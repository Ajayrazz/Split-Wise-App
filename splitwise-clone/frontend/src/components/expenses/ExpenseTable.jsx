import React from 'react';
import ExpenseTableRow from './ExpenseTableRow';

const ExpenseTable = ({ expenses, onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-700 bg-slate-800/50">
      <table className="w-full min-w-[600px] whitespace-nowrap text-sm">
        <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wider">
          <tr>
            <th className="px-6 py-3 text-left font-semibold">Description</th>
            <th className="px-6 py-3 text-left font-semibold">Group</th>
            <th className="px-6 py-3 text-left font-semibold">Paid By</th>
            <th className="px-6 py-3 text-center font-semibold">Split Type</th>
            <th className="px-6 py-3 text-left font-semibold">Date</th>
            <th className="px-6 py-3 text-right font-semibold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50">
          {expenses.map((exp) => (
            <ExpenseTableRow key={exp.id} expense={exp} onClick={onRowClick} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseTable;
