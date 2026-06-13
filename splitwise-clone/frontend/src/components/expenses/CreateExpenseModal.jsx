import React, { useState, useMemo } from 'react';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';
import { useSettings } from '../../hooks/useSettings';

const CreateExpenseModal = ({ groupId, members, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { settings } = useSettings();
  const [step, setStep] = useState(1);
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [paidBy, setPaidBy] = useState(user?.id || '');
  const [splitType, setSplitType] = useState('EQUAL');

  const currencySymbol = currency === 'USD' ? '$' : '₹';

  const [splits, setSplits] = useState({});

  const handleNext = (e) => {
    e.preventDefault();
    if (!description || !totalAmount || isNaN(totalAmount) || Number(totalAmount) <= 0) return;
    
    const initialSplits = {};
    const amt = parseFloat(totalAmount);
    
    if (splitType === 'EQUAL') {
      const base = Math.floor((amt / members.length) * 100) / 100;
      let rem = amt - (base * members.length);
      members.forEach((m, i) => {
        initialSplits[m.user_id] = base + (i === members.length - 1 ? rem : 0);
      });
    } else if (splitType === 'PERCENTAGE') {
      members.forEach(m => initialSplits[m.user_id] = (100 / members.length).toFixed(2));
    } else if (splitType === 'SHARE') {
      members.forEach(m => initialSplits[m.user_id] = 1);
    } else {
      members.forEach(m => initialSplits[m.user_id] = 0);
    }
    setSplits(initialSplits);
    setStep(2);
  };

  const handleSplitChange = (uid, val) => {
    setSplits(prev => ({ ...prev, [uid]: val }));
  };

  const currentSum = useMemo(() => {
    return Object.values(splits).reduce((acc, val) => acc + (parseFloat(val) || 0), 0);
  }, [splits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      description,
      total_amount: totalAmount,
      currency,
      paid_by_id: paidBy,
      split_type: splitType,
    };
    if (splitType !== 'EQUAL') {
      payload.splits = Object.keys(splits).map(uid => {
        let field = 'amount_owed';
        if (splitType === 'PERCENTAGE') field = 'percentage';
        if (splitType === 'SHARE') field = 'shares';
        return { user_id: parseInt(uid), [field]: String(splits[uid]) };
      });
    } else {
      payload.splits = Object.keys(splits).map(uid => ({ user_id: parseInt(uid) }));
    }

    try {
      await client.post(`/groups/${groupId}/expenses/`, payload);
      window.dispatchEvent(new Event('balancesUpdated'));
      onSuccess();
    } catch(err) {
      alert("Error: " + JSON.stringify(err.response?.data || err.message));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Add Expense</h2>
        
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <input type="text" required value={description} onChange={e=>setDescription(e.target.value)} className="mt-1 block w-full rounded border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Total Amount</label>
              <div className="flex gap-2 items-start mt-1">
                <select value={currency} onChange={e=>setCurrency(e.target.value)} className="block rounded border p-2 bg-slate-50">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
                <div className="w-full">
                  <input type="number" step="0.01" required value={totalAmount} onChange={e=>setTotalAmount(e.target.value)} className="block w-full rounded border p-2" />
                  {currency === 'USD' && <div className="text-xs text-slate-500 mt-1">≈ ₹95 per $1</div>}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Paid By</label>
              <select value={paidBy} onChange={e=>setPaidBy(e.target.value)} className="mt-1 block w-full rounded border p-2">
                {members.map(m => <option key={m.user_id} value={m.user_id}>{m.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Split Type</label>
              <div className="flex gap-2 mt-1">
                {['EQUAL', 'UNEQUAL', 'PERCENTAGE', 'SHARE'].map(t => (
                  <label key={t} className="flex items-center text-sm gap-1">
                    <input type="radio" name="split_type" value={t} checked={splitType === t} onChange={e=>setSplitType(e.target.value)} /> {t}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Next</button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-sm text-slate-600 mb-2">
              Splitting {currencySymbol}{totalAmount} as {splitType}
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {members.map(m => (
                <div key={m.user_id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">{m.username}</span>
                  {splitType === 'EQUAL' ? (
                    <span className="text-sm">{currencySymbol}{splits[m.user_id]?.toFixed(2)}</span>
                  ) : (
                    <input 
                      type="number" step="0.01" required
                      value={splits[m.user_id] || ''}
                      onChange={e=>handleSplitChange(m.user_id, e.target.value)}
                      className="w-24 border rounded p-1 text-right"
                    />
                  )}
                </div>
              ))}
            </div>

            {splitType !== 'EQUAL' && (
              <div className={`text-sm font-bold mt-2 ${
                (splitType === 'UNEQUAL' && currentSum !== parseFloat(totalAmount)) || 
                (splitType === 'PERCENTAGE' && currentSum !== 100) 
                ? 'text-rose-600' : 'text-emerald-600'
              }`}>
                Total: {currentSum.toFixed(2)} {splitType === 'PERCENTAGE' ? '%' : (splitType === 'SHARE' ? 'shares' : currencySymbol)}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={()=>setStep(1)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Back</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Create</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateExpenseModal;
