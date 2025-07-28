import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import ApplicantRegister from './ApplicantRegister';
import ApplicantLogin from './ApplicantLogin';
import ApplicantDashboard from './ApplicantDashboard';

// A simple component for your public landing page
function LandingPage() {
    return (
        <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'sans-serif' }}>
            <h1>Welcome to the WEBEL Internship Portal</h1>
            <p style={{ fontSize: '1.2em', color: '#555' }}>Find exciting internship opportunities and kickstart your career.</p>
            <div style={{ marginTop: '30px' }}>
                <Link to="/login">
                    <button style={{ padding: '12px 25px', marginRight: '15px', fontSize: '1em', cursor: 'pointer' }}>
                        Login
                    </button>
                </Link>
                <Link to="/register">
                    <button style={{ padding: '12px 25px', fontSize: '1em', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                        Register
                    </button>
                </Link>
            </div>
        </div>
    );
}

// A component to protect routes that require a login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  // This logic can be enhanced later to check token roles
  return token ? children : <Navigate to="/login" />;
}

// The main router for the public website
function MainSiteRoutes() {
  return (
    <Router>
      <Routes>
        {/* --- Publicly Accessible Routes --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<ApplicantLogin />} />
        <Route path="/register" element={<ApplicantRegister />} />

        {/* --- Private Applicant Route --- */}
        <Route
          path="/applicant-dashboard"
          element={
            <PrivateRoute>
              <ApplicantDashboard />
            </PrivateRoute>
          }
        />

        {/* A fallback to redirect any unknown URL to the landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default MainSiteRoutes;
