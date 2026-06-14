import { useState } from 'react';
import api from '../api/client';

export function useImport() {
  const [stage, setStage] = useState('idle'); // idle, uploading, preview, confirming, done
  const [batch, setBatch] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const uploadCsv = async (file, groupId) => {
    setIsLoading(true);
    setStage('uploading');
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('group_id', groupId);

      const res = await api.post('/importer/upload/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setBatch(res.data.batch_id);
      
      // The backend needs to format rows properly. Let's assume it returns a list of StagedExpense objects.
      // Initially, the backend validator sets status 'pending' for non-rejected rows. Let's map 'pending' to 'awaiting_approval' visually if severity='none', and 'needs_review' if severity='warning'.
      const fetchedRows = (res.data.rows || []).map(r => {
        let frontendStatus = r.status;
        if (r.status === 'pending') {
            if (r.severity === 'warning') frontendStatus = 'needs_review';
            else frontendStatus = 'awaiting_approval';
        }
        return { ...r, frontendStatus };
      });
      
      setRows(fetchedRows);
      setStage('preview');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
      setStage('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const approveRow = async (rowId) => {
    try {
      await api.patch(`/importer/rows/${rowId}/`, { action: 'approve' });
      setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: 'approved', frontendStatus: 'approved' } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const excludeRow = async (rowId) => {
    try {
      await api.patch(`/importer/rows/${rowId}/`, { action: 'exclude' });
      setRows(prev => prev.map(r => r.id === rowId ? { ...r, status: 'excluded', frontendStatus: 'excluded' } : r));
    } catch (err) {
      console.error(err);
    }
  };

  const approveAllValid = async () => {
    const toApprove = rows.filter(r => r.frontendStatus === 'awaiting_approval');
    // For simplicity, we just Promise.all them
    setIsLoading(true);
    try {
      await Promise.all(toApprove.map(r => api.patch(`/importer/rows/${r.id}/`, { action: 'approve' })));
      setRows(prev => prev.map(r => r.frontendStatus === 'awaiting_approval' ? { ...r, status: 'approved', frontendStatus: 'approved' } : r));
    } catch (err) {
      console.error(err);
      setError("Failed to bulk approve");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmIngestion = async () => {
    if (!batch) return;
    setIsLoading(true);
    setStage('confirming');
    setError(null);
    try {
      await api.post(`/importer/${batch}/confirm/`);
      setStage('done');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
      setStage('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStage('idle');
    setBatch(null);
    setRows([]);
    setError(null);
  };

  return {
    stage,
    batch,
    rows,
    isLoading,
    error,
    uploadCsv,
    approveRow,
    excludeRow,
    approveAllValid,
    confirmIngestion,
    reset
  };
}
