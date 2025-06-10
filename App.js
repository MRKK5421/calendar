import React from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import CalendarPage from './CalendarPage';
import GoalsPage from './GoalsPage';
import SettingsPage from './SettingsPage';
import LoginPage from './LoginPage';
import Home from './index';
import AllTasksPage from './all-tasks';
import PrivateRoute from '../components/PrivateRoute';

function App() {
  const router = useRouter();

  const renderPage = () => {
    switch (router.pathname) {
      case '/':
        return <Home />;
      case '/calendar':
        return (
          <PrivateRoute>
            <CalendarPage />
          </PrivateRoute>
        );
      case '/all-tasks':
        return (
          <PrivateRoute>
            <AllTasksPage />
          </PrivateRoute>
        );
      case '/goals':
        return (
          <PrivateRoute>
            <GoalsPage />
          </PrivateRoute>
        );
      case '/settings':
        return (
          <PrivateRoute>
            <SettingsPage />
          </PrivateRoute>
        );
      case '/login':
        return <LoginPage />;
      default:
        return <Home />;
    }
  };

  return (
    <>
      <Navigation />
      {renderPage()}
    </>
  );
}

export default App; 