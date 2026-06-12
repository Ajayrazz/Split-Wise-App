import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';

const TopBanner = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({ owed: 0, owe: 0, net: 0 });

  const fetchGlobalMetrics = async () => {
    try {
      const groupsRes = await client.get('/groups/');
      const groups = groupsRes.data;

      let totalOwed = 0;
      let totalOwe = 0;

      await Promise.all(groups.map(async (g) => {
        const balRes = await client.get(`/groups/${g.id}/balances/`);
        const balances = balRes.data;
        balances.forEach(b => {
          const amt = parseFloat(b.amount);
          if (amt > 0) {
            if (b.to_user_id === user.id) totalOwed += amt;
            else if (b.from_user_id === user.id) totalOwe += amt;
          }
        });
      }));

      setMetrics({
        owed: totalOwed,
        owe: totalOwe,
        net: totalOwed - totalOwe
      });
    } catch (err) { }
  };

  useEffect(() => {
    if (user) {
      fetchGlobalMetrics();
      const handler = () => fetchGlobalMetrics();
      window.addEventListener('balancesUpdated', handler);
      return () => window.removeEventListener('balancesUpdated', handler);
    }
  }, [user]);

  return (
    <div className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-6 shrink-0 shadow-sm z-10 justify-between">
      <h1 className="text-lg font-semibold text-white">Overview</h1>
      <div className="flex space-x-6 text-sm">
        <div className="flex flex-col items-end">
          <span className="text-slate-400">You are owed</span>
          <span className="font-semibold text-emerald-400">₹{metrics.owed.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-400">You owe</span>
          <span className="font-semibold text-rose-400">₹{metrics.owe.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-slate-400">Total net</span>
          {metrics.net === 0 ? (
            <span className="font-semibold text-slate-400">Settled up ✓</span>
          ) : (
            <span className={`font-semibold ${metrics.net > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Net: {metrics.net > 0 ? '+' : '-'}₹{Math.abs(metrics.net).toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
