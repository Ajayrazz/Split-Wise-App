import React, { useEffect, useState } from 'react';
import { Clock, Receipt } from 'lucide-react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import CardSkeleton from '../components/shared/CardSkeleton';

const RecentPage = () => {
  const { user } = useAuth();
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const groupsRes = await client.get('/groups/');
        const groups = groupsRes.data;
        
        let allExpenses = [];
        
        await Promise.all(groups.map(async (group) => {
          try {
            const expRes = await client.get(`/groups/${group.id}/expenses/`);
            const expenses = expRes.data.map(exp => ({
              ...exp,
              group_name: group.name,
              payer_name: exp.paid_by === user.id ? 'You' : (group.members.find(m => m.user_id === exp.paid_by)?.username || 'Someone')
            }));
            allExpenses = [...allExpenses, ...expenses];
          } catch(e) { console.error(e) }
        }));
        
        allExpenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecentExpenses(allExpenses.slice(0, 20));
      } catch(err) {
        console.error("Failed to fetch recent expenses", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchRecent();
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Recent Transactions</h1>
        <p className="text-slate-500 mt-2">Your most recent expenses across all groups.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6">
             <CardSkeleton count={4} />
          </div>
        ) : recentExpenses.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            No recent transactions found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentExpenses.map((item) => (
              <li key={item.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-slate-100 text-slate-600`}>
                    <Receipt />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.description}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span className="font-medium px-2 py-0.5 bg-slate-100 rounded-md text-slate-600">{item.group_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">₹{parseFloat(item.total_amount).toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{item.payer_name} paid ₹{parseFloat(item.total_amount).toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentPage;
