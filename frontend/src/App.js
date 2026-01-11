import React, { useState, useEffect } from 'react';
import './styles/global.css';
import Login from './components/Login';
import RechargesDashboard from './components/RechargesDashboard';
import PlanDetailsPage from './components/PlanDetailsPage';
import RechargeStatusPage from './components/RechargeStatusPage';
import RechargeHistoryPage from './components/RechargeHistoryPage';
import AdminDashboard from './components/AdminDashboard';
import HelpSupportPage from './components/HelpSupportPage';
import NotificationsPage from './components/NotificationsPage';
import UsageAnalyticsPage from './components/UsageAnalyticsPage';
import RefundsPage from './components/RefundsPage';
import SettingsPage from './components/SettingsPage';
import InfoPagesContainer from './components/InfoPagesContainer';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [rechargeData, setRechargeData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('dashboard');
    setSelectedPlan(null);
    setRechargeData(null);
    
    fetch('/auth/logout', { method: 'POST' }).catch(() => {});
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setCurrentPage('planDetails');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleRechargeComplete = (rechargeInfo) => {
    setRechargeData(rechargeInfo);
    setCurrentPage('rechargeStatus');
  };

  const handleViewHistory = () => setCurrentPage('history');
  const handleViewAdmin = () => setCurrentPage('admin');
  const handleViewSupport = () => setCurrentPage('support');
  const handleViewNotifications = () => setCurrentPage('notifications');
  const handleViewUsage = () => setCurrentPage('usage');
  const handleViewRefunds = () => setCurrentPage('refunds');
  const handleViewSettings = () => setCurrentPage('settings');
  const handleViewInfo = () => setCurrentPage('info');

  if (loading) {
    return <div style={{ padding: '50px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const pageProps = {
    user,
    onBack: handleBackToDashboard,
    onLogout: handleLogout
  };

  const dashboardProps = {
    ...pageProps,
    onSelectPlan: handleSelectPlan,
    onViewHistory: handleViewHistory,
    onViewAdmin: handleViewAdmin,
    onViewSupport: handleViewSupport,
    onViewNotifications: handleViewNotifications,
    onViewUsage: handleViewUsage,
    onViewRefunds: handleViewRefunds,
    onViewSettings: handleViewSettings,
    onViewInfo: handleViewInfo
  };

  switch (currentPage) {
    case 'dashboard':
      return <RechargesDashboard {...dashboardProps} />;
    case 'planDetails':
      return <PlanDetailsPage {...pageProps} selectedPlan={selectedPlan} onRechargeComplete={handleRechargeComplete} />;
    case 'rechargeStatus':
      return <RechargeStatusPage {...pageProps} rechargeData={rechargeData} />;
    case 'history':
      return <RechargeHistoryPage {...pageProps} />;
    case 'admin':
      return <AdminDashboard {...pageProps} />;
    case 'support':
      return <HelpSupportPage {...pageProps} />;
    case 'notifications':
      return <NotificationsPage {...pageProps} />;
    case 'usage':
      return <UsageAnalyticsPage {...pageProps} />;
    case 'refunds':
      return <RefundsPage {...pageProps} />;
    case 'settings':
      return <SettingsPage {...pageProps} />;
    case 'info':
      return <InfoPagesContainer {...pageProps} />;
    default:
      return <RechargesDashboard {...dashboardProps} />;
  }
};

export default App;