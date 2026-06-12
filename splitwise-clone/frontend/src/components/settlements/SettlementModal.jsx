import React, { useState } from 'react';
import client from '../../api/client';
import { useGlobalBalance } from '../../context/GlobalBalanceContext';
import { useSettings } from '../../hooks/useSettings';

const SettlementModal = ({ isOpen, onClose, groupId, payerId, payeeId, payerName, payeeName, maxAmount, onSettled }) => {
  const [amount, setAmount] = useState(maxAmount || '');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { triggerRefresh } = useGlobalBalance();
  const { settings } = useSettings();

  // Update amount when modal opens with new maxAmount
  React.useEffect(() => {
    if (isOpen) setAmount(maxAmount);
  }, [isOpen, maxAmount]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const parsedAmount = parseFloat(amount);
    
    if (parsedAmount > parseFloat(maxAmount)) {
      setError("Cannot settle more than outstanding balance");
      return;
    }
    
    if (parsedAmount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setIsSubmitting(true);
    try {
      await client.post(`/groups/${groupId}/settlements/`, {
        payer_id: payerId,
        payee_id: payeeId,
        amount: parsedAmount
      });
      triggerRefresh();
      onSettled();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record settlement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-900/50">
          <h2 className="text-xl font-bold text-white">Record Settlement</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="bg-slate-700/30 rounded-lg p-4 space-y-3 border border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Payer</span>
              <span className="font-semibold text-white">{payerName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">Payee</span>
              <span className="font-semibold text-white">{payeeName}</span>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-slate-700">
              <span className="text-slate-400 text-sm">Max Balance</span>
              <span className="font-mono text-emerald-400">{settings.currencySymbol}{parseFloat(maxAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Amount to Settle</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-slate-400">{settings.currencySymbol}</span>
              <input 
                type="number"
                step="0.01"
                min="0.01"
                max={maxAmount}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500 font-mono text-lg"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-700">
            <button 
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting || !amount}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? 'Recording...' : 'Record Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettlementModal;
