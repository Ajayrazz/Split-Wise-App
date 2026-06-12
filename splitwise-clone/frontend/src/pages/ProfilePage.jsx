import React, { useEffect, useState } from 'react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import { useActivityFeed } from '../hooks/useActivityFeed';
import { useGlobalBalance } from '../context/GlobalBalanceContext';
import { useSettings } from '../hooks/useSettings';
import CardSkeleton from '../components/shared/CardSkeleton';

const ProfilePage = () => {
  const { user } = useAuth();
  const { activities, isLoading: activityLoading } = useActivityFeed();
  const { metrics, isLoading: metricsLoading } = useGlobalBalance();
  const { settings } = useSettings();
  
  const [groupCount, setGroupCount] = useState(0);
  const [loadingGroups, setLoadingGroups] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await client.get('/groups/');
        setGroupCount(res.data.length);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  if (!user) return null;

  const dateJoined = user.created_at 
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    : 'Unknown';
    
  const initial = user.username ? user.username.charAt(0).toUpperCase() : '?';

  const expensesCreated = activities.filter(a => a.type === 'expense' && a.meta.paid_by === user.id).length;
  const totalPaidOut = activities.filter(a => a.type === 'expense' && a.meta.paid_by === user.id).reduce((sum, a) => sum + a.amount, 0);
  const totalSettled = activities.filter(a => a.type === 'settlement' && a.meta.payer_id === user.id).reduce((sum, a) => sum + a.amount, 0);

  const formatMoney = (amount) => {
    return parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isLoading = activityLoading || metricsLoading || loadingGroups;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Profile</h1>
      </div>

      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 flex items-center gap-8 mb-8 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-3xl font-bold flex items-center justify-center shrink-0">
          {initial}
        </div>
        <div>
          <h2 className="text-white text-2xl font-bold mb-1">{user.first_name} {user.last_name || user.username}</h2>
          <p className="text-slate-400 text-sm mb-1">{user.email}</p>
          <p className="text-slate-500 text-xs">Member since {dateJoined}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatTile label="Groups Joined" value={groupCount} />
            <StatTile label="Expenses Created" value={expensesCreated} />
            <StatTile label="Total Paid Out" value={`${settings.currencySymbol}${formatMoney(totalPaidOut)}`} color="text-emerald-400" />
            <StatTile label="Total Settled" value={`${settings.currencySymbol}${formatMoney(totalSettled)}`} color="text-emerald-400" />
            <StatTile label="Currently Owed to You" value={`${settings.currencySymbol}${formatMoney(metrics.totalOwedToMe)}`} color="text-emerald-400" />
            <StatTile label="You Currently Owe" value={`${settings.currencySymbol}${formatMoney(metrics.totalIOwe)}`} color="text-red-400" />
          </>
        )}
      </div>
    </div>
  );
};

const StatTile = ({ label, value, color = "text-white" }) => (
  <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
    <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</p>
    <p className={`font-mono font-bold text-2xl ${color}`}>{value}</p>
  </div>
);

export default ProfilePage;
