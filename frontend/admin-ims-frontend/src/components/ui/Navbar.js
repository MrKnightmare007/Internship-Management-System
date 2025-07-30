import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar = ({ title, logoutPath = '/', showProfileMenu = false, profilePath = '/profile', onMenuClick }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate(logoutPath);
  };

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
          {onMenuClick && ( // Show hamburger icon only if onMenuClick is provided
            <button className={styles.menuToggle} onClick={onMenuClick}>
              <i className="fas fa-bars"></i>
            </button>
          )}
          <span className={styles.logoText}>WEBEL</span>
          <span className={styles.title}>Internship Management System</span>
        </div>

        {showProfileMenu ? (
          <div className={styles.profileSection} ref={dropdownRef}>
            <div className={styles.avatar} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              {/* Using a generic user icon, can be customized */}
              <i className="fas fa-user"></i>
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link to={profilePath} onClick={() => setIsDropdownOpen(false)}>Profile</Link>
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