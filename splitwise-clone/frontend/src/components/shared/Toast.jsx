import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', visible, onClose }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, 4000);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  if (!visible || !message) return null;

  const bgColors = {
    success: 'bg-emerald-600',
    error: 'bg-red-600',
    warning: 'bg-amber-500 text-slate-900',
  };

  const bgColor = bgColors[type] || bgColors.success;

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${bgColor} px-4 py-3 rounded-lg shadow-lg font-medium text-sm animate-in fade-in slide-in-from-bottom-4 duration-300 ${type === 'warning' ? 'text-slate-900' : 'text-white'}`}>
      {message}
    </div>
  );
};

export default Toast;
