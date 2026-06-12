import React, { useState } from 'react';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useSettings } from '../hooks/useSettings';
import CardSkeleton from '../components/shared/CardSkeleton';
import { Activity } from 'lucide-react';

const ActivityPage = () => {
  const { activities, isLoading } = useActivityFeed();
  const { settings } = useSettings();
  const [filter, setFilter] = useState('all');

  const filteredActivities = activities.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const getFormatDate = (timestamp) => {
    const d = new Date(timestamp);
    const today = new Date();
    const isToday = d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    
    if (isToday) return `Today at ${time}`;
    return `${d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} at ${time}`;
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Activity Feed</h1>
        <p className="text-slate-500 mt-2">All recent actions across your groups, sorted newest first.</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            filter === 'all' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            filter === 'expense' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setFilter('settlement')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            filter === 'settlement' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700/50'
          }`}
        >
          Settlements
        </button>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton count={5} />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
              <Activity className="text-slate-600" size={32} />
            </div>
            <p className="text-slate-400 font-medium">No activity yet. Create a group and add some expenses!</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-700 ml-3 space-y-6 pb-6">
            {filteredActivities.map((item) => (
              <div key={item.id} className="relative pl-8 pb-6">
                <div 
                  className={`absolute left-[-6px] top-2 w-2.5 h-2.5 rounded-full border-2 border-slate-700 ${
                    item.type === 'expense' ? 'bg-blue-500' :
                    item.type === 'settlement' ? 'bg-emerald-500' :
                    'bg-purple-500'
                  }`}
                />
                
                <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <p className="text-white text-sm">
                      {item.description}
                    </p>
                    {item.amount !== null && (
                      <span className={`px-2 py-0.5 rounded text-xs font-mono shrink-0 ${
                        item.type === 'expense' ? 'bg-blue-500/15 text-blue-300' : 'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {settings.currencySymbol}{item.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded">
                      {item.groupName}
                    </span>
                    <span className="text-slate-500 text-xs">
                      {getFormatDate(item.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
