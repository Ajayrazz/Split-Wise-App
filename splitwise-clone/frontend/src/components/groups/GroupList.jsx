import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Calendar, ChevronRight } from 'lucide-react';
import client from '../../api/client';
import CardSkeleton from '../shared/CardSkeleton';
import CreateGroupModal from './CreateGroupModal';

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await client.get('/groups/');
      // Sort groups by latest created
      const sortedGroups = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setGroups(sortedGroups);
    } catch(err) {
      console.error("Failed to fetch groups", err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchGroups(); 
  }, []);

  const handleModalSuccess = () => {
    fetchGroups();
  };

  if (loading) return <div className="p-4 max-w-6xl mx-auto w-full"><CardSkeleton count={3} /></div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Groups</h1>
          <p className="text-slate-500 mt-2">Manage shared expenses with friends and family.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-2 group"
        >
          <Plus size={20} className="group-hover:scale-110 transition-transform" />
          Create New Group
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-emerald-50 text-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Users size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No groups yet</h3>
          <p className="text-slate-500 max-w-md mb-6">
            Create a group to start splitting expenses with your roommates, travel buddies, or partner.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
          >
            + Create your first group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {groups.map(g => {
            const initials = g.name.substring(0, 2).toUpperCase();
            const dateCreated = new Date(g.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            
            return (
              <Link 
                key={g.id} 
                to={`/groups/${g.id}`} 
                className="group block bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Decorative top border */}
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-100 group-hover:bg-emerald-400 transition-colors"></div>
                
                <div className="flex items-start justify-between mb-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 text-emerald-600 border border-slate-100 flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                    {initials}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
                
                <h3 className="font-bold text-lg text-slate-900 mb-3 truncate" title={g.name}>{g.name}</h3>
                
                <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                  <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                    <Users size={14} />
                    <span>{g.members.length} {g.members.length === 1 ? 'member' : 'members'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={12} />
                    <span>{dateCreated}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      <CreateGroupModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
      />
    </div>
  );
};

export default GroupList;
