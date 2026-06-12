import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import client from '../../api/client';
import CardSkeleton from '../shared/CardSkeleton';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      const res = await client.get('/groups/');
      setGroups(res.data);
    } catch(err) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    try {
      await client.post('/groups/', { name: newGroupName });
      setNewGroupName('');
      fetchGroups();
    } catch(err) { alert('Failed to create group'); }
  };

  if (loading) return <div className="p-4 max-w-5xl mx-auto w-full"><CardSkeleton count={3} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-slate-800">Your Groups</h2>
      </div>

      <form onSubmit={handleCreate} className="flex gap-2 mb-4">
        <input 
          type="text" 
          placeholder="New Group Name" 
          value={newGroupName} 
          onChange={e=>setNewGroupName(e.target.value)} 
          className="flex-1 max-w-sm rounded border border-slate-300 p-2"
        />
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">Create</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {groups.map(g => (
          <Link key={g.id} to={`/groups/${g.id}`} className="block bg-white border border-slate-200 rounded p-4 hover:shadow-md transition-shadow">
            <h3 className="font-bold text-lg text-slate-800">{g.name}</h3>
            <p className="text-sm text-slate-500 mt-1">{g.members.length} member(s)</p>
          </Link>
        ))}
        {groups.length === 0 && <p className="text-slate-500 col-span-full">No groups yet. Create one above!</p>}
      </div>
    </div>
  );
};

export default GroupList;
