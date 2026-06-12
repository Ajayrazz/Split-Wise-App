import React from 'react';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useSettings } from '../hooks/useSettings';
import CardSkeleton from '../components/shared/CardSkeleton';
import { useNavigate } from 'react-router-dom';

const RecentPage = () => {
  const { activities, isLoading } = useActivityFeed();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const recentExpenses = activities
    .filter(item => item.type === 'expense')
    .slice(0, 10);

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
        <h1 className="text-3xl font-bold text-slate-900">Recent Transactions</h1>
        <p className="text-slate-500 mt-2">Your most recent expenses across all groups.</p>
      </div>

      <div>
        {isLoading ? (
          <div className="space-y-4">
            <CardSkeleton count={4} />
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
            <p className="text-slate-400 font-medium mb-6">No recent expenses. Start by creating a group!</p>
            <button
              onClick={() => navigate('/groups')}
              className="bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Go to Groups
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-3xl">
            {recentExpenses.map((item) => (
              <div key={item.id} className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex items-center justify-between">
                
                {/* LEFT */}
                <div>
                  <p className="text-white font-medium text-sm mb-2">{item.meta.description}</p>
                  <div className="flex items-center gap-3 text-slate-400 text-xs">
                    <span className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                      {item.groupName}
                    </span>
                    <span>Paid by {item.actor}</span>
                    <span>•</span>
                    <span>{getFormatDate(item.timestamp)}</span>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="flex flex-col items-end gap-1">
                  <span className="text-emerald-400 font-mono font-semibold text-base">
                    {settings.currencySymbol}{item.amount.toFixed(2)}
                  </span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    item.meta.split_type === 'EQUAL' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.meta.split_type === 'UNEQUAL' ? 'bg-blue-500/20 text-blue-400' :
                    item.meta.split_type === 'PERCENTAGE' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.meta.split_type}
                  </span>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentPage;
