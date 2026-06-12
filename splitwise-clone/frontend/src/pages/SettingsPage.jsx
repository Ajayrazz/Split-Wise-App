import React from 'react';
import useAuth from '../hooks/useAuth';
import { useSettings } from '../hooks/useSettings';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const { settings, updateSetting } = useSettings();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your app preferences and configurations.</p>
      </div>

      <div className="space-y-8">
        {/* SECTION 1: Display Preferences */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Display Preferences</h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl divide-y divide-slate-700">
            
            {/* Row 1: Currency Symbol */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Currency Symbol</p>
                <p className="text-sm text-slate-400 mt-0.5">Used throughout the app</p>
              </div>
              <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                {['₹', '$', '€', '£'].map(sym => (
                  <button
                    key={sym}
                    onClick={() => updateSetting('currencySymbol', sym)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      settings.currencySymbol === sym 
                        ? 'bg-emerald-500 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {sym}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: Date Format */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Date Format</p>
              </div>
              <select
                value={settings.dateFormat}
                onChange={(e) => updateSetting('dateFormat', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="DD MMM YYYY">12 Jun 2026</option>
                <option value="MM/DD/YYYY">06/12/2026</option>
                <option value="YYYY-MM-DD">2026-06-12</option>
              </select>
            </div>

            {/* Row 3: Show Zero Balances */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Show zero balances in ledger</p>
                <p className="text-sm text-slate-400 mt-0.5">Include settled pairs in balance views</p>
              </div>
              <button
                onClick={() => updateSetting('showZeroBalances', !settings.showZeroBalances)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  settings.showZeroBalances ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    settings.showZeroBalances ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Row 4: Compact Mode */}
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Compact table rows</p>
                <p className="text-sm text-slate-400 mt-0.5">Reduce row height in expense table</p>
              </div>
              <button
                onClick={() => updateSetting('compactMode', !settings.compactMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  settings.compactMode ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ${
                    settings.compactMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* SECTION 2: Account */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Account</h2>
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl divide-y divide-slate-700">
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="font-medium text-white">Email Address</p>
              <p className="text-slate-400">{user?.email}</p>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <p className="font-medium text-white">Username</p>
              <p className="text-slate-400">{user?.username}</p>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-2 px-2">To change account details, contact support.</p>
        </div>

        {/* SECTION 3: Danger Zone */}
        <div>
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h2>
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl px-6 py-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Sign Out of All Devices</p>
              <p className="text-sm text-slate-400 mt-0.5">Invalidates your current session token.</p>
            </div>
            <button
              onClick={logout}
              className="text-red-400 border border-red-500/30 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
