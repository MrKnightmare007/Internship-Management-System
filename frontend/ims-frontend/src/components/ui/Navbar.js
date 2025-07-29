import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import Button from './Button';

/**
 * A responsive Navbar for the admin and organization dashboards.
 * @param {object} props
 * @param {string} props.title - The title to display in the navbar.
 * @param {string} props.logoutPath - The path to redirect to on logout.
 * @returns {JSX.Element} The Navbar component.
 */
const Navbar = ({ title, logoutPath = '/' }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear(); // Clear token and any other session data
    navigate(logoutPath);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          {/* You can replace this text with the WEBEL logo image */}
          <span className={styles.logoText}>WEBEL</span>
          <span className={styles.title}>{title}</span>
        </div>
        <Button onClick={handleLogout} variant="secondary">
          Logout
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;