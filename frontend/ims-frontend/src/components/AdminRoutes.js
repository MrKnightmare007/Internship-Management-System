import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './AdminLogin';
import AdminDashboardPage from './AdminDashboard';

// This is the same PrivateRoute component you had before
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
            <AdminDashboardPage />
          </PrivateRoute>
        } />
        {/* The default route for the admin subdomain redirects to the login page */}
        <Route path="*" element={<Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default AdminRoutes;
