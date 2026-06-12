import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plane, Home, Heart, Users, RefreshCw, BarChart2, 
  CreditCard, Globe, Shield, Activity, Receipt, PieChart 
} from 'lucide-react';
import useAuth from '../hooks/useAuth';

const DashboardPage = () => {
  const { user } = useAuth();

  const features = [
    { icon: <Users size={18} />, title: "Add groups and friends", link: "/groups" },
    { icon: <Receipt size={18} />, title: "Split expenses, record debts", link: "/expenses" },
    { icon: <PieChart size={18} />, title: "Calculate total balances", link: "/balances" },
    { icon: <Activity size={18} />, title: "Simplify debts", link: "/settlements" },
    { icon: <RefreshCw size={18} />, title: "Recurring expenses", link: "/activity" },
    { icon: <BarChart2 size={18} />, title: "Spending totals", link: "/analytics" },
    { icon: <CreditCard size={18} />, title: "Payment integrations", link: "/recent" },
    { icon: <Globe size={18} />, title: "100+ currencies", link: "/settings" },
    { icon: <Shield size={18} />, title: "A totally ad-free experience", link: "/profile" },
  ];

  return (
    <div className="h-full overflow-y-auto bg-white custom-scrollbar">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-slate-50 border-b border-slate-200">
        {/* Geometric Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l30 30-30 30L0 30z' fill='%2310b981' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px'
        }}></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center justify-between relative z-10">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-5xl font-extrabold text-slate-800 leading-tight mb-6">
              Less stress when <br/>
              sharing expenses <br/>
              <span className="text-emerald-500">on trips.</span>
            </h1>
            
            <div className="flex gap-4 mb-8 text-emerald-400">
              <Plane size={32} />
              <Home size={32} className="text-purple-400" />
              <Heart size={32} className="text-rose-400" />
            </div>
            
            <p className="text-lg text-slate-600 mb-8 max-w-md">
              Welcome back, <span className="font-bold text-slate-800">{user?.username || 'User'}</span>! 
              Keep track of your shared expenses and balances with housemates, trips, groups, friends, and family.
            </p>
            
            <Link 
              to="/groups" 
              className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
            >
              Go to your Groups
            </Link>
          </div>
          
          <div className="md:w-1/2 flex justify-center">
            {/* Abstract geometric airplane constructed with CSS borders to resemble the screenshot */}
            <div className="relative w-64 h-64 animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500 rotate-45 flex items-center justify-center opacity-80" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-700 rotate-[-45deg] flex items-center justify-center opacity-80 mix-blend-multiply" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-300 rotate-[135deg] flex items-center justify-center opacity-90" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Split Features Section */}
      <div className="flex flex-col md:flex-row min-h-[400px]">
        {/* Dark Track Balances Panel */}
        <div className="md:w-1/2 bg-slate-800 text-white p-12 md:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0Z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>
          
          <h2 className="text-3xl font-bold mb-4 relative z-10">Track balances</h2>
          <p className="text-slate-300 max-w-sm mb-10 relative z-10">
            Keep track of shared expenses, balances, and who owes who.
          </p>
          <Link 
            to="/balances" 
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 rounded-lg font-medium transition-colors relative z-10"
          >
            View Balances
          </Link>
        </div>

        {/* Green Organize Expenses Panel */}
        <div className="md:w-1/2 bg-emerald-500 text-white p-12 md:p-20 flex flex-col justify-center items-center text-center relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0Z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px'
          }}></div>

          <h2 className="text-3xl font-bold mb-4 relative z-10">Organize expenses</h2>
          <p className="text-emerald-50 max-w-sm mb-10 relative z-10">
            Split expenses with any group: trips, housemates, friends, and family.
          </p>
          <Link 
            to="/expenses" 
            className="bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-400/30 px-6 py-2 rounded-lg font-medium transition-colors shadow-sm relative z-10"
          >
            Add an Expense
          </Link>
        </div>
      </div>

      {/* The Whole Nine Yards Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-slate-800 mb-16">The whole nine yards</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
          {features.map((feature, idx) => (
            <Link 
              key={idx} 
              to={feature.link}
              className="flex items-center space-x-4 p-4 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors group cursor-pointer"
            >
              <div className="text-emerald-500 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <span className="text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">
                {feature.title}
              </span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
