import React from 'react';
import { UserMinus, Lock, AlertTriangle, Loader2 } from 'lucide-react';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../hooks/useSettings';

const MemberRoster = ({ groupId, currentUserId }) => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const {
    members,
    isLoading,
    error,
    blockedUserId,
    confirmUserId,
    isRemoving,
    removeMember,
    executeRemoval,
    clearBlockedUser,
    clearConfirmUser
  } = useGroupMembers(groupId);

  if (isLoading) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 flex justify-center">
        <Loader2 className="animate-spin text-slate-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 text-red-400 text-sm">
        {error}
      </div>
    );
  }

  const formatMoney = (amount) => {
    return Math.abs(amount).toFixed(2);
  };

  const renderBalanceBadge = (balance) => {
    if (!balance || balance.amount === 0 || Math.abs(balance.amount) <= 0.001) return null;

    if (balance.direction === 'owes') {
      return (
        <span className="bg-red-500/15 text-red-400 border border-red-500/30 rounded-full px-3 py-1 text-xs font-mono font-medium">
          Owes {settings.currencySymbol}{formatMoney(balance.amount)}
        </span>
      );
    }
    
    if (balance.direction === 'owed') {
      return (
        <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 text-xs font-mono font-medium">
          Owed {settings.currencySymbol}{formatMoney(balance.amount)}
        </span>
      );
    }

    return null;
  };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-900 px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-semibold">Members</h3>
          <span className="bg-slate-700 text-slate-300 text-xs px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-700/50">
        {members.map(member => (
          <React.Fragment key={member.id}>
            <div className="px-5 py-4 flex items-center gap-4 hover:bg-slate-700/20 transition-colors">
              {/* Left: Avatar */}
              <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold">
                {member.username.charAt(0).toUpperCase()}
              </div>

              {/* Middle: Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="text-white text-sm font-medium truncate">
                    {member.username} {member.id === currentUserId && "(you)"}
                  </div>
                  {renderBalanceBadge(member.balance)}
                </div>
                <div className="flex items-center gap-2 text-xs mt-0.5">
                  <span className="text-slate-400 truncate">{member.email}</span>
                  {member.joinedAt && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right: Actions */}
              {member.id !== currentUserId && (
                <div className="shrink-0 ml-2">
                  {confirmUserId === member.id ? (
                    // STATE C: Pending confirmation
                    <div className="bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-slate-300 text-xs font-medium">Remove {member.username}?</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => executeRemoval(member.id)}
                          className="bg-red-500 hover:bg-red-400 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => clearConfirmUser()}
                          className="text-slate-400 hover:text-white text-xs px-2 py-1 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : isRemoving[member.id] ? (
                    // STATE: Removing in progress
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400">
                      <Loader2 className="animate-spin" size={14} />
                      Removing...
                    </div>
                  ) : member.isBalanceLocked ? (
                    // STATE A: Locked
                    <button 
                      onClick={() => removeMember(member.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-500 cursor-not-allowed select-none"
                    >
                      <Lock size={12} />
                      Locked
                    </button>
                  ) : (
                    // STATE B: Safe to remove
                    <button
                      onClick={() => removeMember(member.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-white hover:bg-red-500/20 border border-transparent hover:border-red-500/30 transition-all duration-150 cursor-pointer"
                    >
                      <UserMinus size={12} />
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Block Warning Card below row */}
            {blockedUserId === member.id && (
              <div className="mx-5 mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/40 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="text-red-400 font-semibold text-sm">Action Blocked</h4>
                  <p className="text-red-300/80 text-xs mt-1 leading-relaxed">
                    This user has outstanding debts or credits that must be settled to {settings.currencySymbol}0.00 before they can leave the group.
                  </p>
                  <div className="text-red-400 text-xs font-mono mt-2 bg-red-500/10 px-2 py-1 rounded inline-block">
                    Current balance: {member.balance.direction === 'owes' ? 'owes' : 'is owed'} {settings.currencySymbol}{formatMoney(member.balance.amount)} — must be settled first.
                  </div>
                  <div className="mt-3 flex items-center">
                    <button
                      onClick={() => navigate(`/groups/${groupId}`)} // Usually /balances or scroll, but just route to same page to let them find settlement
                      className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                    >
                      Settle This Debt
                    </button>
                    <button
                      onClick={() => clearBlockedUser()}
                      className="text-xs text-slate-500 hover:text-slate-400 ml-4 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MemberRoster;
