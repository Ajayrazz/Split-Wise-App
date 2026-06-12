import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 6 }) => {
  return (
    <div className="w-full mt-4">
      <div className="bg-slate-900 px-6 py-4 rounded-t-lg flex space-x-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="flex-1">
             <div className="bg-slate-800 h-3 w-16 rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="bg-slate-800/50 rounded-b-lg border border-t-0 border-slate-700 divide-y divide-slate-700/50">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex px-6 py-4 space-x-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="flex-1 flex items-center">
                 <div className="bg-slate-700 h-4 w-24 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableSkeleton;
