import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import useAuth from './useAuth';
import { useGlobalBalance } from '../context/GlobalBalanceContext';

export function useGroupMembers(groupId) {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isRemoving, setIsRemoving] = useState({});
  const [blockedUserId, setBlockedUserId] = useState(null);
  const [confirmUserId, setConfirmUserId] = useState(null);
  const { triggerRefresh } = useGlobalBalance();

  const fetchMembersAndBalances = useCallback(async () => {
    if (!groupId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [groupRes, balancesRes] = await Promise.all([
        client.get(`/groups/${groupId}/`),
        client.get(`/groups/${groupId}/balances/`)
      ]);
      
      const groupData = groupRes.data;
      const balancesData = balancesRes.data;
      
      const decorated = decorateMembers(groupData.members || [], balancesData || [], currentUser?.id);
      setMembers(decorated);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [groupId, currentUser?.id]);

  useEffect(() => {
    fetchMembersAndBalances();
  }, [fetchMembersAndBalances]);

  function decorateMembers(membersList, balancesList, currentUserId) {
    return membersList.map(member => {
      const userId = member.user_id;

      const relevantBalance = balancesList.find(b =>
        b.from_user_id === userId || 
        b.to_user_id === userId
      );

      let balanceAmount = 0;
      let balanceDirection = 'settled';

      if (relevantBalance) {
        balanceAmount = parseFloat(relevantBalance.amount);
        if (relevantBalance.from_user_id === userId) {
          balanceDirection = 'owes';
        } else {
          balanceDirection = 'owed';
        }
      }

      // CRITICAL: use epsilon comparison, never === 0 on floats
      const isBalanceLocked = Math.abs(balanceAmount) > 0.001;

      return {
        id: userId,
        username: member.username,
        email: member.email,
        joinedAt: member.joined_at, // might be undefined depending on backend, but ok
        balance: { amount: balanceAmount, direction: balanceDirection },
        isBalanceLocked,
        isRemovePending: false,
      };
    });
  }

  const removeMember = async (userId) => {
    const member = members.find(m => m.id === userId);
    if (!member) return;

    if (member.isBalanceLocked) {
      setBlockedUserId(userId);
      return;
    }
    
    setConfirmUserId(userId);
  };

  const executeRemoval = async (userId) => {
    setIsRemoving(prev => ({ ...prev, [userId]: true }));
    try {
      await client.delete(`/groups/${groupId}/members/${userId}/`);
      setMembers(prev => prev.filter(m => m.id !== userId));
      setConfirmUserId(null);
      triggerRefresh();
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.error?.code === 'BALANCE_OUTSTANDING') {
        setBlockedUserId(userId);
      } else {
        setError(err.response?.data?.detail || 'Failed to remove member');
      }
    } finally {
      setIsRemoving(prev => ({ ...prev, [userId]: false }));
    }
  };

  const inviteByEmail = async (email) => {
    // NOTE: External invite is client-side only. No backend 
    // pending_invite table exists. This UI provides graceful UX 
    // for the invitation flow. A real implementation would call 
    // POST /api/v1/invites/ and send an email via backend.
    await new Promise(resolve => setTimeout(resolve, 800));
  };

  const clearBlockedUser = () => setBlockedUserId(null);
  const clearConfirmUser = () => setConfirmUserId(null);

  return {
    members,
    isLoading,
    error,
    blockedUserId,
    confirmUserId,
    isRemoving,
    removeMember,
    executeRemoval,
    clearBlockedUser,
    clearConfirmUser,
    inviteByEmail,
    refetch: fetchMembersAndBalances
  };
}
