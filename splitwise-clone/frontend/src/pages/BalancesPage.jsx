import React, { useState, useEffect } from 'react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import BalanceCard from '../components/balances/BalanceCard';
import SettlementModal from '../components/settlements/SettlementModal';
import CardSkeleton from '../components/shared/CardSkeleton';
import { Layers } from 'lucide-react';

const BalancesPage = () => {
  const { user } = useAuth();
  const [groupBalances, setGroupBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [settlementData, setSettlementData] = useState(null);

  const fetchAllBalances = async () => {
    try {
      const groupsRes = await client.get('/groups/');
      const groups = groupsRes.data;
      
      const balancesData = await Promise.all(
        groups.map(async (g) => {
          const balRes = await client.get(`/groups/${g.id}/balances/`);
          return {
            group: g,
            balances: balRes.data
          };
        })
      );
      
      setGroupBalances(balancesData);
      
      const initialExpanded = {};
      balancesData.forEach(gb => initialExpanded[gb.group.id] = true);
      setExpandedGroups(initialExpanded);
      
    } catch (error) {
      console.error("Failed to fetch balances", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBalances();
  }, []);

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSettleClick = (groupId, data) => {
    setSettlementData({ ...data, groupId });
  };

  const handleSettlementComplete = () => {
    fetchAllBalances();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto pb-20">
        <div className="h-10 w-64 bg-slate-800 rounded mb-8 animate-pulse"></div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center">
            <Layers className="mr-3 text-emerald-500" size={28} />
            Global Balances
          </h1>
          <p className="text-slate-400 mt-2">All your debts and credits across all groups.</p>
        </div>
      </div>

      <div className="space-y-6">
        {groupBalances.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700">
            <p className="text-slate-400">You are not part of any groups yet.</p>
          </div>
        ) : (
          groupBalances.map(({ group, balances }) => {
            const isExpanded = expandedGroups[group.id];
            
            let groupNet = 0;
            balances.forEach(b => {
              const amt = parseFloat(b.amount);
              if (b.to_user_id === user?.id) groupNet += amt;
              else if (b.from_user_id === user?.id) groupNet -= amt;
            });

            return (
              <div key={group.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-lg">
                <div 
                  onClick={() => toggleGroup(group.id)}
                  className="bg-slate-900/50 p-4 border-b border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-colors"
                >
                  <div>
                    <h2 className="text-lg font-bold text-white">{group.name}</h2>
                    <p className="text-sm text-slate-400 mt-0.5">{group.members?.length || 0} members</p>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Your Net</p>
                      <p className={`font-mono font-medium ${groupNet > 0 ? 'text-emerald-400' : groupNet < 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        {groupNet > 0 ? '+' : ''}₹{Math.abs(groupNet).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-slate-400 w-6 flex justify-center">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-800/30">
                    {balances.length === 0 ? (
                      <p className="text-slate-400 text-center text-sm py-4">All settled up in this group!</p>
                    ) : (
                      <div className="space-y-3">
                        {balances.map((b, idx) => {
                          const user1Obj = group.members?.find(m => m.user_id === b.from_user_id) || { username: 'Unknown' };
                          const user2Obj = group.members?.find(m => m.user_id === b.to_user_id) || { username: 'Unknown' };
                          const enrichedBalance = {
                            ...b,
                            from_username: user1Obj.username,
                            to_username: user2Obj.username
                          };
                          
                          return (
                            <BalanceCard 
                              key={idx} 
                              balance={enrichedBalance} 
                              currentUserId={user?.id}
                              onSettle={(data) => handleSettleClick(group.id, data)}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <SettlementModal 
        isOpen={!!settlementData}
        onClose={() => setSettlementData(null)}
        groupId={settlementData?.groupId}
        payerId={settlementData?.payerId}
        payeeId={settlementData?.payeeId}
        payerName={settlementData?.payerName}
        payeeName={settlementData?.payeeName}
        maxAmount={settlementData?.maxAmount}
        onSettled={handleSettlementComplete}
      />
    </div>
  );
};

export default BalancesPage;
