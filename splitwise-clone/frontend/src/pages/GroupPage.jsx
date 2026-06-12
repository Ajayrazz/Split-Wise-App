import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import ExpenseList from '../components/expenses/ExpenseList';
import BalanceLedger from '../components/balances/BalanceLedger';
import ChatPanel from '../components/chat/ChatPanel';
import useAuth from '../hooks/useAuth';
import InviteMemberPanel from '../components/groups/InviteMemberPanel';
import MemberRoster from '../components/groups/MemberRoster';

const GroupPage = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [activeChatExpense, setActiveChatExpense] = useState(null);
  const { user } = useAuth();

  const fetchGroup = useCallback(async () => {
    try {
      const res = await client.get(`/groups/${id}/`);
      setGroup(res.data);
    } catch(err) {}
  }, [id]);

  useEffect(() => {
    fetchGroup();
    setActiveChatExpense(null);
  }, [fetchGroup]);

  if (!group) return <div className="p-8 text-white">Loading group...</div>;

  return (
    <div className={`h-full transition-all duration-300 ${activeChatExpense ? 'mr-80' : ''}`}>
      <div className="lg:grid lg:grid-cols-3 gap-6 h-full">
        {/* Left Column: 60% */}
        <div className="col-span-2 flex flex-col min-h-0 bg-slate-900 border border-slate-700 rounded-xl shadow-lg">
          <div className="p-6 border-b border-slate-700 bg-slate-800/50 rounded-t-xl">
            <h2 className="text-2xl font-bold text-white mb-1">{group.name}</h2>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span>{group.members?.length || 0} Members</span>
              {group.created_at && (
                <>
                  <span className="text-slate-600">•</span>
                  <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <ExpenseList 
              groupId={id} 
              members={group.members || []} 
              onExpenseClick={(expense) => setActiveChatExpense(expense)} 
              activeExpenseId={activeChatExpense?.id}
            />
          </div>
        </div>

        {/* Right Column: 40% */}
        <div className="col-span-1 flex flex-col gap-5 min-h-0 overflow-y-auto pr-1">
          <InviteMemberPanel groupId={id} onMemberAdded={fetchGroup} />
          
          <MemberRoster groupId={id} currentUserId={user?.id} />
          
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
             <BalanceLedger groupId={id} groupMembers={group.members || []} />
          </div>
        </div>
      </div>

      <ChatPanel 
        expense={activeChatExpense} 
        onClose={() => setActiveChatExpense(null)} 
      />
    </div>
  );
};

export default GroupPage;
