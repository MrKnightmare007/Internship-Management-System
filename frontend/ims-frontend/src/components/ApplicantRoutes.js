import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ApplicantDashboard from './ApplicantDashboard';
import ApplicantLogin from './ApplicantLogin'; // Import for redirect

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function ApplicantRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<ApplicantLogin />} />
        <Route path="/applicant-dashboard" element={
          <PrivateRoute>
            <ApplicantDashboard />
          </PrivateRoute>
        } />
        {/* Default route for applicants redirects to their dashboard */}
        <Route path="*" element={<Navigate to="/applicant-dashboard" />} />
      </Routes>
    </Router>
  );
}

export default ApplicantRoutes;
