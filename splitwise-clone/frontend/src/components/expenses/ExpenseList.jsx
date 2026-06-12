import React, { useEffect, useState } from 'react';
import client from '../../api/client';
import ExpenseCard from './ExpenseCard';
import AddExpenseModal from './AddExpenseModal';

const ExpenseList = ({ groupId, members, onExpenseClick, activeExpenseId }) => {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchExpenses = async () => {
    try {
      const res = await client.get(`/groups/${groupId}/expenses/`);
      setExpenses(res.data);
    } catch(err) {}
  };

  useEffect(() => {
    fetchExpenses();
  }, [groupId]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-slate-700">Expenses</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 text-sm font-medium"
        >
          Add Expense
        </button>
      </div>

      <div className="space-y-2">
        {expenses.map(e => (
          <ExpenseCard 
            key={e.id} 
            expense={e} 
            isActive={activeExpenseId === e.id} 
            onClick={() => onExpenseClick(e.id)} 
          />
        ))}
        {expenses.length === 0 && <p className="text-sm text-slate-500">No expenses yet.</p>}
      </div>

      {isModalOpen && (
        <AddExpenseModal 
          groupId={groupId} 
          members={members} 
          onClose={() => setIsModalOpen(false)} 
          onExpenseCreated={fetchExpenses} 
        />
      )}
    </div>
  );
};

export default ExpenseList;
