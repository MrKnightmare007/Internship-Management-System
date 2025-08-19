import React, { useState } from 'react';
import styles from './EnhancedInput.module.css';

const EnhancedInput = ({ 
  type = 'text', 
  label, 
  placeholder, 
  value, 
  onChange, 
  required = false, 
  error = '', 
  icon = null,
  showPasswordToggle = false,
  ...props 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={styles.inputContainer}>
      <label className={`${styles.label} ${isFocused || value ? styles.labelActive : ''}`}>
        {label} {required && <span className={styles.required}>*</span>}
      </label>
      <div className={`${styles.inputWrapper} ${error ? styles.error : ''} ${isFocused ? styles.focused : ''}`}>
        {icon && <div className={styles.icon}>{icon}</div>}
        <input
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={styles.input}
          required={required}
          {...props}
        />
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        )}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default EnhancedInput;