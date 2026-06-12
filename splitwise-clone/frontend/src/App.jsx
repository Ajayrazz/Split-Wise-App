import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import useAuth from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

import DashboardPage from './pages/DashboardPage';
import GroupsIndexPage from './pages/GroupsIndexPage';
import GroupPage from './pages/GroupPage';
import ExpensesPage from './pages/ExpensesPage';
import BalancesPage from './pages/BalancesPage';
import SettlementsPage from './pages/SettlementsPage';
import ActivityPage from './pages/ActivityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import RecentPage from './pages/RecentPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import ErrorBoundary from './components/shared/ErrorBoundary';

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <ErrorBoundary>
            <AppLayout />
          </ErrorBoundary>
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="groups" element={<GroupsIndexPage />} />
        <Route path="groups/:id" element={<GroupPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="balances" element={<BalancesPage />} />
        <Route path="settlements" element={<SettlementsPage />} />
        <Route path="activity" element={<ActivityPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="recent" element={<RecentPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="help" element={<HelpPage />} />
      </Route>
    </Routes>
  );
};

export default App;
