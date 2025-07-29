import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';

// Import all necessary components
import ApplicantRegister from './ApplicantRegister';
import ApplicantLogin from './ApplicantLogin';
import ApplicantDashboard from './ApplicantDashboard';
import LandingPage from './LandingPage'; // The new landing page
import PublicNavbar from './ui/PublicNavbar';
import Footer from './ui/Footer';

// A layout for public pages (Navbar, content, Footer)
function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet /> {/* This will render the matched child route */}
      <Footer />
    </>
  );
}

// A component to protect routes that require a login
function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

// The main router for the public website
function MainSiteRoutes() {
  return (
    <Router>
      <Routes>
        {/* --- Publicly Accessible Routes with Navbar/Footer --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/internships" element={<ApplicantDashboard />} /> {/* Also public to view */}
          <Route path="/login" element={<ApplicantLogin />} />
          <Route path="/register" element={<ApplicantRegister />} />
        </Route>
        
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