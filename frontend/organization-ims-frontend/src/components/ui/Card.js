import React from 'react';
import styles from './Card.module.css';

/**
 * A reusable Card component for displaying content in a structured block.
 * @param {object} props
 * @param {React.ReactNode} props.children - The content to be displayed inside the card.
 * @param {string} [props.className] - Optional additional class names for custom styling.
 * @returns {JSX.Element} The card component.
 */
const Card = ({ children, className }) => {
  // Combine the default card style with any additional classes passed as props
  const cardClasses = `${styles.card} ${className || ''}`;

  return <div className={cardClasses}>{children}</div>;
};

export default Card;