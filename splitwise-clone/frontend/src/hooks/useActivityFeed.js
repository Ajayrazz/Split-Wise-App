import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import useAuth from './useAuth';
import { useGlobalBalance } from '../context/GlobalBalanceContext';
import { useSettings } from './useSettings';

export function useActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { metrics } = useGlobalBalance();
  const { settings } = useSettings();

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const groupsRes = await client.get('/groups/');
      const groups = groupsRes.data;

      let allActivity = [];

      await Promise.all(groups.map(async (group) => {
        try {
          allActivity.push({
            id: `group_join-${group.id}`,
            type: 'group_join',
            timestamp: group.created_at,
            groupId: group.id,
            groupName: group.name,
            actor: group.created_by === user.id ? 'You' : (group.members?.find(m => m.user_id === group.created_by)?.username || 'Someone'),
            description: 'created the group',
            amount: null,
            meta: group
          });

          const expRes = await client.get(`/groups/${group.id}/expenses/`);
          const expenses = expRes.data.map(exp => {
            const actor = exp.paid_by === user.id ? 'You' : (group.members?.find(m => m.user_id === exp.paid_by)?.username || 'Someone');
            return {
              id: `expense-${exp.id}`,
              type: 'expense',
              timestamp: exp.created_at,
              groupId: group.id,
              groupName: group.name,
              actor: actor,
              description: `${actor} paid ${settings.currencySymbol}${parseFloat(exp.total_amount).toFixed(2)} for ${exp.description} in ${group.name}`,
              amount: parseFloat(exp.total_amount),
              meta: exp
            };
          });

          const setRes = await client.get(`/groups/${group.id}/settlements/`);
          const settlements = setRes.data.map(settle => {
            const payer = settle.payer_id === user.id ? 'You' : (group.members?.find(m => m.user_id === settle.payer_id)?.username || 'Someone');
            const payee = settle.payee_id === user.id ? 'You' : (group.members?.find(m => m.user_id === settle.payee_id)?.username || 'Someone');
            return {
              id: `settlement-${settle.id}`,
              type: 'settlement',
              timestamp: settle.created_at,
              groupId: group.id,
              groupName: group.name,
              actor: payer,
              description: `${payer} settled ${settings.currencySymbol}${parseFloat(settle.amount).toFixed(2)} with ${payee} in ${group.name}`,
              amount: parseFloat(settle.amount),
              meta: settle
            };
          });

          allActivity = [...allActivity, ...expenses, ...settlements];
        } catch (e) {
          console.error(`Failed to fetch for group ${group.id}`, e);
        }
      }));

      allActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivities(allActivity);
    } catch (err) {
      setError('Failed to fetch activity feed.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity, metrics.lastRefreshed]);

  return { activities, isLoading, error, refetch: fetchActivity };
}
