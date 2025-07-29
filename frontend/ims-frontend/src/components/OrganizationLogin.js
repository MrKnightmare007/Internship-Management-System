import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './OrganizationLogin.module.css'; // New CSS module
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

function OrganizationLogin() {
  // All original state and logic is preserved
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [isFetchingOrgs, setIsFetchingOrgs] = useState(true);
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFetchingOrgs(true);
    api.get('/organizations')
      .then(response => {
        setOrganizations(response.data);
        if (response.data.length > 0) {
          setSelectedOrg(response.data[0].orgId);
        }
        setIsFetchingOrgs(false);
      })
      .catch(err => {
        console.error("Failed to fetch organizations", err);
        setError("Could not load organization list. Please refresh.");
        setIsFetchingOrgs(false);
      });
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!selectedOrg) {
      setError("Please select an organization.");
      return;
    }
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/org-login', { username, password, orgId: selectedOrg })
      .then(response => {
        setIsLoading(false);
        setMessage(response.data.message);
        setShowOtpForm(true);
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data?.message || 'Login failed.');
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
        navigate('/organization-dashboard');
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data?.message || 'Invalid OTP.');
      });
  };
  
  const renderLoginForm = () => (
    <form onSubmit={handleLogin}>
      <p className={styles.instructions}>Select your organization and enter your credentials.</p>
      <div className={styles.inputGroup}>
        <label htmlFor="organization">Organization</label>
        {isFetchingOrgs ? <Loader /> : (
          <select id="organization" value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)} required>
            <option value="">-- Select --</option>
            {organizations.map(org => (
              <option key={org.orgId} value={org.orgId}>{org.orgName}</option>
            ))}
          </select>
        )}
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="username">Username</label>
        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required placeholder="Enter username"/>
      </div>
      <div className={styles.inputGroup}>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter password" />
      </div>
      <Button type="submit" variant="primary" disabled={isLoading || isFetchingOrgs} className={styles.submitButton}>
        {isLoading ? 'Sending Code...' : 'Get Verification Code'}
      </Button>
    </form>
  );

  const renderOtpForm = () => (
    <form onSubmit={handleVerifyOtp}>
       <p className={styles.instructions}>A 6-digit code has been sent to your email. Please enter it below.</p>
       <div className={styles.inputGroup}>
        <label htmlFor="otp">One-Time Password (OTP)</label>
        <input id="otp" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required placeholder="Enter 6-digit code" maxLength="6" className={styles.otpInput}/>
      </div>
      <Button type="submit" variant="primary" disabled={isLoading} className={styles.submitButton}>
        {isLoading ? 'Verifying...' : 'Verify & Login'}
      </Button>
    </form>
  );


  return (
    <div className={styles.pageContainer}>
      <Card className={styles.loginCard}>
        <h1 className={styles.title}>Organization Portal</h1>
        {!showOtpForm ? renderLoginForm() : renderOtpForm()}
        {message && !error && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
      </Card>
    </div>
  );
}

export default OrganizationLogin;