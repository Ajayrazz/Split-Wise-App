import React, { useState } from 'react';
import { X, Plus, Search } from 'lucide-react';
import client from '../../api/client';
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const CreateGroupModal = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [memberInput, setMemberInput] = useState('');
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!memberInput.trim()) return;
    
    if (memberInput.trim().toLowerCase() === user.email.toLowerCase() || memberInput.trim().toLowerCase() === user.username.toLowerCase()) {
      setMemberInput('');
      return; 
    }

    if (!members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
    }
    setMemberInput('');
  };

  const removeMember = (m) => {
    setMembers(members.filter((mem) => mem !== m));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (name.trim().length < 3) {
      setError('Group name must be at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await client.post('/groups/', { name: name.trim() });
      const newGroupId = res.data.id;

      for (const m of members) {
        try {
          await client.post(`/groups/${newGroupId}/members/`, { user: m });
        } catch (memberErr) {
          console.error(`Failed to add member ${m}`, memberErr);
        }
      }

      onSuccess && onSuccess(newGroupId);
      navigate(`/groups/${newGroupId}`);
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Plus className="mr-2 text-emerald-500" size={24} /> Create New Group
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Group Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Goa Trip, Apartment 4B"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors placeholder:text-slate-600"
              required
              minLength={3}
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Add Members (Email or Username)</label>
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddMember(e);
                    }
                  }}
                  placeholder="Type exactly and press Enter or Add"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-600"
                />
              </div>
              <button 
                type="button" 
                onClick={handleAddMember}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 rounded-lg font-medium transition-colors"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                {user?.username} (you)
              </div>
              {members.map(m => (
                <div key={m} className="bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 group">
                  {m}
                  <button 
                    type="button" 
                    onClick={() => removeMember(m)}
                    className="text-slate-400 group-hover:text-rose-400 transition-colors focus:outline-none"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || name.trim().length < 3}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors shadow-lg shadow-emerald-500/20 flex items-center"
            >
              {isSubmitting ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
