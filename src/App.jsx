import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import MobileNav from './components/Layout/MobileNav';
import Login from './components/Auth/Login';
import { useAppHandlers } from './hooks/useAppHandlers';
import { renderContent } from './utils/renderContent';
import './App.css';

const AppContent = () => {
  const { isAuthenticated, login, logout, user } = useAuth();
  const handlers = useAppHandlers();
  const { view, setView, setItemToEdit, setQuoteToEdit } = handlers;

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }
  const handleLogout = () => {
    localStorage.removeItem('quotationToken');
    localStorage.removeItem('userDetails');

    // Redirect to login page
    window.location.href = '/login';
    // Or if you're using React Router:
    // navigate('/login');
  };


  // Main app content
  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Header view={view} onLogout={logout} user={user} />

      <div className="flex">
        <Sidebar
          currentView={view}
          setView={setView}
          setItemToEdit={setItemToEdit}
          setQuoteToEdit={setQuoteToEdit}
          onLogout={handleLogout}
          user={user}
        />

        <main className="sidebar-scroll flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto w-full">
          {renderContent(view, handlers)}
        </main>
      </div>

      <MobileNav
        currentView={view}
        setView={setView}
        setItemToEdit={setItemToEdit}
        setQuoteToEdit={setQuoteToEdit}
        onLogout={handleLogout}
        user={user}
      />
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;