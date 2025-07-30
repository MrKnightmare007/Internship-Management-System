import React from 'react';
import styles from './Dialog.module.css';
import Button from './Button';

/**
 * Updated Dialog component.
 * @param {object} props
 * @param {boolean} [props.hideActions=false] - If true, hides the default Cancel/Confirm buttons.
 * @param {string} [props.confirmText='Confirm'] - Text for the confirm button.
 * @param {'primary' | 'danger'} [props.confirmVariant='primary'] - Style for the confirm button.
 */
const Dialog = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    onConfirm,
    hideActions = false,
    confirmText = 'Confirm',
    confirmVariant = 'primary'
}) => {
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
        
        {/* Buttons are now rendered conditionally */}
        {!hideActions && (
            <div className={styles.actions}>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant={confirmVariant} onClick={onConfirm}>
                    {confirmText}
                </Button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;