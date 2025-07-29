import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';

// Import the new page components
import AdminDashboardHome from './AdminDashboardHome';
import AdminInternshipPrograms from './AdminInternshipPrograms';
import AdminManageOrganizations from './AdminManageOrganizations';
import AdminManageCoordinators from './AdminManageCoordinators';
import AdminAnalytics from './AdminAnalytics';


function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/admin-login" />;
}

function AdminRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }>
          {/* Nested routes will render inside AdminLayout's <Outlet /> */}
          <Route index element={<AdminDashboardHome />} />
          <Route path="programs" element={<AdminInternshipPrograms />} />
          <Route path="organizations" element={<AdminManageOrganizations />} />
          <Route path="coordinators" element={<AdminManageCoordinators />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default AdminRoutes;