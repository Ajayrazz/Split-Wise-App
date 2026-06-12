import React, { useState, useEffect } from 'react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';
import CardSkeleton from '../components/shared/CardSkeleton';
import { Coins } from 'lucide-react';

const SettlementsPage = () => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettlements = async () => {
      try {
        const groupsRes = await client.get('/groups/');
        const groups = groupsRes.data;
        
        let allSettlements = [];
        await Promise.all(
          groups.map(async (g) => {
            const setRes = await client.get(`/groups/${g.id}/settlements/`);
            const withGroup = setRes.data.map(s => ({ ...s, groupName: g.name }));
            allSettlements = [...allSettlements, ...withGroup];
          })
        );
        
        allSettlements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setSettlements(allSettlements);
      } catch (error) {
        console.error("Failed to fetch settlements", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettlements();
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pb-20">
        <div className="h-10 w-64 bg-slate-800 rounded mb-8 animate-pulse"></div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Coins className="mr-3 text-emerald-500" size={28} />
            Settlements History
          </h1>
          <p className="text-slate-400 mt-2">A record of all payments made across all your groups.</p>
        </div>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
        {settlements.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            No settlements recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Group</th>
                  <th className="px-6 py-4 font-semibold">Payer</th>
                  <th className="px-6 py-4 font-semibold">Payee</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {settlements.map((s) => {
                  const date = new Date(s.created_at).toLocaleDateString([], { 
                    year: 'numeric', month: 'short', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  });
                  return (
                    <tr key={s.id} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">{date}</td>
                      <td className="px-6 py-4 font-medium text-white">{s.groupName}</td>
                      <td className="px-6 py-4">
                        <span className={s.payer === user?.id ? 'text-emerald-400 font-medium' : ''}>
                          {s.payer_username}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={s.payee === user?.id ? 'text-emerald-400 font-medium' : ''}>
                          {s.payee_username}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="font-mono font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                          {settings.currencySymbol}{parseFloat(s.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettlementsPage;
