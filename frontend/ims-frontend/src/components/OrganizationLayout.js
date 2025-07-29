import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './OrganizationLayout.module.css';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

const OrganizationSidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.coordinatorInfo}>
      <h4>Organization Master Portal</h4>
    </div>
    <nav className={styles.nav}>
      {/* Ensure these spans with emojis exist in your file */}
      <NavLink to="/organization-dashboard" end className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📊</span> Dashboard
      </NavLink>
      <NavLink to="/organization-dashboard/programs" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🗂️</span> Manage Programs
      </NavLink>
      <NavLink to="/organization-dashboard/applications" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📄</span> Manage Applications
      </NavLink>
      <NavLink to="/organization-dashboard/mentors" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🧑‍🏫</span> Manage Mentors
      </NavLink>
       <NavLink to="/organization-dashboard/reports" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📈</span> Reports
      </NavLink>
      <NavLink to="/organization-dashboard/notifications" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🔔</span> Notifications
      </NavLink>
    </nav>
  </aside>
);

const OrganizationLayout = () => {
  return (
    <div className={styles.pageContainer}>
      <Navbar title="Coordinator Portal" showProfileMenu={true} profilePath="/organization-dashboard/profile" logoutPath="/org-login" />
      <div className={styles.layout}>
        <OrganizationSidebar />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default OrganizationLayout;