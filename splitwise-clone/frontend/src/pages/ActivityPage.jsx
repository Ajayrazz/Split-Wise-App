import React, { useEffect, useState } from 'react';
import { PlusCircle, UserPlus, FileText } from 'lucide-react';
import client from '../api/client';
import useAuth from '../hooks/useAuth';
import CardSkeleton from '../components/shared/CardSkeleton';

const ActivityPage = () => {
  const { user } = useAuth();
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const groupsRes = await client.get('/groups/');
        const groups = groupsRes.data;
        
        let allActivity = [];
        
        await Promise.all(groups.map(async (group) => {
          try {
             allActivity.push({
                id: `group-${group.id}`,
                type: 'group',
                user: group.created_by === user.id ? 'You' : (group.members.find(m => m.user_id === group.created_by)?.username || 'Someone'),
                action: 'created the group',
                target: group.name,
                created_at: group.created_at,
                icon: <UserPlus size={20} />,
                color: 'text-purple-500',
                bg: 'bg-purple-100'
             });

            const expRes = await client.get(`/groups/${group.id}/expenses/`);
            const expenses = expRes.data.map(exp => ({
              id: `exp-${exp.id}`,
              type: 'expense',
              user: exp.created_by === user.id ? 'You' : (group.members.find(m => m.user_id === exp.created_by)?.username || 'Someone'),
              action: 'added an expense',
              target: exp.description,
              created_at: exp.created_at,
              icon: <PlusCircle size={20} />,
              color: 'text-emerald-500',
              bg: 'bg-emerald-100'
            }));
            
            const setRes = await client.get(`/groups/${group.id}/settlements/`);
            const settlements = setRes.data.map(settle => {
               const payerName = settle.payer_id === user.id ? 'You' : (group.members.find(m => m.user_id === settle.payer_id)?.username || 'Someone');
               const payeeName = settle.payee_id === user.id ? 'You' : (group.members.find(m => m.user_id === settle.payee_id)?.username || 'Someone');
               return {
                  id: `set-${settle.id}`,
                  type: 'settlement',
                  user: payerName,
                  action: `settled up ₹${parseFloat(settle.amount).toFixed(2)} with`,
                  target: payeeName,
                  created_at: settle.created_at,
                  icon: <FileText size={20} />,
                  color: 'text-amber-500',
                  bg: 'bg-amber-100'
               };
            });

            allActivity = [...allActivity, ...expenses, ...settlements];
          } catch(e) { console.error(e) }
        }));
        
        allActivity.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setActivity(allActivity.slice(0, 30));
      } catch(err) {
        console.error("Failed to fetch activity", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchActivity();
    }
  }, [user]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Activity Feed</h1>
          <p className="text-slate-500 mt-2">See what's happening across all your groups.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        {loading ? (
          <CardSkeleton count={5} />
        ) : activity.length === 0 ? (
           <div className="text-center text-slate-500 p-8">No activity yet.</div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8 pb-4">
            {activity.map((item) => (
              <div key={item.id} className="relative pl-8">
                <div className={`absolute -left-5 top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${item.bg} ${item.color} shadow-sm`}>
                  {item.icon}
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 hover:border-slate-300 transition-colors">
                  <p className="text-slate-800">
                    <span className="font-semibold text-slate-900">{item.user}</span> {item.action} <span className="font-semibold text-slate-900">{item.target}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1.5 font-medium">{new Date(item.created_at).toLocaleString()}</p>
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
