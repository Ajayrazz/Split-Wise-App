import React from 'react';
import { Bell, Shield, Smartphone, Globe, Moon, CreditCard, Palette } from 'lucide-react';

const SettingsPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-2">Manage your app preferences and configurations.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Settings Navigation/List */}
        <div className="divide-y divide-slate-100">
          
          <SettingItem 
            icon={<Bell className="text-amber-500" size={22} />}
            title="Notifications"
            description="Control how and when you want to be notified about expenses."
          />
          <SettingItem 
            icon={<Shield className="text-emerald-500" size={22} />}
            title="Security & Privacy"
            description="Manage devices, active sessions, and data sharing."
          />
          <SettingItem 
            icon={<Palette className="text-purple-500" size={22} />}
            title="Appearance"
            description="Customize your UI theme, colors, and accessibility settings."
            badge="New"
          />
          <SettingItem 
            icon={<CreditCard className="text-blue-500" size={22} />}
            title="Payment Methods"
            description="Link your bank accounts or third-party payment wallets."
          />
          <SettingItem 
            icon={<Globe className="text-cyan-500" size={22} />}
            title="Language & Region"
            description="Set your primary language and default currency format."
          />

        </div>
      </div>
    </div>
  );
};

const SettingItem = ({ icon, title, description, badge }) => (
  <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-white border border-transparent group-hover:border-slate-200 transition-all shadow-sm">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 flex items-center gap-3">
          {title}
          {badge && <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">{badge}</span>}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>
    <div className="text-slate-300 group-hover:text-slate-400 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </div>
  </div>
);

export default SettingsPage;
