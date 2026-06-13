import React from 'react';
import { useSettings } from '../../../hooks/useSettings';

const EqualSplitView = ({ groupMembers, totalAmount, currencySymbol }) => {
  const total = parseFloat(totalAmount) || 0;
  const numMembers = groupMembers.length;
  const perPerson = numMembers > 0 ? (total / numMembers).toFixed(2) : '0.00';

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
        <p className="text-center text-lg font-medium text-white mb-1">
          {currencySymbol}{perPerson} per person
        </p>
        <p className="text-center text-sm text-slate-400">
          Last member absorbs rounding remainder automatically.
        </p>
      </div>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {groupMembers.map(m => (
          <div key={m.user_id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
            <span className="text-slate-300 font-medium">{m.username}</span>
            <span className="text-emerald-400 font-mono font-medium">{currencySymbol}{perPerson}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EqualSplitView;
