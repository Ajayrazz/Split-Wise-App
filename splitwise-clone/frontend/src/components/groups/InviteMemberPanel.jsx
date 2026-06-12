import React, { useState, useEffect, useRef } from 'react';
import { Search, Mail, Loader2, Check } from 'lucide-react';
import client from '../../api/client';
import { useGroupMembers } from '../../hooks/useGroupMembers';
import Toast from '../shared/Toast';
import { useToast } from '../../hooks/useToast';

const InviteMemberPanel = ({ groupId, onMemberAdded }) => {
  const [inputValue, setInputValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isExternal, setIsExternal] = useState(false);
  const [inviteStatus, setInviteStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState(null);

  const { inviteByEmail } = useGroupMembers(groupId);
  const { toast, showToast, hideToast } = useToast();
  useEffect(() => {
    if (inputValue.trim().length === 0) {
      setInviteStatus('idle');
      setIsExternal(false);
      setErrorMessage(null);
    }
  }, [inputValue]);

  const handleAddGroup = async (e) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setInviteStatus('adding');
    setErrorMessage(null);
    setIsExternal(false);
    
    try {
      await client.post(`/groups/${groupId}/members/`, { user: inputValue.trim() });
      showToast(`${inputValue.trim()} added to the group!`, 'success');
      onMemberAdded && onMemberAdded();
      setInputValue('');
      setInviteStatus('idle');
    } catch (err) {
      if (err.response?.status === 404) {
        // User not found in backend - trigger external invite flow!
        const isEmail = inputValue.includes('@') && inputValue.includes('.');
        if (isEmail) {
          setIsExternal(true);
          setInviteStatus('external');
        } else {
          setErrorMessage("No user found with that username. To invite someone new, please enter a valid email address.");
          setInviteStatus('error');
        }
      } else if (err.response?.status === 400) {
        setErrorMessage("This user is already in the group.");
        setInviteStatus('error');
      } else {
        setErrorMessage("Failed to add user. Please try again.");
        setInviteStatus('error');
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddGroup();
    }
  };



  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5 relative">
      <h3 className="text-white font-semibold text-sm mb-3">Add or Invite Members</h3>
      
      <div className="relative">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full bg-slate-900 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {inputValue.length > 0 && !isExternal && (
        <div className="mt-3">
          <button 
            onClick={handleAddGroup}
            disabled={inviteStatus === 'adding'}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
          >
            {inviteStatus === 'adding' ? (
              <><Loader2 className="animate-spin" size={16} /> Adding...</>
            ) : (
              <>Add "{inputValue}" to Group</>
            )}
          </button>
        </div>
      )}

      {inviteStatus === 'external' && isExternal && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3 mt-3 flex items-start gap-3">
          <Mail className="text-amber-400 shrink-0 mt-0.5" size={18} />
          <div className="flex-1">
            <p className="text-slate-300 text-sm mb-3">
              No account found for <span className="font-semibold text-white">{inputValue}</span>. Send them an invitation?
            </p>
            <div className="flex gap-3">
              <button 
                onClick={async () => {
                  setInviteStatus('invite_sent');
                  const subject = encodeURIComponent("You've been invited to Splitwise Clone!");
                  const body = encodeURIComponent(`Hi there,\n\nYou've been invited to join a group on Splitwise Clone to easily split expenses and settle up!\n\nSign up here: ${window.location.origin}/register\n\nCheers,\nSplitwise Clone Team`);
                  window.location.href = `mailto:${inputValue}?subject=${subject}&body=${body}`;
                  await inviteByEmail(inputValue);
                  showToast(`Opening your email client to invite ${inputValue}!`, 'success');
                  setInputValue('');
                  setIsExternal(false);
                  setInviteStatus('idle');
                }}
                disabled={inviteStatus === 'invite_sent'}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-medium text-xs px-3 py-1.5 rounded disabled:opacity-50 transition-colors"
              >
                Send Invite
              </button>
              <button 
                onClick={() => {
                  setInputValue('');
                  setIsExternal(false);
                  setInviteStatus('idle');
                }}
                className="text-slate-400 hover:text-white text-xs px-2 py-1.5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteStatus === 'error' && errorMessage && (
        <div className="mt-2 text-red-400 text-xs px-1">
          {errorMessage}
        </div>
      )}

      <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={hideToast} />
    </div>
  );
};

export default InviteMemberPanel;
