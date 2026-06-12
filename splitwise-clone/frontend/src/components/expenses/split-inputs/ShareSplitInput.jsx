import React from 'react';

const ShareSplitInput = ({ groupMembers, splits, onSplitsChange, totalAmount }) => {
  const total = parseFloat(totalAmount) || 0;
  const totalShares = splits.reduce((acc, s) => acc + parseInt(s.shares || 0, 10), 0);

  const handleChange = (userId, value) => {
    const intVal = parseInt(value, 10);
    const updated = splits.map(s => s.user_id === userId ? { ...s, shares: isNaN(intVal) ? '' : intVal } : s);
    onSplitsChange(updated);
  };

  return (
    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
      {groupMembers.map(m => {
        const split = splits.find(s => s.user_id === m.user_id) || {};
        const shares = parseInt(split.shares || 0, 10);
        const computedAmt = totalShares > 0 ? ((shares / totalShares) * total).toFixed(2) : '0.00';
        
        return (
          <div key={m.user_id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
            <div>
              <div className="text-slate-300 font-medium">{m.username}</div>
              <div className="text-xs text-emerald-400/80 mt-0.5 font-mono">≈ ₹{computedAmt}</div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="w-8 h-8 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center font-bold transition-colors"
                onClick={() => handleChange(m.user_id, Math.max(1, shares - 1))}
              >-</button>
              <input 
                type="number"
                min="1"
                step="1"
                value={split.shares || ''}
                onChange={(e) => handleChange(m.user_id, e.target.value)}
                className="w-16 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-center text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button 
                className="w-8 h-8 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center justify-center font-bold transition-colors"
                onClick={() => handleChange(m.user_id, shares + 1)}
              >+</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ShareSplitInput;
