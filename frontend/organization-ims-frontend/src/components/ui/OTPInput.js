import React, { useState, useRef, useEffect } from 'react';
import styles from './OTPInput.module.css';

const OTPInput = ({ length = 6, value, onChange, error = '' }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      const otpArray = value.split('').slice(0, length);
      while (otpArray.length < length) {
        otpArray.push('');
      }
      setOtp(otpArray);
    }
  }, [value, length]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Call parent onChange
    onChange(newOtp.join(''));

    // Focus next input
    if (element.value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        inputRefs.current[index - 1].focus();
      }
    }
    // Handle arrow keys
    else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, length);
    
    if (!/^\d+$/.test(pasteData)) return; // Only allow digits
    
    const otpArray = new Array(length).fill('');
    pasteData.split('').forEach((char, index) => {
      if (index < length) {
        otpArray[index] = char;
      }
    });
    
    setOtp(otpArray);
    onChange(otpArray.join(''));
    
    // Focus the last filled input or the first empty one
    const lastFilledIndex = Math.min(pasteData.length - 1, length - 1);
    inputRefs.current[lastFilledIndex].focus();
  };

  return (
    <div className={styles.otpContainer}>
      <div className={styles.otpInputs}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`${styles.otpInput} ${error ? styles.error : ''}`}
            autoComplete="off"
          />
        ))}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};

export default OTPInput;