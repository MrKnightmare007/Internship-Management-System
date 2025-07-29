import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, Outlet } from 'react-router-dom';

// Import all necessary components
import ApplicantRegister from './ApplicantRegister';
import ApplicantLogin from './ApplicantLogin';
import LandingPage from './LandingPage'; // This is the simple hero page now
import PublicNavbar from './ui/PublicNavbar'; // The detailed WEBEL navbar
import Footer from './ui/Footer'; // The detailed WEBEL footer

// Import New Applicant Dashboard Components
import ApplicantLayout from './ApplicantLayout';
import ApplicantDashboard from './ApplicantDashboard';
import Profile from './Profile'; // New Profile Page
import BrowsePrograms from './BrowsePrograms'; // New Browse Page

// Placeholder components for pages that need backend data
const MyInternships = () => <div><h2>My Internships Page</h2><p>Details about active and past internships will be shown here.</p></div>;
const MyTasks = () => <div><h2>My Tasks Page</h2><p>A list of all tasks, including pending, completed, and overdue.</p></div>;
const Certificates = () => <div><h2>My Certificates Page</h2><p>A collection of all earned certificates.</p></div>;
const Notifications = () => <div><h2>Notifications Page</h2><p>All received notifications will be listed here.</p></div>;

// Public pages get the full WEBEL-branded layout
function PublicLayout() {
  return (
    <>
      <PublicNavbar />
      <Outlet />
      <Footer />
    </>
  );
}

// Private routes are wrapped in the ApplicantLayout (Sidebar + Content)
function PrivateRoute() {
  const token = localStorage.getItem('token');
  return token ? <ApplicantLayout /> : <Navigate to="/login" />;
}

function MainSiteRoutes() {
  return (
    <Router>
      <Routes>
        {/* --- Public Routes --- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<ApplicantLogin />} />
          <Route path="/register" element={<ApplicantRegister />} />
        </Route>
        
        {/* --- Private Applicant Routes (Nested) --- */}
        <Route path="/applicant-dashboard" element={<PrivateRoute />}>
            <Route index element={<ApplicantDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="internships" element={<MyInternships />} />
            <Route path="tasks" element={<MyTasks />} />
            <Route path="browse" element={<BrowsePrograms />} />
            <Route path="certificates" element={<Certificates />} />
            <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* Fallback for any other route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default MainSiteRoutes;