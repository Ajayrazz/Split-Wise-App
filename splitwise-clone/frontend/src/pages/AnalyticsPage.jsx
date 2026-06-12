import React, { useEffect, useState } from 'react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import { useGlobalBalance } from '../context/GlobalBalanceContext';
import { useSettings } from '../hooks/useSettings';
import CardSkeleton from '../components/shared/CardSkeleton';
import { BarChart2 } from 'lucide-react';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const { metrics } = useGlobalBalance();
  const { settings } = useSettings();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const groupsRes = await client.get('/groups/');
        const groups = groupsRes.data;
        
        let allExpenses = [];
        let allSettlements = [];
        
        await Promise.all(groups.map(async (group) => {
          try {
            const [expRes, setRes] = await Promise.all([
              client.get(`/groups/${group.id}/expenses/`),
              client.get(`/groups/${group.id}/settlements/`)
            ]);
            
            const expenses = expRes.data.map(exp => ({...exp, group_name: group.name}));
            allExpenses = [...allExpenses, ...expenses];
            
            allSettlements = [...allSettlements, ...setRes.data];
          } catch(e) {}
        }));
        
        // PANEL 1: Spending by Group
        const groupSpends = {};
        allExpenses.forEach(exp => {
          groupSpends[exp.group_name] = (groupSpends[exp.group_name] || 0) + parseFloat(exp.total_amount);
        });
        const sortedGroups = Object.entries(groupSpends)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total);
        const maxGroupSpend = sortedGroups.length ? sortedGroups[0].total : 1;

        // PANEL 2: Split Type Distribution
        const splitCounts = { EQUAL: 0, UNEQUAL: 0, PERCENTAGE: 0, SHARE: 0 };
        allExpenses.forEach(exp => {
          if (splitCounts[exp.split_type] !== undefined) {
            splitCounts[exp.split_type]++;
          }
        });

        // PANEL 3: Monthly Spending Trend (last 6 months)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthlyTrend = [0, 0, 0, 0, 0, 0];
        const monthNames = [];
        for (let i = 5; i >= 0; i--) {
           const d = new Date(currentYear, currentMonth - i, 1);
           monthNames.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }

        allExpenses.forEach(exp => {
           const expDate = new Date(exp.created_at);
           const monthDiff = (currentYear - expDate.getFullYear()) * 12 + (currentMonth - expDate.getMonth());
           if (monthDiff >= 0 && monthDiff < 6) {
              const index = 5 - monthDiff;
              monthlyTrend[index] += parseFloat(exp.total_amount);
           }
        });
        const maxMonthly = Math.max(...monthlyTrend, 1);
        const trendHeights = monthlyTrend.map(v => (v / maxMonthly) * 100);

        // PANEL 4: Your Personal Summary
        const totalPaid = allExpenses
          .filter(e => e.paid_by === user?.id)
          .reduce((sum, e) => sum + parseFloat(e.total_amount), 0);
          
        const totalReimbursed = allSettlements
          .filter(s => s.payee_id === user?.id)
          .reduce((sum, s) => sum + parseFloat(s.amount), 0);
          
        const outstanding = totalPaid - totalReimbursed;

        setData({
          sortedGroups,
          maxGroupSpend,
          splitCounts,
          monthlyTrend,
          trendHeights,
          monthNames,
          totalPaid,
          totalReimbursed,
          outstanding
        });
      } catch(err) {
        console.error("Failed to fetch analytics", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  if (loading || !data) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  // Check if completely empty
  const hasData = data.sortedGroups.length > 0;

  if (!hasData) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 mt-2">Deep dive into your spending habits.</p>
        </div>
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-10 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
            <BarChart2 className="text-slate-600" size={32} />
          </div>
          <p className="text-slate-400 font-medium">No analytics yet. Create a group and add some expenses!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-2">Deep dive into your spending habits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMN 1 */}
        <div className="flex flex-col gap-6">
          {/* PANEL 1: Spending by Group */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Spending by Group</h3>
            <div className="space-y-4">
              {data.sortedGroups.map((g, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1/3 truncate text-sm text-slate-300">{g.name}</div>
                  <div className="flex-1 flex items-center">
                    <div 
                      className="bg-emerald-500 h-3 rounded transition-all duration-500" 
                      style={{ width: `${(g.total / data.maxGroupSpend) * 100}%` }}
                    />
                  </div>
                  <div className="w-20 text-right font-mono text-sm text-slate-300">
                    {settings.currencySymbol}{g.total.toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PANEL 3: Monthly Spending Trend */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Monthly Spending Trend</h3>
            <div className="h-48 flex items-end justify-between gap-3 pb-2 mt-4">
              {data.trendHeights.map((height, i) => (
                <div key={i} className="flex-1 bg-slate-700/30 rounded-t-md relative group flex flex-col justify-end h-full transition-colors hover:bg-slate-700/50">
                  <div 
                    className="w-full bg-emerald-500/70 rounded-t-md group-hover:bg-emerald-500 transition-colors" 
                    style={{ height: `${height}%` }}
                    title={`${settings.currencySymbol}${data.monthlyTrend[i].toFixed(2)}`}
                  ></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 font-medium px-1 mt-3">
              {data.monthNames.map((m, i) => <span key={i} className="flex-1 text-center">{m}</span>)}
            </div>
          </div>
        </div>

        {/* COLUMN 2 */}
        <div className="flex flex-col gap-6">
          {/* PANEL 2: Split Type Distribution */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Split Type Distribution</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 border border-emerald-500/20 rounded-lg p-4 flex flex-col items-center">
                <span className="text-3xl font-bold text-emerald-400">{data.splitCounts.EQUAL}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Equal</span>
              </div>
              <div className="bg-slate-900/50 border border-blue-500/20 rounded-lg p-4 flex flex-col items-center">
                <span className="text-3xl font-bold text-blue-400">{data.splitCounts.UNEQUAL}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Unequal</span>
              </div>
              <div className="bg-slate-900/50 border border-purple-500/20 rounded-lg p-4 flex flex-col items-center">
                <span className="text-3xl font-bold text-purple-400">{data.splitCounts.PERCENTAGE}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Percentage</span>
              </div>
              <div className="bg-slate-900/50 border border-amber-500/20 rounded-lg p-4 flex flex-col items-center">
                <span className="text-3xl font-bold text-amber-400">{data.splitCounts.SHARE}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wide mt-1">Share</span>
              </div>
            </div>
          </div>

          {/* PANEL 4: Your Personal Summary */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Your Personal Summary</h3>
            <div className="space-y-6">
              <div>
                <span className="text-slate-400 text-sm block mb-1">Total You've Paid</span>
                <span className="text-3xl font-bold font-mono text-white">{settings.currencySymbol}{data.totalPaid.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-slate-400 text-sm block mb-1">Total Reimbursed</span>
                <span className="text-3xl font-bold font-mono text-emerald-400">{settings.currencySymbol}{data.totalReimbursed.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t border-slate-700">
                <span className="text-slate-400 text-sm block mb-1">Net Outstanding</span>
                <span className={`text-3xl font-bold font-mono ${data.outstanding > 0 ? 'text-blue-400' : 'text-white'}`}>
                  {settings.currencySymbol}{data.outstanding.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AnalyticsPage;
