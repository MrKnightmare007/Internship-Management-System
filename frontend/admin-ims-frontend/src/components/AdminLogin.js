import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './AdminLogin.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/login', { username, password })
      .then(response => {
        setIsLoading(false);
        setMessage(response.data.message);
        setShowOtpForm(true);
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data || 'Invalid credentials or server error');
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/verify-otp', { username, otp })
      .then(response => {
        setIsLoading(false);
        localStorage.setItem('token', response.data.token);
        navigate('/admin-dashboard');
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data || 'Invalid OTP or server error');
      });
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <p className={styles.instructions}>Please enter your credentials to receive a verification code.</p>
      <div className={styles.inputGroup}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          placeholder="Enter username"
        />
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password"
        />
      </div>
      <Button type="submit" variant="primary" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Logging In...' : 'LOGIN'}
      </Button>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleVerifyOtp}>
      <p className={styles.instructions}>A 6-digit code has been sent to the super admin email. Please enter it below.</p>
      <div className={styles.inputGroup}>
        <label htmlFor="otp">One-Time Password (OTP)</label>
        <input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
          placeholder="Enter 6-digit code"
          maxLength="6"
          className={styles.otpInput}
        />
      </div>
      <Button type="submit" variant="primary" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Verifying...' : 'Verify & Login'}
      </Button>
    </form>
  );

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.loginCard}>
        <h1 className={styles.title}>Super Admin Login</h1>
        {!showOtpForm ? renderLoginForm() : renderOtpForm()}
        {message && !error && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </Card>
    </div>
  );
}

export default AdminLogin;