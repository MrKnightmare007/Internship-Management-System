import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import OrganizationLogin from './OrganizationLogin';
import OrganizationDashboard from './OrganizationDashboard';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/org-login" />;
}

function OrganizationRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/org-login" element={<OrganizationLogin />} />
        <Route path="/organization-dashboard" element={
          <PrivateRoute>
            <OrganizationDashboard />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/org-login" />} />
      </Routes>
    </Router>
  );
}

export default OrganizationRoutes;
