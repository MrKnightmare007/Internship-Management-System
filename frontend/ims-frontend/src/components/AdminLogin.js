import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // State to control which form is shown (login vs. otp)
  const [showOtpForm, setShowOtpForm] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/login', { username, password })
      .then(response => {
        setIsLoading(false);
        setMessage(response.data.message); // "Verification code sent..."
        setShowOtpForm(true); // Switch to the OTP form
      })
      .catch(err => {
        setIsLoading(false);
        console.error('Login error:', err.response);
        setError(err.response?.data || 'Invalid credentials or server error');
      });
  };

  const handleVerifyOtp = () => {
    setError('');
    setMessage('');
    setIsLoading(true);
    api.post('/auth/verify-otp', { username, otp })
      .then(response => {
        setIsLoading(false);
        // OTP is correct, save token and navigate
        localStorage.setItem('token', response.data.token);
        navigate('/admin-dashboard');
      })
      .catch(err => {
        setIsLoading(false);
        console.error('OTP verification error:', err.response);
        setError(err.response?.data || 'Invalid OTP or server error');
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h1>Super Admin Login</h1>
      
      {!showOtpForm ? (
        // --- Step 1: Username and Password Form ---
        <div>
          <p>Please enter your credentials to receive a verification code.</p>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '8px', width: '90%' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ display: 'block', margin: '10px auto', padding: '8px', width: '90%' }}
          />
          <button onClick={handleLogin} disabled={isLoading} style={{ padding: '10px 20px' }}>
            {isLoading ? 'Logging in...' : 'LOG IN'}
          </button>
        </div>
      ) : (
        // --- Step 2: OTP Verification Form ---
        <div>
          <p style={{ color: 'green' }}>{message}</p>
          <p>A 6-digit code has been sent to the admin email. Please enter it below.</p>
          <input
            type="text"
            placeholder="6-Digit Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
            style={{ display: 'block', margin: '10px auto', padding: '8px', width: '90%', letterSpacing: '0.5em' }}
          />
          <button onClick={handleVerifyOtp} disabled={isLoading} style={{ padding: '10px 20px' }}>
            {isLoading ? 'Verifying...' : 'Verify & Login'}
          </button>
        </div>
      )}

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
