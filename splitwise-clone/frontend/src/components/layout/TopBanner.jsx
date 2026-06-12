import React, { useEffect, useState } from 'react';
import { useLocation, matchPath } from 'react-router-dom';
import { useGlobalBalance } from '../../context/GlobalBalanceContext';
import { useSettings } from '../../hooks/useSettings';
import client from '../../api/client';
import { Menu } from 'lucide-react';

const TopBanner = ({ onMenuClick }) => {
  const { metrics } = useGlobalBalance();
  const { settings } = useSettings();
  const location = useLocation();
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    const match = matchPath({ path: '/groups/:id' }, location.pathname);
    if (match && match.params.id) {
      client.get(`/groups/${match.params.id}/`)
        .then(res => setGroupName(res.data.name))
        .catch(() => setGroupName('Group Details'));
    } else {
      setGroupName('');
    }
  }, [location.pathname]);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/expenses')) return 'All Expenses';
    if (path.startsWith('/balances')) return 'Balances';
    if (path.startsWith('/settlements')) return 'Settlements';
    if (path.startsWith('/activity')) return 'Activity';
    if (path.startsWith('/analytics')) return 'Analytics';
    if (path.startsWith('/recent')) return 'Recent';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/help')) return 'Help';
    if (path.startsWith('/groups/')) return groupName || 'Loading...';
    return 'Splitwise Clone';
  };

  return (
    <div className="bg-slate-900 border-b border-slate-700/60 px-4 md:px-6 flex items-center justify-between h-16 shrink-0 z-10 w-full overflow-hidden">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="md:hidden text-slate-400 hover:text-white p-1 -ml-1 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-white font-semibold text-lg truncate max-w-[150px] sm:max-w-xs">{getPageTitle()}</h1>
      </div>
      
      <div className="flex flex-row gap-4 md:gap-6 overflow-x-auto no-scrollbar items-center justify-end pl-4">
        {/* TILE 1 */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-slate-400 text-xs uppercase tracking-wider">You Are Owed</span>
          {metrics.isLoading ? (
            <div className="animate-pulse bg-slate-700 rounded h-5 w-16" />
          ) : (
            <span className="text-emerald-400 font-mono font-semibold text-base">{settings.currencySymbol}{metrics.totalOwedToMe.toFixed(2)}</span>
          )}
        </div>

        <div className="w-px h-8 bg-slate-700 self-center" />

        {/* TILE 2 */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-slate-400 text-xs uppercase tracking-wider">You Owe</span>
          {metrics.isLoading ? (
            <div className="animate-pulse bg-slate-700 rounded h-5 w-16" />
          ) : (
            <span className="text-red-400 font-mono font-semibold text-base">{settings.currencySymbol}{metrics.totalIOwe.toFixed(2)}</span>
          )}
        </div>

        <div className="w-px h-8 bg-slate-700 self-center" />

        {/* TILE 3 */}
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-slate-400 text-xs uppercase tracking-wider">Net</span>
          {metrics.isLoading ? (
            <div className="animate-pulse bg-slate-700 rounded h-5 w-20" />
          ) : (
            Math.abs(metrics.net) > 0.001 ? (
              metrics.net > 0 ? (
                <span className="text-emerald-400 font-mono font-semibold text-base">{settings.currencySymbol}{metrics.net.toFixed(2)}</span>
              ) : (
                <span className="text-red-400 font-mono font-semibold text-base">-{settings.currencySymbol}{Math.abs(metrics.net).toFixed(2)}</span>
              )
            ) : (
              <span className="text-slate-400 font-mono font-semibold text-base">Settled ✓</span>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
