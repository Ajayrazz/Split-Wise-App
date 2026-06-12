import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import ExpenseList from '../components/expenses/ExpenseList';
import BalanceLedger from '../components/balances/BalanceLedger';
import ChatPanel from '../components/chat/ChatPanel';
import useAuth from '../hooks/useAuth';

const GroupPage = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [emailToInvite, setEmailToInvite] = useState('');
  const [activeChatExpense, setActiveChatExpense] = useState(null);
  const { user } = useAuth();

  const fetchGroup = async () => {
    try {
      const res = await client.get(`/groups/${id}/`);
      setGroup(res.data);
    } catch(err) {}
  };

  useEffect(() => {
    fetchGroup();
    setActiveChatExpense(null);
  }, [id]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/groups/${id}/members/`, { user: emailToInvite });
      setEmailToInvite('');
      fetchGroup();
    } catch(err) {
      alert("Failed to add member: " + JSON.stringify(err.response?.data || {}));
    }
  };

  if (!group) return <div>Loading group...</div>;

  return (
    <div className={`flex h-full gap-6 transition-all duration-300 ${activeChatExpense ? 'mr-80' : ''}`}>
      {/* Left Panel: 60% */}
      <div className="flex-[3] flex flex-col min-h-0 bg-white border border-slate-200 rounded shadow-sm">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">{group.name}</h2>
            <p className="text-sm text-slate-500">{group.members.length} Members: {group.members.map(m=>m.username).join(', ')}</p>
          </div>
          <form onSubmit={handleAddMember} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Invite user by email or username" 
              value={emailToInvite} 
              onChange={e=>setEmailToInvite(e.target.value)} 
              className="rounded border border-slate-300 p-1 text-sm w-48"
              required
            />
            <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">Add</button>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <ExpenseList 
            groupId={id} 
            members={group.members} 
            onExpenseClick={(expense) => setActiveChatExpense(expense)} 
            activeExpenseId={activeChatExpense?.id}
          />
        </div>
      </div>

      {/* Right Panel: 40% */}
      <div className="flex-[2] flex flex-col min-h-0 bg-slate-50 border border-slate-200 rounded shadow-sm overflow-hidden">
        <BalanceLedger groupId={id} groupMembers={group.members} />
      </div>

      <ChatPanel 
        expense={activeChatExpense} 
        onClose={() => setActiveChatExpense(null)} 
      />
    </div>
  );
};

export default GroupPage;
