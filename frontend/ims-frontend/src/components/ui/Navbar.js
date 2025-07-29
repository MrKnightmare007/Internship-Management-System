import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

/**
 * A responsive Navbar for the admin and organization dashboards.
 * Now includes a user profile dropdown for the applicant dashboard.
 * @param {object} props
 * @param {string} props.title - The title to display in the navbar.
 * @param {string} props.logoutPath - The path to redirect to on logout.
 * @param {boolean} [props.isApplicant=false] - Determines if the profile icon should be shown.
 * @returns {JSX.Element} The Navbar component.
 */
const Navbar = ({ title, logoutPath = '/', isApplicant = false }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate(logoutPath);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logoText}>WEBEL</span>
          <span className={styles.title}>{title}</span>
        </div>

        {isApplicant ? (
          <div className={styles.profileSection} ref={dropdownRef}>
            <div className={styles.avatar} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              ST
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link to="/applicant-dashboard/profile" onClick={() => setIsDropdownOpen(false)}>Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;