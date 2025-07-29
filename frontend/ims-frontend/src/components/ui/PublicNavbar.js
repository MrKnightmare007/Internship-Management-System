import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './PublicNavbar.module.css';

const PublicNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <NavLink to="/" className={styles.brand}>
          {/* Make sure this image is in public/assets/img/ */}
          <img src="/assets/img/Webel_logo_WBEIDC.png" alt="Webel Logo" />
        </NavLink>

        <nav className={`${styles.nav} ${isMenuOpen ? styles.navOpen : ''}`}>
          <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Home
          </NavLink>
          <NavLink to="/internships" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Internships
          </NavLink>
          <div className={styles.navActionsMobile}>
            <NavLink to="/login" className={`${styles.actionBtn} ${styles.loginBtn}`}>Login</NavLink>
            <NavLink to="/register" className={`${styles.actionBtn} ${styles.registerBtn}`}>Register</NavLink>
          </div>
        </nav>

        <div className={styles.actions}>
          <NavLink to="/login" className={`${styles.actionBtn} ${styles.loginBtn}`}>Login</NavLink>
          <NavLink to="/register" className={`${styles.actionBtn} ${styles.registerBtn}`}>Register</NavLink>
        </div>

        <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </button>
      </div>
    </header>
  );
};

export default PublicNavbar;