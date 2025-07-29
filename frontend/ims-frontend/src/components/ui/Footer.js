import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <p>&copy; {currentYear} WEBEL | All Rights Reserved.</p>
        <p>West Bengal Electronics Industry Development Corporation Limited</p>
      </div>
    </footer>
  );
};

export default Footer;