import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './OrganizationAuth.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import EnhancedInput from './ui/EnhancedInput';
import OTPInput from './ui/OTPInput';

function OrganizationLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    selectedOrg: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [currentStep, setCurrentStep] = useState('login'); // login, forgotPassword, verifyOTP, resetPassword
  const [organizations, setOrganizations] = useState([]);
  const [isFetchingOrgs, setIsFetchingOrgs] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsFetchingOrgs(true);
    api.get('/organizations')
      .then(response => {
        setOrganizations(response.data);
        if (response.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            selectedOrg: response.data[0].orgId
          }));
        }
        setIsFetchingOrgs(false);
      })
      .catch(err => {
        console.error("Failed to fetch organizations", err);
        setErrors({ general: "Could not load organization list. Please refresh." });
        setIsFetchingOrgs(false);
      });
  }, []);

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleOTPChange = (otpValue) => {
    setFormData(prev => ({
      ...prev,
      otp: otpValue
    }));
    if (errors.otp) {
      setErrors(prev => ({
        ...prev,
        otp: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (currentStep === 'login') {
      if (!formData.selectedOrg) newErrors.selectedOrg = 'Please select an organization';
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
    } else if (currentStep === 'forgotPassword') {
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    } else if (currentStep === 'verifyOTP') {
      if (!formData.otp || formData.otp.length !== 6) newErrors.otp = 'Please enter a valid 6-digit OTP';
    } else if (currentStep === 'resetPassword') {
      if (!formData.newPassword) newErrors.newPassword = 'New password is required';
      else if (formData.newPassword.length < 6) newErrors.newPassword = 'Password must be at least 6 characters';
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
      else if (formData.newPassword !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/org-login', {
        username: formData.username,
        password: formData.password,
        orgId: formData.selectedOrg
      });
      setMessage(response.data.message);
      setCurrentStep('verifyOTP');
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Login failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: formData.email });
      setMessage('OTP sent to your email. Please check your inbox.');
      setCurrentStep('verifyOTP');
    } catch (err) {
      setErrors({ email: err.response?.data?.message || 'Failed to send OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (currentStep === 'verifyOTP' && formData.username) {
        // For login flow
        const response = await api.post('/auth/verify-otp', {
          username: formData.username,
          otp: formData.otp
        });
        localStorage.setItem('token', response.data.token);
        navigate('/organization-dashboard');
      } else {
        // For forgot password flow
        await api.post('/auth/verify-reset-otp', {
          email: formData.email,
          otp: formData.otp
        });
        setMessage('OTP verified successfully. Please set your new password.');
        setCurrentStep('resetPassword');
      }
    } catch (err) {
      setErrors({ otp: err.response?.data?.message || 'Invalid OTP.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword
      });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        setCurrentStep('login');
        setFormData({
          username: '',
          password: '',
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
          selectedOrg: formData.selectedOrg
        });
        setMessage('');
      }, 2000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || 'Failed to reset password.' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className={styles.form}>
      <div className={styles.selectContainer}>
        <label className={styles.selectLabel}>Organization</label>
        {isFetchingOrgs ? (
          <div className={styles.loaderContainer}><Loader /></div>
        ) : (
          <select 
            className={`${styles.select} ${errors.selectedOrg ? styles.error : ''}`}
            value={formData.selectedOrg} 
            onChange={handleInputChange('selectedOrg')}
            required
          >
            <option value="">-- Select Organization --</option>
            {organizations.map(org => (
              <option key={org.orgId} value={org.orgId}>{org.orgName}</option>
            ))}
          </select>
        )}
        {errors.selectedOrg && <span className={styles.errorText}>{errors.selectedOrg}</span>}
      </div>
      
      <EnhancedInput
        type="text"
        label="Username"
        placeholder="Enter your username"
        value={formData.username}
        onChange={handleInputChange('username')}
        error={errors.username}
        icon="👤"
        required
      />
      <EnhancedInput
        type="password"
        label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={handleInputChange('password')}
        error={errors.password}
        icon="🔒"
        showPasswordToggle
        required
      />
      <Button type="submit" className={styles.submitButton} disabled={isLoading || isFetchingOrgs}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
      <div className={styles.linkContainer}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setCurrentStep('forgotPassword')}
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <form onSubmit={handleForgotPassword} className={styles.form}>
      <p className={styles.instructions}>
        Enter your email address and we'll send you an OTP to reset your password.
      </p>
      <EnhancedInput
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange('email')}
        error={errors.email}
        icon="📧"
        required
      />
      <Button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Sending OTP...' : 'Send OTP'}
      </Button>
      <div className={styles.linkContainer}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => setCurrentStep('login')}
        >
          Back to Login
        </button>
      </div>
    </form>
  );

  const renderVerifyOTPForm = () => (
    <form onSubmit={handleVerifyOTP} className={styles.form}>
      <p className={styles.instructions}>
        Enter the 6-digit OTP sent to your {formData.username ? 'organization email' : 'email address'}.
      </p>
      <div className={styles.otpSection}>
        <label className={styles.otpLabel}>One-Time Password</label>
        <OTPInput
          length={6}
          value={formData.otp}
          onChange={handleOTPChange}
          error={errors.otp}
        />
      </div>
      <Button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Verifying...' : 'Verify OTP'}
      </Button>
      <div className={styles.linkContainer}>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() => formData.username ? handleLogin : handleForgotPassword}
        >
          Resend OTP
        </button>
      </div>
    </form>
  );

  const renderResetPasswordForm = () => (
    <form onSubmit={handleResetPassword} className={styles.form}>
      <p className={styles.instructions}>
        Create a new password for your account.
      </p>
      <EnhancedInput
        type="password"
        label="New Password"
        placeholder="Enter new password"
        value={formData.newPassword}
        onChange={handleInputChange('newPassword')}
        error={errors.newPassword}
        icon="🔒"
        showPasswordToggle
        required
      />
      <EnhancedInput
        type="password"
        label="Confirm Password"
        placeholder="Confirm new password"
        value={formData.confirmPassword}
        onChange={handleInputChange('confirmPassword')}
        error={errors.confirmPassword}
        icon="🔒"
        showPasswordToggle
        required
      />
      <Button type="submit" className={styles.submitButton} disabled={isLoading}>
        {isLoading ? 'Resetting...' : 'Reset Password'}
      </Button>
    </form>
  );

  const getTitle = () => {
    switch (currentStep) {
      case 'forgotPassword': return 'Forgot Password';
      case 'verifyOTP': return 'Verify OTP';
      case 'resetPassword': return 'Reset Password';
      default: return 'Organization Login';
    }
  };

  const getSubtitle = () => {
    switch (currentStep) {
      case 'forgotPassword': return 'Reset your password';
      case 'verifyOTP': return 'Check your email';
      case 'resetPassword': return 'Create new password';
      default: return 'Sign in to your account';
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>{getTitle()}</h1>
            <p className={styles.subtitle}>{getSubtitle()}</p>
          </div>

          {currentStep === 'login' && renderLoginForm()}
          {currentStep === 'forgotPassword' && renderForgotPasswordForm()}
          {currentStep === 'verifyOTP' && renderVerifyOTPForm()}
          {currentStep === 'resetPassword' && renderResetPasswordForm()}

          {message && <div className={styles.message}>{message}</div>}
          {errors.general && <div className={styles.error}>{errors.general}</div>}
        </Card>
      </div>
    </div>
  );
}

export default OrganizationLogin;