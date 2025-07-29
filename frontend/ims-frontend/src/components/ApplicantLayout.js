import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './ApplicantLayout.module.css';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

const ApplicantSidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.studentInfo}>
      <h4>Navigation</h4>
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
  return (
    <div className={styles.pageContainer}>
      <Navbar title="Student Portal" isApplicant={true} logoutPath="/login" />
      <div className={styles.layout}>
        <ApplicantSidebar />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ApplicantLayout;