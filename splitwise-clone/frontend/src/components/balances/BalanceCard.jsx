import React from 'react';
import { useSettings } from '../../hooks/useSettings';

const BalanceCard = ({ balance, currentUserId, onSettle }) => {
  const { settings } = useSettings();
  const amt = parseFloat(balance.amount);
  
  const payerId = balance.from_user_id;
  const payeeId = balance.to_user_id;
  const payerName = balance.from_username;
  const payeeName = balance.to_username;

  const isPayer = currentUserId === payerId;
  const isPayee = currentUserId === payeeId;

  let borderColor = "border-slate-600";
  let bgColor = "bg-slate-800/50";
  let text = "";
  let iconColor = "text-slate-400";
  let Icon = () => <span className="text-xl">↔</span>;

  if (isPayer) {
    borderColor = "border-rose-500";
    bgColor = "bg-rose-500/10";
    text = `You owe ${payeeName}`;
    iconColor = "text-rose-500";
    Icon = () => <span className="text-xl">→</span>;
  } else if (isPayee) {
    borderColor = "border-emerald-500";
    bgColor = "bg-emerald-500/10";
    text = `${payerName} owes you`;
    iconColor = "text-emerald-500";
    Icon = () => <span className="text-xl">←</span>;
  } else {
    text = `${payerName} owes ${payeeName}`;
  }

  return (
    <div className={`p-4 rounded-lg border-l-4 ${borderColor} ${bgColor} border-y border-r border-slate-700 flex justify-between items-center transition-colors hover:bg-slate-800`}>
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center ${iconColor}`}>
          <Icon />
        </div>
        <div>
          <p className="text-white font-medium">{text}</p>
          <p className="text-sm text-slate-400 font-mono mt-0.5">{settings.currencySymbol}{amt.toFixed(2)}</p>
        </div>
      </div>
      
      {(isPayer || isPayee) && (
        <button 
          onClick={() => onSettle({ payerId, payeeId, payerName, payeeName, maxAmount: amt })}
          className="text-emerald-400 hover:text-emerald-300 hover:underline text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-400/10 transition-colors"
        >
          Settle
        </button>
      )}
    </div>
  );
};

export default BalanceCard;
