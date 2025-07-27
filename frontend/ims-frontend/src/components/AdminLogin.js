import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    axios.post('/api/auth/login', { username, password })
      .then(response => {
        localStorage.setItem('token', response.data.token);
        navigate('/admin-dashboard');
      })
      .catch(err => {
        console.error('Login error:', err.response);  // Log full error
        setError('Invalid credentials or server error');
      });
  };
  

  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Admin Login</h1>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', margin: '10px 0' }}
      />
      <button onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default AdminLogin;
