import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import apiClient from '../api/client';

const GlobalBalanceContext = createContext(null);

export function GlobalBalanceProvider({ children }) {
  const { user, accessToken } = useAuth();

  const [metrics, setMetrics] = useState({
    totalOwedToMe: 0,      // sum where others owe currentUser
    totalIOwe: 0,          // sum where currentUser owes others
    net: 0,                // totalOwedToMe - totalIOwe
    isLoading: true,
    error: null,
    lastRefreshed: null,
  });

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Call this from any component after expense creation or settlement
  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    if (!user || !accessToken) return;

    async function fetchGlobalMetrics() {
      setMetrics(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Step 1: Fetch all groups for the current user
        const groupsRes = await apiClient.get('/groups/');
        const groups = groupsRes.data;

        if (groups.length === 0) {
          setMetrics({
            totalOwedToMe: 0, totalIOwe: 0, net: 0,
            isLoading: false, error: null, lastRefreshed: new Date()
          });
          return;
        }

        // Step 2: Fetch balances for ALL groups in parallel
        const balanceRequests = groups.map(group =>
          apiClient.get(`/groups/${group.id}/balances/`)
            .then(res => res.data)
            .catch(() => []) // silently ignore failed groups
        );
        const allBalanceArrays = await Promise.all(balanceRequests);
        const allBalances = allBalanceArrays.flat();

        // Step 3: Aggregate using currentUser.id
        // Balance entry shape: { from_user_id, to_user_id, amount }
        // from_user_id OWES to_user_id the amount

        let totalOwedToMe = 0;
        let totalIOwe = 0;

        allBalances.forEach(balance => {
          const amount = parseFloat(balance.amount) || 0;
          if (amount <= 0.001) return; // skip zero/epsilon balances

          if (balance.to_user_id === user.id) {
            // Someone owes ME
            totalOwedToMe += amount;
          } else if (balance.from_user_id === user.id) {
            // I owe someone
            totalIOwe += amount;
          }
          // Balances between other users: ignored in global metrics
        });

        setMetrics({
          totalOwedToMe: parseFloat(totalOwedToMe.toFixed(2)),
          totalIOwe: parseFloat(totalIOwe.toFixed(2)),
          net: parseFloat((totalOwedToMe - totalIOwe).toFixed(2)),
          isLoading: false,
          error: null,
          lastRefreshed: new Date(),
        });

      } catch (err) {
        setMetrics(prev => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load financial summary.',
        }));
      }
    }

    fetchGlobalMetrics();
  }, [user, accessToken, refreshTrigger]);

  return (
    <GlobalBalanceContext.Provider value={{ metrics, triggerRefresh }}>
      {children}
    </GlobalBalanceContext.Provider>
  );
}

export function useGlobalBalance() {
  const ctx = useContext(GlobalBalanceContext);
  if (!ctx) throw new Error('useGlobalBalance must be used within GlobalBalanceProvider');
  return ctx;
}
