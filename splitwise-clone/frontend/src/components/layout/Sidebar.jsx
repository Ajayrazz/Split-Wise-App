import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Receipt, Scale, Coins, Bell, BarChart2, Clock, 
  Plus, PlusSquare, User, Settings, HelpCircle, LogOut, Upload
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import CreateGroupModal from '../groups/CreateGroupModal';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const getNavLinkClass = (path) => {
    const isActive = location.pathname === path || (path === '/groups' && location.pathname.startsWith('/groups') && location.pathname !== '/groups/new');
    
    if (isActive) {
      return "flex items-center gap-3 px-3 py-2 rounded bg-slate-700/80 text-white border-l-2 border-emerald-500 transition-colors font-medium";
    }
    return "flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-700/40 transition-colors duration-150 border-l-2 border-transparent";
  };

  const getIconClass = (path) => {
    const isActive = location.pathname === path || (path === '/groups' && location.pathname.startsWith('/groups'));
    return isActive ? "text-emerald-400" : "";
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 font-bold text-xl md:text-2xl border-b border-slate-800 text-emerald-400">
          <span>SplitwiseClone</span>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          <nav className="space-y-1">
            <Link to="/" onClick={onClose} className={getNavLinkClass('/')}>
              <Home size={18} className={getIconClass('/')} /> Dashboard
            </Link>
            <Link to="/groups" onClick={onClose} className={getNavLinkClass('/groups')}>
              <Users size={18} className={getIconClass('/groups')} /> Groups
            </Link>
            <Link to="/expenses" onClick={onClose} className={getNavLinkClass('/expenses')}>
              <Receipt size={18} className={getIconClass('/expenses')} /> Expenses
            </Link>
            <Link to="/balances" onClick={onClose} className={getNavLinkClass('/balances')}>
              <Scale size={18} className={getIconClass('/balances')} /> Balances
            </Link>
            <Link to="/settlements" onClick={onClose} className={getNavLinkClass('/settlements')}>
              <Coins size={18} className={getIconClass('/settlements')} /> Settlements
            </Link>
            <Link to="/activity" onClick={onClose} className={getNavLinkClass('/activity')}>
              <Bell size={18} className={getIconClass('/activity')} /> Activity
            </Link>
            <Link to="/analytics" onClick={onClose} className={getNavLinkClass('/analytics')}>
              <BarChart2 size={18} className={getIconClass('/analytics')} /> Analytics
            </Link>
            <Link to="/recent" onClick={onClose} className={getNavLinkClass('/recent')}>
              <Clock size={18} className={getIconClass('/recent')} /> Recent
            </Link>
          </nav>

          <hr className="border-slate-800" />

          <nav className="space-y-1">
            <button 
              onClick={() => setIsCreateGroupOpen(true)}
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-700/40 transition-colors duration-150 border-l-2 border-transparent"
            >
              <Plus size={18} /> Create Group
            </button>
            <button 
              onClick={() => window.dispatchEvent(new Event('openAddExpenseModal'))} 
              className="w-full text-left flex items-center gap-3 px-3 py-2 rounded text-slate-400 hover:text-white hover:bg-slate-700/40 transition-colors duration-150 border-l-2 border-transparent"
            >
              <PlusSquare size={18} /> Add Expense
            </button>
            <Link to="/import" onClick={onClose} className={getNavLinkClass('/import')}>
              <Upload size={18} className={getIconClass('/import')} /> Import CSV
            </Link>
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <nav className="space-y-1 mb-4">
            <Link to="/profile" onClick={onClose} className={getNavLinkClass('/profile')}>
              <User size={18} className={getIconClass('/profile')} /> Profile
            </Link>
            <Link to="/settings" onClick={onClose} className={getNavLinkClass('/settings')}>
              <Settings size={18} className={getIconClass('/settings')} /> Settings
            </Link>
            <Link to="/help" onClick={onClose} className={getNavLinkClass('/help')}>
              <HelpCircle size={18} className={getIconClass('/help')} /> Help
            </Link>
          </nav>
          
          <div className="flex items-center justify-between px-3 pt-4 border-t border-slate-800">
            <div className="text-sm text-emerald-400 font-medium truncate">{user?.username || 'Guest'}</div>
            <button onClick={logout} className="text-rose-400 hover:text-rose-300 transition-colors" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>

      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)} 
        onSuccess={() => window.location.reload()} 
      />
    </>
  );
};

export default Sidebar;
