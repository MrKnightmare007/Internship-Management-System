import React from 'react';
import styles from './Dialog.module.css';
import Button from './Button';

/**
 * A reusable Dialog (Modal) component for confirmations or alerts.
 * @param {object} props
 * @param {boolean} props.isOpen - Controls the visibility of the dialog.
 * @param {function} props.onClose - Function to call when the dialog should be closed.
 * @param {string} props.title - The title of the dialog.
 * @param {React.ReactNode} props.children - The main content/message of the dialog.
 * @param {function} props.onConfirm - Function to call when the confirm action is taken.
 * @returns {JSX.Element|null} The dialog component or null if not open.
 */
const Dialog = ({ isOpen, onClose, title, children, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dialog;