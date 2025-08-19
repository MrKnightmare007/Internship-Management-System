import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './ApplicantAuth.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import EnhancedInput from './ui/EnhancedInput';

function ApplicantRegister() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setErrors({ 
        general: err.response?.data?.message || 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '' };
    
    let strength = 0;
    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    ];
    
    strength = checks.filter(Boolean).length;
    
    const strengthTexts = [
      '', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'
    ];
    
    const strengthColors = [
      '', '#ef4444', '#f97316', '#eab308', '#22c55e', '#16a34a'
    ];
    
    return {
      strength,
      text: strengthTexts[strength],
      color: strengthColors[strength]
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.authContainer}>
        <Card className={styles.authCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create Account</h1>
            <p className={styles.subtitle}>Join our internship community</p>
          </div>

          <form onSubmit={handleRegister} className={styles.form}>
            <EnhancedInput
              type="text"
              label="Username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleInputChange('username')}
              error={errors.username}
              icon="👤"
              required
            />

            <EnhancedInput
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={errors.email}
              icon="📧"
              required
            />

            <div>
              <EnhancedInput
                type="password"
                label="Password"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleInputChange('password')}
                error={errors.password}
                icon="🔒"
                showPasswordToggle
                required
              />
              {formData.password && (
                <div className={styles.passwordStrength}>
                  <div className={styles.strengthBar}>
                    <div 
                      className={styles.strengthFill}
                      style={{ 
                        width: `${(passwordStrength.strength / 5) * 100}%`,
                        backgroundColor: passwordStrength.color
                      }}
                    ></div>
                  </div>
                  <span 
                    className={styles.strengthText}
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.text}
                  </span>
                </div>
              )}
            </div>

            <EnhancedInput
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={errors.confirmPassword}
              icon="🔒"
              showPasswordToggle
              required
            />

            <Button type="submit" className={styles.submitButton} disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          {message && <div className={styles.message}>{message}</div>}
          {errors.general && <div className={styles.error}>{errors.general}</div>}

          <div className={styles.footer}>
            <p className={styles.redirectLink}>
              Already have an account?{' '}
              <Link to="/login" className={styles.link}>
                Login here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ApplicantRegister;