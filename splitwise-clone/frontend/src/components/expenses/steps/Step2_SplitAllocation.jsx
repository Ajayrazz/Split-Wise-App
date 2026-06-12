import React, { useEffect } from 'react';
import EqualSplitView from '../split-inputs/EqualSplitView';
import UnequalSplitInput from '../split-inputs/UnequalSplitInput';
import PercentageSplitInput from '../split-inputs/PercentageSplitInput';
import ShareSplitInput from '../split-inputs/ShareSplitInput';
import { useSplitValidator } from '../../../hooks/useSplitValidator';
import { useSettings } from '../../../hooks/useSettings';

const Step2_SplitAllocation = ({ formData, setFormData, onSubmit, isSubmitting, onBack }) => {
  const { settings } = useSettings();
  const { groupMembers, splitType, totalAmount, splits } = formData;

  useEffect(() => {
    if (splits.length === 0 && groupMembers.length > 0) {
      const initialSplits = groupMembers.map(m => ({
        user_id: m.user_id,
        amount_owed: '',
        percentage: '',
        shares: 1
      }));
      setFormData(prev => ({ ...prev, splits: initialSplits }));
    }
  }, [groupMembers, splits.length, setFormData]);

  const { isValid, remainder, errorMessage } = useSplitValidator(splitType, totalAmount, splits);

  const handleSplitsChange = (newSplits) => {
    setFormData(prev => ({ ...prev, splits: newSplits }));
  };

  const renderSplitComponent = () => {
    switch (splitType) {
      case 'EQUAL':
        return <EqualSplitView groupMembers={groupMembers} totalAmount={totalAmount} />;
      case 'UNEQUAL':
        return <UnequalSplitInput groupMembers={groupMembers} splits={splits} onSplitsChange={handleSplitsChange} />;
      case 'PERCENTAGE':
        return <PercentageSplitInput groupMembers={groupMembers} splits={splits} onSplitsChange={handleSplitsChange} />;
      case 'SHARE':
        return <ShareSplitInput groupMembers={groupMembers} splits={splits} onSplitsChange={handleSplitsChange} totalAmount={totalAmount} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-slate-700/30 p-4 rounded-lg flex justify-between items-center border border-slate-700/50">
        <div>
          <p className="text-sm text-slate-400">Total Amount</p>
          <p className="text-xl font-bold text-emerald-400 font-mono">{settings.currencySymbol}{parseFloat(totalAmount || 0).toFixed(2)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Split By</p>
          <p className="text-sm font-semibold text-white bg-slate-600 px-2 py-0.5 rounded">{splitType}</p>
        </div>
      </div>

      <div>
        {renderSplitComponent()}
      </div>

      {splitType !== 'EQUAL' && splitType !== 'SHARE' && (
        <div className={`mt-4 p-3 rounded-lg border flex items-center justify-between ${isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
          <span className="font-medium text-sm">
            {isValid ? 'Ready to split' : errorMessage}
          </span>
          {isValid && <span className="text-xl">✓</span>}
        </div>
      )}
      
      {splitType === 'SHARE' && (
        <div className={`mt-4 p-3 rounded-lg border flex items-center justify-between ${isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
           <span className="font-medium text-sm">
            {isValid ? 'Ready to split' : errorMessage}
          </span>
          {isValid && <span className="text-xl">✓</span>}
        </div>
      )}

      <div className="pt-4 flex justify-between border-t border-slate-700">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white transition-colors px-4 py-2"
        >
          ← Back
        </button>
        <button 
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
        >
          {isSubmitting ? 'Saving...' : 'Create Expense'}
        </button>
      </div>
    </div>
  );
};

export default Step2_SplitAllocation;
