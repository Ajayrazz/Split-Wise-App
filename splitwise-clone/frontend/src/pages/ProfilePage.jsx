import React, { useEffect, useState } from 'react';
import { User } from 'lucide-react';
import client from '../api/client';
import PlaceholderPage from '../components/shared/PlaceholderPage';

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
      <PlaceholderPage 
        icon={User}
        title="Your Profile"
        description="Loading profile details..."
      />
    );
  }

  const dateJoined = profile.date_joined ? new Date(profile.date_joined).toLocaleDateString() : 'Unknown';

  return (
    <PlaceholderPage 
      icon={User}
      title="Your Profile"
      description={`Username: ${profile.username} | Email: ${profile.email} | Member since: ${dateJoined}`}
    />
  );
};

export default ProfilePage;
