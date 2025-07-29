import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';

const AdminSidebar = () => (
  <aside className={styles.sidebar}>
    <div className={styles.adminInfo}>
      <h4>Super Admin Portal</h4>
    </div>
    <nav className={styles.nav}>
      <NavLink to="/admin-dashboard" end className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📊</span> Dashboard
      </NavLink>
      <NavLink to="/admin-dashboard/programs" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🗂️</span> Internship Programs
      </NavLink>
      <NavLink to="/admin-dashboard/organizations" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🏢</span> Manage Organizations
      </NavLink>
      <NavLink to="/admin-dashboard/coordinators" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>🧑‍💼</span> Manage Masters
      </NavLink>
      <NavLink to="/admin-dashboard/analytics" className={({ isActive }) => isActive ? styles.active : ''}>
        <span>📈</span> Analytics
      </NavLink>
    </nav>
  </aside>
);

const AdminLayout = () => {
  return (
    <div className={styles.pageContainer}>
      {/* showProfileMenu is false or omitted to show only the Logout button */}
      <Navbar title="Internship Management System" logoutPath="/admin-login" />
      <div className={styles.layout}>
        <AdminSidebar />
        <main className={styles.mainContent}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminLayout;