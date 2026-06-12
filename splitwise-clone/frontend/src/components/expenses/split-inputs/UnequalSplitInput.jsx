import React from 'react';

const UnequalSplitInput = ({ groupMembers, splits, onSplitsChange }) => {
  const handleChange = (userId, value) => {
    const updated = splits.map(s => s.user_id === userId ? { ...s, amount_owed: value } : s);
    onSplitsChange(updated);
  };

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
      {groupMembers.map(m => {
        const split = splits.find(s => s.user_id === m.user_id) || {};
        return (
          <div key={m.user_id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
            <span className="text-slate-300 font-medium">{m.username}</span>
            <div className="relative w-32">
              <span className="absolute left-3 top-1.5 text-slate-400">₹</span>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={split.amount_owed || ''}
                onChange={(e) => handleChange(m.user_id, e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded px-3 pl-7 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-right font-mono"
                placeholder="0.00"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default UnequalSplitInput;
