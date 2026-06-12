import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="w-60 bg-slate-900 text-white flex flex-col flex-shrink-0 h-full">
      <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800 text-emerald-400">
        SplitwiseClone
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <Link to="/" className="block px-3 py-2 rounded hover:bg-slate-800 transition-colors">
          Dashboard
        </Link>
        <Link to="/groups" className="block px-3 py-2 rounded hover:bg-slate-800 transition-colors">
          Groups
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
        <div className="text-sm text-slate-400 truncate">{user?.username || 'Guest'}</div>
        <button onClick={logout} className="text-left text-sm text-rose-400 hover:text-rose-300">
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
