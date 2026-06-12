import React from 'react';
import Sidebar from './Sidebar';
import TopBanner from './TopBanner';
import { Outlet } from 'react-router-dom';

const AppLayout = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <TopBanner />
        <main className="flex-1 overflow-y-auto p-6 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
