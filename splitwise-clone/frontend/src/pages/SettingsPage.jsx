import React from 'react';
import { Settings } from 'lucide-react';
import PlaceholderPage from '../components/shared/PlaceholderPage';

const SettingsPage = () => {
  return (
    <PlaceholderPage 
      icon={Settings}
      title="Settings"
      description="App preferences and account settings."
    />
  );
};

export default SettingsPage;
