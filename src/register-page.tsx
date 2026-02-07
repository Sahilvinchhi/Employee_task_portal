import React, { useState } from 'react';
import './style.css';
import logoImage from './assets/logo.png';


type RegisterState = 'idle' | 'submitting' | 'success' | 'error';

interface RegisterPageProps {
  onBackToLogin: () => void;
}


export const RegisterPage: React.FC<RegisterPageProps> = ({ onBackToLogin }) => {
  console.log('RegisterPage loaded');
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    email: '',
    contactNumber: '',
    position: '',
    gender: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState<RegisterState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.contactNumber.trim() ||
      !formData.position ||
      !formData.gender ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      setError('All fields are required.');
      return false;
    }

    if (!formData.dob) {
      setError('Date of Birth is required.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    const contactRegex = /^\d{10}$/;
    if (!contactRegex.test(formData.contactNumber)) {
      setError('Contact number must be exactly 10 digits.');
      return false;
    }

    if (/^(\d)\1{9}$/.test(formData.contactNumber)) {
      setError('Contact number cannot contain all same digits.');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return false;
    }

    setError(null);
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    // Clear any existing error when user updates a field
    if (error) setError(null);
    const { name, value } = e.target;

    if (name === 'contactNumber') {
      const digitOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: digitOnly,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus('submitting');
    setSuccessMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setStatus('error');
        setError(data.message || 'Registration failed. Please try again.');
        return;
      }

      setStatus('success');
      setSuccessMessage('Registration successful! Redirecting to login...');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="register-page">
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

      {/* Right Panel - Register Form */}
      <div className="auth-right auth-right-register">
        <div className="auth-card auth-card-large">
          <div className="auth-card-header">
            <h2 className="auth-title">Create Your Account</h2>
            <p className="auth-subtitle">Join our training platform today</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {/* Row 1: Full Name and Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Row 2: Date of Birth and Contact Number */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="dob">
                  Date of Birth <span className="required">*</span>
                </label>
                <input
                  id="dob"
                  type="date"
                  className="form-input"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contactNumber">
                  Contact Number <span className="required">*</span>
                </label>
                <input
                  id="contactNumber"
                  type="text"
                  className="form-input"
                  name="contactNumber"
                  placeholder="1234567890"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  maxLength={10}
                />
                {formData.contactNumber && formData.contactNumber.length === 10 && /^(\d)\1{9}$/.test(formData.contactNumber) && (
                  <span className="field-error">
                    Contact number cannot contain all same digits
                  </span>
                )}
                {formData.contactNumber && formData.contactNumber.length < 10 && (
                  <span className="field-hint">
                    {formData.contactNumber.length}/10 digits
                  </span>
                )}
              </div>
            </div>

            {/* Row 3: Position and Gender */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="position">
                  Position <span className="required">*</span>
                </label>
                <select
                  id="position"
                  className="form-input"
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                >
                  <option value="">Select a position</option>
                  <option value="Junior">Junior</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">
                  Gender <span className="required">*</span>
                </label>
                <select
                  id="gender"
                  className="form-input"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Row 4: Password and Confirm Password */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="required">*</span>
                  <span className="password-hint">(Min. 6 chars)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  name="password"
                  placeholder="Enter a secure password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {error && <div className="alert error">{error}</div>}
            {successMessage && <div className="alert success">{successMessage}</div>}

            <div className="button-group">
              <button
                type="submit"
                className="auth-button"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Creating Account...' : 'Create Account'}
              </button>
              <button
                type="button"
                className="auth-button-secondary"
                onClick={onBackToLogin}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
