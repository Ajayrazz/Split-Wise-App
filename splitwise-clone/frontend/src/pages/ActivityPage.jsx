import React from 'react';
import { Bell } from 'lucide-react';
import PlaceholderPage from '../components/shared/PlaceholderPage';

const ActivityPage = () => {
  return (
    <PlaceholderPage 
      icon={Bell}
      title="Activity Feed"
      description="Recent actions across all your groups will appear here."
    />
  );
};

export default ActivityPage;
