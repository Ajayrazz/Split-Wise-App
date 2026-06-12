import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';

const BalanceLedger = ({ groupId, groupMembers }) => {
  const [balances, setBalances] = useState([]);
  const [settlementPayee, setSettlementPayee] = useState(null);
  const [settlementAmount, setSettlementAmount] = useState('');
  const { user } = useAuth();

  const fetchBalances = async () => {
    try {
      const res = await client.get(`/groups/${groupId}/balances/`);
      setBalances(res.data);
    } catch (err) { }
  };

  useEffect(() => {
    fetchBalances();
  }, [groupId]);

  const handleSettle = async (e) => {
    e.preventDefault();
    if (!settlementPayee || !settlementAmount) return;
    try {
      await client.post(`/groups/${groupId}/settlements/`, {
        payer_id: user.id,
        payee_id: settlementPayee.id,
        amount: settlementAmount
      });
      setSettlementPayee(null);
      setSettlementAmount('');
      fetchBalances();
      window.dispatchEvent(new Event('balancesUpdated'));
    } catch (err) {
      alert("Settlement failed: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-bold text-slate-800">Balances</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {balances.map((b, idx) => {
          if (parseFloat(b.amount) <= 0) return null;
          const isUserInvolved = b.from_user_id === user.id || b.to_user_id === user.id;
          const user1Obj = groupMembers.find(m => m.user_id === b.from_user_id) || { username: 'Unknown', id: b.from_user_id };
          const user2Obj = groupMembers.find(m => m.user_id === b.to_user_id) || { username: 'Unknown', id: b.to_user_id };

          const payer = user1Obj;
          const payee = user2Obj;

          let highlightClass = "text-slate-700";
          if (isUserInvolved) {
            if (payee.id === user.id) highlightClass = "text-emerald-600 font-semibold";
            if (payer.id === user.id) highlightClass = "text-rose-600 font-semibold";
          }

          return (
            <div key={idx} className="flex justify-between items-center p-3 border rounded border-slate-200 shadow-sm">
              <span className={highlightClass}>
                {payer.username} owes {payee.username} ₹{b.amount}
              </span>
              {payer.id === user.id && (
                <button
                  onClick={() => {
                    setSettlementPayee(payee);
                    setSettlementAmount(b.amount);
                  }}
                  className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded text-sm hover:bg-emerald-200 transition-colors"
                >
                  Settle Up
                </button>
              )}
            </div>
          );
        })}
        {balances.filter(b => parseFloat(b.amount) > 0).length === 0 && (
          <p className="text-slate-500 text-center py-4">All settled up!</p>
        )}
      </div>

      {settlementPayee && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <h4 className="font-semibold text-slate-700 mb-2">Record Settlement to {settlementPayee.username}</h4>
          <form onSubmit={handleSettle} className="flex gap-2">
            <input
              type="number" step="0.01" max={settlementAmount} required
              value={settlementAmount} onChange={e => setSettlementAmount(e.target.value)}
              className="flex-1 border rounded p-2"
            />
            <button type="button" onClick={() => setSettlementPayee(null)} className="px-3 py-2 text-slate-600 hover:bg-slate-200 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Record</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BalanceLedger;
