import React from 'react';
import { useSettings } from '../../hooks/useSettings';

const ExpenseTableRow = ({ expense, onClick }) => {
  const { settings } = useSettings();
  const dateObj = new Date(expense.created_at);
  const formattedDate = dateObj.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const splitColors = {
    EQUAL: "bg-blue-500/20 text-blue-300",
    UNEQUAL: "bg-purple-500/20 text-purple-300",
    PERCENTAGE: "bg-amber-500/20 text-amber-300",
    SHARE: "bg-pink-500/20 text-pink-300",
  };
  
  const splitClass = splitColors[expense.split_type] || "bg-slate-500/20 text-slate-300";

  return (
    <tr 
      onClick={() => onClick(expense)}
      className="hover:bg-slate-700/50 cursor-pointer transition-colors border-b border-slate-700/50 last:border-0"
    >
      <td className="px-6 py-4 text-left font-medium text-white">{expense.description}</td>
      <td className="px-6 py-4 text-left text-slate-300">{expense.group_name || '—'}</td>
      <td className="px-6 py-4 text-left text-slate-300">User {expense.paid_by}</td>
      <td className="px-6 py-4 text-center">
        <span className={`px-2 py-1 text-xs rounded font-semibold ${splitClass}`}>
          {expense.split_type}
        </span>
      </td>
      <td className="px-6 py-4 text-left text-slate-400">{formattedDate}</td>
      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
        {expense.currency === 'USD' ? '$' : '₹'}{parseFloat(expense.total_amount).toFixed(2)}
      </td>
    </tr>
  );
};

export default ExpenseTableRow;
