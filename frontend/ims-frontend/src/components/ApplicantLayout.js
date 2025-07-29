import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './ApplicantLayout.module.css';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

const ApplicantSidebar = ({ isOpen }) => (
  // Apply the 'sidebarOpen' class conditionally
  <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
    <div className={styles.studentInfo}>
      <h4>Applicant Portal</h4>
    </div>
    <nav className={styles.nav}>
      <NavLink to="/applicant-dashboard" end className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📊</span> Dashboard
      </NavLink>
      <NavLink to="/applicant-dashboard/internships" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🎯</span> My Internships
      </NavLink>
      <NavLink to="/applicant-dashboard/tasks" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📝</span> My Tasks
      </NavLink>
      <NavLink to="/applicant-dashboard/browse" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🔍</span> Browse Programs
      </NavLink>
      <NavLink to="/applicant-dashboard/certificates" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📜</span> Certificates
      </NavLink>
      <NavLink to="/applicant-dashboard/notifications" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🔔</span> Notifications
      </NavLink>
    </nav>
  </aside>
);

const ApplicantLayout = () => {
  // State to manage sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={styles.pageContainer}>
      <Navbar title="Student Portal" showProfileMenu={true} profilePath="/applicant-dashboard/profile" logoutPath="/login" onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className={styles.layout}>
        {/* Mobile overlay to close menu when clicking outside */}
        <div 
          className={`${styles.mobileOverlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <ApplicantSidebar isOpen={isSidebarOpen} />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicantLayout;