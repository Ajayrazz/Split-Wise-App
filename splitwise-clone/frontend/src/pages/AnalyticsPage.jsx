import React, { useEffect, useState } from 'react';
import { PieChart, TrendingUp, DollarSign, Users } from 'lucide-react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import CardSkeleton from '../components/shared/CardSkeleton';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const groupsRes = await client.get('/groups/');
        const groups = groupsRes.data;
        
        let allExpenses = [];
        
        await Promise.all(groups.map(async (group) => {
          try {
            const expRes = await client.get(`/groups/${group.id}/expenses/`);
            const expenses = expRes.data.map(exp => ({...exp, group_name: group.name}));
            allExpenses = [...allExpenses, ...expenses];
          } catch(e) {}
        }));
        
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let totalSpentThisMonth = 0; 
        let yourShareThisMonth = 0;
        
        const groupExpenseCounts = {};
        
        const monthlyTrend = [0, 0, 0, 0, 0, 0];
        const monthNames = [];
        for (let i = 5; i >= 0; i--) {
           const d = new Date(currentYear, currentMonth - i, 1);
           monthNames.push(d.toLocaleDateString('en-US', { month: 'short' }));
        }

        allExpenses.forEach(exp => {
           const expDate = new Date(exp.created_at);
           
           groupExpenseCounts[exp.group_name] = (groupExpenseCounts[exp.group_name] || 0) + 1;
           
           const mySplit = exp.splits.find(s => s.user_id === user.id);
           const myAmount = mySplit ? parseFloat(mySplit.amount_owed) : 0;
           
           if (expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear) {
              if (mySplit) {
                 totalSpentThisMonth += parseFloat(exp.total_amount);
                 yourShareThisMonth += myAmount;
              }
           }
           
           const monthDiff = (currentYear - expDate.getFullYear()) * 12 + (currentMonth - expDate.getMonth());
           if (monthDiff >= 0 && monthDiff < 6) {
              const index = 5 - monthDiff;
              monthlyTrend[index] += myAmount;
           }
        });
        
        let mostActiveGroup = 'None';
        let maxExp = 0;
        for (const [gname, count] of Object.entries(groupExpenseCounts)) {
           if (count > maxExp) {
              maxExp = count;
              mostActiveGroup = gname;
           }
        }
        
        const maxMonthly = Math.max(...monthlyTrend, 1); 
        const trendHeights = monthlyTrend.map(v => (v / maxMonthly) * 100);

        setStats({
           totalSpentThisMonth,
           yourShareThisMonth,
           mostActiveGroup,
           mostActiveGroupCount: maxExp,
           totalGroups: groups.length,
           monthlyTrend,
           trendHeights,
           monthNames
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

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-2">Deep dive into your spending habits.</p>
      </div>

      {loading || !stats ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={<DollarSign />} title="Group Spend (This Month)" value={`₹${stats.totalSpentThisMonth.toFixed(2)}`} color="text-rose-500" bg="bg-rose-100" />
            <StatCard icon={<TrendingUp />} title="Your Share (This Month)" value={`₹${stats.yourShareThisMonth.toFixed(2)}`} color="text-emerald-500" bg="bg-emerald-100" />
            <StatCard icon={<PieChart />} title="Total Groups" value={stats.totalGroups} color="text-purple-500" bg="bg-purple-100" />
            <StatCard icon={<Users />} title="Most Active Group" value={stats.mostActiveGroup} trend={`${stats.mostActiveGroupCount} expenses`} isPositive={null} color="text-blue-500" bg="bg-blue-100" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Spending Breakdown</h3>
              <div className="flex items-center justify-center h-48 text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Expense categorization coming soon!
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Your Share (Last 6 Months)</h3>
              <div className="h-64 flex items-end justify-between gap-2 pb-4">
                {stats.trendHeights.map((height, i) => (
                  <div key={i} className="w-full bg-slate-100 rounded-t-md relative group flex flex-col justify-end h-full">
                    <div 
                      className="w-full bg-emerald-400 rounded-t-md group-hover:bg-emerald-500 transition-colors" 
                      style={{ height: `${height}%` }}
                    ></div>
                    <div className="absolute bottom-full mb-2 hidden group-hover:block w-full text-center text-xs font-bold text-slate-700">
                       ₹{stats.monthlyTrend[i].toFixed(0)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400 font-medium px-1 mt-2">
                {stats.monthNames.map((m, i) => <span key={i}>{m}</span>)}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ icon, title, value, trend, isPositive, color, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 ${bg} ${color} rounded-xl`}>{icon}</div>
      {trend && (
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          isPositive === true ? 'bg-emerald-100 text-emerald-700' : 
          isPositive === false ? 'bg-rose-100 text-rose-700' : 
          'bg-slate-100 text-slate-600'
        }`}>
          {trend}
        </span>
      )}
    </div>
    <div>
      <h4 className="text-slate-500 text-sm font-medium mb-1">{title}</h4>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default AnalyticsPage;
