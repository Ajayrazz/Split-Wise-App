import React, { useState } from 'react';
import Step1_BasicInfo from './steps/Step1_BasicInfo';
import Step2_SplitAllocation from './steps/Step2_SplitAllocation';
import { useExpenses } from '../../hooks/useExpenses';

const AddExpenseModal = ({ onClose, onExpenseCreated }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  
  const { createExpense } = useExpenses();

  const [formData, setFormData] = useState({
    groupId: '',
    description: '',
    totalAmount: '',
    paidById: '',
    splitType: 'EQUAL',
    groupMembers: [],
    splits: []
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setApiError(null);

    let formattedSplits = [];
    if (formData.splitType !== 'EQUAL') {
      formattedSplits = formData.splits.map(s => {
        const out = { user_id: s.user_id };
        if (formData.splitType === 'UNEQUAL') out.amount_owed = s.amount_owed;
        if (formData.splitType === 'PERCENTAGE') out.percentage = s.percentage;
        if (formData.splitType === 'SHARE') out.shares = s.shares;
        return out;
      });
    } else {
      formattedSplits = formData.groupMembers.map(m => ({ user_id: m.user_id }));
    }

    const payload = {
      groupId: formData.groupId,
      description: formData.description,
      total_amount: formData.totalAmount,
      paid_by_id: formData.paidById,
      split_type: formData.splitType,
      splits: formattedSplits
    };

    const res = await createExpense(payload);
    if (res.error) {
      setApiError(JSON.stringify(res.error.fields || "An error occurred"));
      setIsSubmitting(false);
    } else {
      if (onExpenseCreated) onExpenseCreated();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm pt-20">
      <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-900/50">
          <div>
            <h2 className="text-xl font-bold text-white">Add New Expense</h2>
            <p className="text-slate-400 text-sm mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-full">
            ✕
          </button>
        </div>
        
        <div className="h-1 w-full bg-slate-700">
          <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: step === 1 ? '50%' : '100%' }}></div>
        </div>

        <div className="p-6">
          {apiError && (
            <div className="mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-lg text-sm">
              {apiError}
            </div>
          )}

          {step === 1 ? (
            <Step1_BasicInfo 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(2)} 
            />
          ) : (
            <Step2_SplitAllocation 
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              onBack={() => setStep(1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
