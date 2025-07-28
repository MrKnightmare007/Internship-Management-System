import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function OrganizationLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [organizations, setOrganizations] = useState([]);
    const [selectedOrg, setSelectedOrg] = useState('');
    
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showOtpForm, setShowOtpForm] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch all organizations to populate the dropdown
        api.get('/organizations')
            .then(response => {
                setOrganizations(response.data);
                if (response.data.length > 0) {
                    setSelectedOrg(response.data[0].orgId);
                }
            })
            .catch(err => console.error("Failed to fetch organizations", err));
    }, []);

    const handleLogin = () => {
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

    const handleVerifyOtp = () => {
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

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
            <h1>Organization Login</h1>
            
            {!showOtpForm ? (
                <div>
                    <select 
                        value={selectedOrg} 
                        onChange={(e) => setSelectedOrg(e.target.value)}
                        style={{ display: 'block', margin: '10px auto', padding: '8px', width: '90%' }}
                    >
                        <option value="">-- Select Your Organization --</option>
                        {organizations.map(org => (
                            <option key={org.orgId} value={org.orgId}>{org.orgName}</option>
                        ))}
                    </select>
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
                        {isLoading ? 'Sending...' : 'Send Verification Code'}
                    </button>
                </div>
            ) : (
                <div>
                    <p style={{ color: 'green' }}>{message}</p>
                    <p>A 6-digit code has been sent to your email. Please enter it below.</p>
                    <input
                        type="text"
                        placeholder="6-Digit Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength="6"
                        style={{ display: 'block', margin: '10px auto', padding: '8px', width: '90%' }}
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

export default OrganizationLogin;
