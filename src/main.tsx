import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import './style.css';

import { LoginPage } from './login-page';
import { RegisterPage } from './register-page';
import { Dashboard } from './dashboard';

interface User {
  Id: number;
  FullName: string;
  Email: string;
  Role: string;
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  return currentPage === 'login' ? (
    <LoginPage onRegisterClick={() => setCurrentPage('register')} onLoginSuccess={handleLoginSuccess} />
  ) : currentPage === 'register' ? (
    <RegisterPage onBackToLogin={() => setCurrentPage('login')} />
  ) : (
    <Dashboard onLogout={handleLogout} user={user || undefined} />
  );
};

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

