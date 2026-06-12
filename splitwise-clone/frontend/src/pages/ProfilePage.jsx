import React, { useEffect, useState } from 'react';
import { User, Mail, Calendar, Edit3, Shield, Key } from 'lucide-react';
import client from '../api/client';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await client.get('/auth/me/');
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      }
    };
    fetchMe();
  }, []);

  if (!profile) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full">
        <div className="w-24 h-24 rounded-full bg-slate-200 animate-pulse mb-4"></div>
        <div className="h-6 w-48 bg-slate-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const dateJoined = profile.date_joined 
    ? new Date(profile.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) 
    : 'Unknown';
    
  const initial = profile.username ? profile.username.charAt(0).toUpperCase() : '?';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header Banner */}
        <div className="h-32 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
        
        {/* Profile Info */}
        <div className="px-8 pb-8 relative">
          <div className="flex justify-between items-end -mt-12 mb-6">
            <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md">
              <div className="w-full h-full rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-4xl font-bold">
                {initial}
              </div>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <Edit3 size={16} /> Edit Profile
            </button>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{profile.first_name} {profile.last_name || profile.username}</h1>
          <p className="text-slate-500 mb-8 flex items-center gap-2">
            @{profile.username}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-1 text-slate-500">
                <Mail size={18} />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <p className="text-slate-900 font-medium ml-7">{profile.email}</p>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
              <div className="flex items-center gap-3 mb-1 text-slate-500">
                <Calendar size={18} />
                <span className="text-sm font-medium">Member Since</span>
              </div>
              <p className="text-slate-900 font-medium ml-7">{dateJoined}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl group-hover:bg-emerald-100 transition-colors">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Privacy & Security</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Manage your privacy settings and secure your account with two-factor authentication.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-start gap-4 hover:border-emerald-200 transition-colors cursor-pointer group">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl group-hover:bg-teal-100 transition-colors">
            <Key size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 mb-1">Change Password</h3>
            <p className="text-sm text-slate-500 leading-relaxed">Update your password regularly to keep your SplitwiseClone account fully secure.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
