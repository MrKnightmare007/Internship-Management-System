import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Import the layout and login page
import OrganizationLogin from './OrganizationLogin';
import OrganizationLayout from './OrganizationLayout';
import OrgProfile from './OrgProfile';
// Import the ACTUAL page components
import OrgDashboardHome from './OrgDashboardHome';
import ManagePrograms from './ManagePrograms';
import ManageApplications from './ManageApplications';
import ManageMentors from './ManageMentors';
import OrgReports from './OrgReports';
import OrgNotifications from './OrgNotifications';

function PrivateRoute() {
  const token = localStorage.getItem('token');
  return token ? <OrganizationLayout /> : <Navigate to="/org-login" />;
}

function OrganizationRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/org-login" element={<OrganizationLogin />} />
        
        {/* All private dashboard routes are now nested inside the layout */}
        <Route path="/organization-dashboard" element={<PrivateRoute />}>
          <Route index element={<OrgDashboardHome />} />
          <Route path="profile" element={<OrgProfile />} />
          <Route path="programs" element={<ManagePrograms />} />
          <Route path="applications" element={<ManageApplications />} />
          <Route path="mentors" element={<ManageMentors />} />
          <Route path="reports" element={<OrgReports />} />
          <Route path="notifications" element={<OrgNotifications />} />
        </Route>
        
        {/* Fallback to the login page */}
        <Route path="*" element={<Navigate to="/org-login" />} />
      </Routes>
    </Router>
  );
}

export default OrganizationRoutes;