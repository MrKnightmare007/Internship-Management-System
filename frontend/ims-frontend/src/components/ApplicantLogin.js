import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './ApplicantAuth.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

function ApplicantLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    api.post('/auth/applicant-login', { username, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        setIsLoading(false);
        navigate('/applicant-dashboard');
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data || 'Invalid credentials.');
      });
  };

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.authCard}>
        <h1 className={styles.title}>Login</h1>
        <form onSubmit={handleLogin}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.redirectLink}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </Card>
    </div>
  );
}

export default ApplicantLogin;