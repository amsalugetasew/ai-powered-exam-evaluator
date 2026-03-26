import React, { useEffect, useState } from 'react';
import AdminDashboard from './components/AdminDashboard';
import Header from './components/Header';
import InstructorDashboard from './components/InstructorDashboard';
import LoginPage from './components/LoginPage';
import StudentDashboard from './components/StudentDashboard';
import {
  getCurrentUser,
  getStoredUser,
  login,
  logout,
  setAuthToken,
  setStoredUser,
} from './services/api';

function App() {
  const [user, setUser] = useState(getStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem('exam-evaluator-token')));
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('exam-evaluator-token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    const validateSession = async () => {
      try {
        setAuthToken(token);
        const response = await getCurrentUser();
        setUser(response.user);
        setStoredUser(response.user);
      } catch (error) {
        setAuthToken('');
        setStoredUser(null);
        setUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    validateSession();
  }, []);

  const handleLogin = async ({ username, password }) => {
    setLoginLoading(true);
    setAuthError('');

    try {
      const response = await login(username, password);
      setAuthToken(response.token);
      setStoredUser(response.user);
      setUser(response.user);
    } catch (error) {
      setAuthError(error.response?.data?.error || error.message || 'Unable to login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      // Ignore logout transport failures and clear the local session anyway.
    } finally {
      setAuthToken('');
      setStoredUser(null);
      setUser(null);
      setAuthError('');
    }
  };

  const handleCurrentUserUpdate = (nextUser) => {
    setStoredUser(nextUser);
    setUser(nextUser);
  };

  const renderDashboard = () => {
    if (!user) return null;
    if (user.role === 'admin') {
      return <AdminDashboard currentUser={user} onCurrentUserUpdate={handleCurrentUserUpdate} />;
    }
    if (user.role === 'instructor') return <InstructorDashboard />;
    return <StudentDashboard user={user} />;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(6,182,212,0.12),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef6ff_100%)]">
      <Header user={user} onLogout={handleLogout} />
      <main className="mx-auto max-w-7xl px-4 py-8">
        {authLoading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
            Validating your session...
          </div>
        ) : user ? (
          renderDashboard()
        ) : (
          <LoginPage onLogin={handleLogin} loading={loginLoading} error={authError} />
        )}
      </main>
    </div>
  );
}

export default App;
