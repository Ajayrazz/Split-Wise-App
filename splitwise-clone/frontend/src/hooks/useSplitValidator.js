export function useSplitValidator(splitType, totalAmount, splits) {
  const total = parseFloat(totalAmount) || 0;

  if (splitType === 'EQUAL') {
    return { isValid: true, remainder: 0, errorMessage: null };
  }

  if (splitType === 'UNEQUAL') {
    const sum = splits.reduce((acc, s) => acc + parseFloat(s.amount_owed || 0), 0);
    const remainder = Math.round((total - sum) * 100) / 100;
    const isValid = remainder === 0;
    let errorMessage = null;
    if (remainder !== 0) {
      errorMessage = `₹${Math.abs(remainder).toFixed(2)} ${remainder > 0 ? 'still unallocated' : 'over-allocated'}`;
    }
    return { isValid, remainder, errorMessage };
  }

  if (splitType === 'PERCENTAGE') {
    const pctSum = splits.reduce((acc, s) => acc + parseFloat(s.percentage || 0), 0);
    const remainder = Math.round((100 - pctSum) * 100) / 100;
    const isValid = Math.abs(remainder) < 0.01;
    let errorMessage = null;
    if (remainder !== 0) {
      errorMessage = `${remainder > 0 ? '+' : ''}${remainder.toFixed(2)}% ${remainder > 0 ? 'remaining' : 'over 100%'}`;
    }
    return { isValid, remainder, errorMessage };
  }

  if (splitType === 'SHARE') {
    const isValid = splits.every(s => parseFloat(s.shares) > 0);
    const errorMessage = !isValid ? 'All members must have at least 1 share' : null;
    return { isValid, remainder: 0, errorMessage };
  }

  return { isValid: false, remainder: 0, errorMessage: 'Unknown split type' };
}
