import React, { useState, useEffect } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import useAuth from '../../hooks/useAuth';

const ExpenseCard = ({ expense, isActive, onClick }) => {
  const { accessToken } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const { messages } = useWebSocket(expense.id, accessToken);

  useEffect(() => {
    if (!isActive && messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  }, [messages.length, isActive]);

  useEffect(() => {
    if (isActive) {
      setUnreadCount(0);
    }
  }, [isActive]);

  return (
    <div 
      onClick={onClick}
      className={`p-3 rounded border cursor-pointer transition-colors relative ${isActive ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200 hover:bg-slate-50'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-slate-800">{expense.description}</h4>
          <p className="text-xs text-slate-500">Paid by {expense.paid_by.username}</p>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-800">₹{expense.total_amount}</div>
          <div className="text-xs text-slate-500">{new Date(expense.created_at).toLocaleDateString()}</div>
        </div>
      </div>
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          {unreadCount} new
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
