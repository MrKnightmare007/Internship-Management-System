import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './PublicNavbar.module.css';

const PublicNavbar = () => {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink to="/" className={styles.brand}>
          WEBEL IMS
        </NavLink>
        <ul className={styles.navList}>
          <li>
            <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
              Home
            </NavLink>
          </li>
          <li>
            <NavLink to="/internships" className={({ isActive }) => (isActive ? styles.active : '')}>
              Internships
            </NavLink>
          </li>
        </ul>
        <div className={styles.actions}>
          <NavLink to="/login" className={styles.loginBtn}>Login</NavLink>
          <NavLink to="/register" className={styles.registerBtn}>Register</NavLink>
        </div>
      </nav>
    </header>
  );
};

export default PublicNavbar;