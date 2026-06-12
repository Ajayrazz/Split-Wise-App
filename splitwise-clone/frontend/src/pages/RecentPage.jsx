import React from 'react';
import { Clock } from 'lucide-react';
import PlaceholderPage from '../components/shared/PlaceholderPage';

const RecentPage = () => {
  return (
    <PlaceholderPage 
      icon={Clock}
      title="Recent Transactions"
      description="Your most recently touched expenses across all groups."
    />
  );
};

export default RecentPage;
