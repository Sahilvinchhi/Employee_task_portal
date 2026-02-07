import React, { useState } from 'react';
import './style.css';
import logoImage from './assets/logo.png';

type LoginState = 'idle' | 'submitting' | 'success' | 'error';

interface LoginPageProps {
  onRegisterClick?: () => void;
  onLoginSuccess?: (user: any, accessToken: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onRegisterClick, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [status, setStatus] = useState<LoginState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus('submitting');
    setSuccessMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, keepSignedIn }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setError(data.message || 'Login failed. Please try again.');
        return;
      }

      setStatus('success');
      setSuccessMessage('Login successful. Welcome back!');
      // Store access token and call success callback with user data
      if (data.accessToken && data.user && onLoginSuccess) {
        onLoginSuccess(data.user, data.accessToken);
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="login-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <img src={logoImage} alt="Logo" className="auth-logo-img" />
          </div>
          <h1 className="auth-brand-title">Employee<br />Training Platform</h1>
          <p className="auth-brand-subtitle">Online Professional Development</p>
          
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span className="feature-text">Online Training</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span className="feature-text">Course Scheduling</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span className="feature-text">Progress Tracking</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏆</span>
              <span className="feature-text">Reporting</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-title">Login</h2>
            <p className="auth-subtitle">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>

            <div className="checkbox">
              <input
                id="keepSignedIn"
                type="checkbox"
                checked={keepSignedIn}
                onChange={(e) => setKeepSignedIn(e.target.checked)}
              />
              <label htmlFor="keepSignedIn" className="checkbox-label">Keep me signed in</label>
            </div>

            {error && <div className="alert error">{error}</div>}
            {successMessage && <div className="alert success">{successMessage}</div>}

            <button
              type="submit"
              className="auth-button"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            <p className="auth-footer-text">
              Don't have an account?{' '}
              <button
                type="button"
                className="link-button"
                onClick={onRegisterClick}
              >
                Create one here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

