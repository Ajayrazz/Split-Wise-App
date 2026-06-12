import React from 'react';
import { HelpCircle } from 'lucide-react';
import PlaceholderPage from '../components/shared/PlaceholderPage';

const HelpPage = () => {
  return (
    <PlaceholderPage 
      icon={HelpCircle}
      title="Help & Support"
      description="Documentation, FAQs, and contact information."
    />
  );
};

export default HelpPage;
