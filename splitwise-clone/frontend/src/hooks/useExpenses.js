import { useState, useCallback } from 'react';
import client from '../api/client';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const groupsRes = await client.get('/groups/');
      const groups = groupsRes.data;
      
      const expensePromises = groups.map(g => client.get(`/groups/${g.id}/expenses/`));
      const results = await Promise.all(expensePromises);
      
      let allExpenses = [];
      results.forEach((res, index) => {
        const group = groups[index];
        const groupExpenses = res.data.map(exp => ({ ...exp, group_name: group.name }));
        allExpenses = [...allExpenses, ...groupExpenses];
      });
      
      allExpenses.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setExpenses(allExpenses);
    } catch (err) {
      setError(err.response?.data || { message: "Failed to fetch expenses" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createExpense = async (payload) => {
    try {
      const { groupId, ...data } = payload;
      await client.post(`/groups/${groupId}/expenses/`, data);
      await refetch();
      return { error: null };
    } catch (err) {
      return { error: { code: err.response?.status, fields: err.response?.data } };
    }
  };

  const deleteExpense = async (expenseId) => {
    // Optional / mock for now
  };

  return { expenses, isLoading, error, createExpense, deleteExpense, refetch };
}
