import React from 'react';

const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-800 rounded-xl p-4 space-y-3 animate-pulse border border-slate-700">
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
          <div className="h-3 bg-slate-700/60 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export default CardSkeleton;
