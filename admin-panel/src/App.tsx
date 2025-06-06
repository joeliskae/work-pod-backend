import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import { Navigation } from './components/navigation/Navigation';
import { AnalyticsDashboard } from './components/pages/AnalyticsDashboard';
import { CalendarManagement } from './components/pages/CalendarManagement';
import { TabletSettings } from './components/pages/TabletSettings';
import { InfoPage } from './components/pages/InfoPage';

const App: React.FC = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('analytics');

  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'calendars':
        return <CalendarManagement />;
      case 'tablets':
        return <TabletSettings />;
      case 'info':
        return <InfoPage />;
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={user!}
        onLogout={logout}
      />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderCurrentPage()}
      </main>
    </div>
  );
};

export default App;