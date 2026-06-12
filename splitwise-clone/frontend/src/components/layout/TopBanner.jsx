import React from 'react';

const TopBanner = () => {
  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center px-6 shrink-0 shadow-sm z-10 justify-between">
      <h1 className="text-lg font-semibold text-slate-800">Overview</h1>
      <div className="flex space-x-6 text-sm">
        <div className="flex flex-col items-end">
          <span className="text-slate-500">You are owed</span>
          <span className="font-semibold text-emerald-600">₹0.00</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-500">You owe</span>
          <span className="font-semibold text-rose-600">₹0.00</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-500">Total net</span>
          <span className="font-semibold text-slate-800">₹0.00</span>
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
