import React from 'react';
import styles from './Button.module.css';

/**
 * A reusable Button component with different styles and functionalities.
 * @param {object} props
 * @param {React.ReactNode} props.children - The button text or content.
 * @param {function} props.onClick - The function to execute on click.
 * @param {'primary' | 'secondary' | 'danger'} [props.variant='primary'] - The button style variant.
 * @param {string} [props.type='button'] - The button type (e.g., 'button', 'submit').
 * @param {boolean} [props.disabled=false] - Whether the button is disabled.
 * @param {string} [props.className] - Optional additional class names.
 * @returns {JSX.Element} The button component.
 */
const Button = ({ children, onClick, variant = 'primary', type = 'button', disabled = false, className }) => {
  const buttonClasses = `
    ${styles.btn}
    ${styles[variant]}
    ${className || ''}
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClasses}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;