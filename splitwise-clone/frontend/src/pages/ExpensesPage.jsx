import React, { useEffect, useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import TableSkeleton from '../components/shared/TableSkeleton';
import ExpenseTable from '../components/expenses/ExpenseTable';
import AddExpenseModal from '../components/expenses/AddExpenseModal';
import ChatPanel from '../components/chat/ChatPanel';

const ExpensesPage = () => {
  const { expenses, isLoading, refetch } = useExpenses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeChatExpense, setActiveChatExpense] = useState(null);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const handleOpenModal = () => setIsModalOpen(true);
    window.addEventListener('openAddExpenseModal', handleOpenModal);
    return () => window.removeEventListener('openAddExpenseModal', handleOpenModal);
  }, []);

  return (
    <div className={`flex-1 p-8 overflow-y-auto bg-slate-900 text-white transition-all duration-300 ${activeChatExpense ? 'mr-80' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Expenses</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-emerald-500/20"
        >
          + Add Expense
        </button>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : expenses.length === 0 ? (
        <div className="bg-slate-800/50 rounded-lg p-10 text-center border border-slate-700">
          <p className="text-slate-400 mb-4">No expenses yet. Add your first one!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            + Add Expense
          </button>
        </div>
      ) : (
        <ExpenseTable expenses={expenses} onRowClick={(expense) => setActiveChatExpense(expense)} />
      )}

      {isModalOpen && (
        <AddExpenseModal 
          onClose={() => setIsModalOpen(false)} 
          onExpenseCreated={refetch} 
        />
      )}

      <ChatPanel 
        expense={activeChatExpense} 
        onClose={() => setActiveChatExpense(null)} 
      />
    </div>
  );
};

export default ExpensesPage;
