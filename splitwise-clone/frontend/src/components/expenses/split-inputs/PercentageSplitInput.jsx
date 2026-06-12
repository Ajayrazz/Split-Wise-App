import React from 'react';

const PercentageSplitInput = ({ groupMembers, splits, onSplitsChange }) => {
  const handleChange = (userId, value) => {
    const updated = splits.map(s => s.user_id === userId ? { ...s, percentage: value } : s);
    onSplitsChange(updated);
  };

  const handleSplitEqually = () => {
    if (groupMembers.length === 0) return;
    const pct = (100 / groupMembers.length).toFixed(2);
    const updated = splits.map(s => ({ ...s, percentage: pct }));
    onSplitsChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button 
          onClick={handleSplitEqually}
          className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
        >
          Split Equally (100 / {groupMembers.length})
        </button>
      </div>
      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
        {groupMembers.map(m => {
          const split = splits.find(s => s.user_id === m.user_id) || {};
          return (
            <div key={m.user_id} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
              <span className="text-slate-300 font-medium">{m.username}</span>
              <div className="relative w-28">
                <input 
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={split.percentage || ''}
                  onChange={(e) => handleChange(m.user_id, e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 pr-8 py-1.5 text-white focus:outline-none focus:border-emerald-500 text-right font-mono"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1.5 text-slate-400">%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PercentageSplitInput;
