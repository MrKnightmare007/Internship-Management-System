import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './ApplicantAuth.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

function ApplicantRegister() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/register', { username, email, password })
      .then(response => {
        setIsLoading(false);
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch(err => {
        setIsLoading(false);
        setError(err.response?.data?.message || 'Registration failed.');
      });
  };

  return (
    <div className={styles.pageContainer}>
      <Card className={styles.authCard}>
        <h1 className={styles.title}>Create Your Account</h1>
        <form onSubmit={handleRegister}>
          <div className={styles.inputGroup}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input type="email" id="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        {message && <p className={styles.message}>{message}</p>}
        {error && <p className={styles.error}>{error}</p>}
        <p className={styles.redirectLink}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </Card>
    </div>
  );
}

export default ApplicantRegister;