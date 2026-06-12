import React, { useState, useEffect } from 'react';
import client from '../../../api/client';

const Step1_BasicInfo = ({ formData, setFormData, onNext }) => {
  const [groups, setGroups] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);

  useEffect(() => {
    client.get('/groups/').then(res => setGroups(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (formData.groupId) {
      client.get(`/groups/${formData.groupId}/`).then(res => {
        setGroupMembers(res.data.members || []);
        setFormData(prev => ({ ...prev, groupMembers: res.data.members || [] }));
      });
    } else {
      setGroupMembers([]);
    }
  }, [formData.groupId, setFormData]);

  const isValid = formData.groupId && formData.description && formData.totalAmount && formData.paidById;

  const splitTypes = ['EQUAL', 'UNEQUAL', 'PERCENTAGE', 'SHARE'];

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Group</label>
        <select 
          value={formData.groupId} 
          onChange={e => setFormData({ ...formData, groupId: e.target.value })}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">Select a group...</option>
          {groups.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
        <input 
          type="text" 
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g. Hotel booking"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Total Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-2.5 text-slate-400">₹</span>
          <input 
            type="number" 
            step="0.01" 
            min="0.01"
            value={formData.totalAmount}
            onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
            className="w-full bg-slate-700 border border-slate-600 rounded-lg pl-8 pr-4 py-2 text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">Paid By</label>
        <select 
          value={formData.paidById} 
          onChange={e => setFormData({ ...formData, paidById: e.target.value })}
          disabled={!formData.groupId}
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
        >
          <option value="">Select who paid...</option>
          {groupMembers.map(m => (
            <option key={m.user_id} value={m.user_id}>{m.username}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-400 mb-2">Split Type</label>
        <div className="grid grid-cols-4 gap-2">
          {splitTypes.map(type => (
            <button
              key={type}
              onClick={() => setFormData({ ...formData, splitType: type })}
              className={`py-2 px-1 text-sm font-medium rounded-lg transition-colors ${
                formData.splitType === type 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button 
          onClick={onNext}
          disabled={!isValid}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:text-slate-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Step1_BasicInfo;
