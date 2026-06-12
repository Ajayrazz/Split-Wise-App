import React from 'react';

const PlaceholderPage = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-full max-w-lg mx-auto">
      <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700/50">
        <Icon size={48} className="text-slate-600" />
      </div>
      <h1 className="text-2xl font-bold text-slate-300 mb-2">{title}</h1>
      <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default PlaceholderPage;
