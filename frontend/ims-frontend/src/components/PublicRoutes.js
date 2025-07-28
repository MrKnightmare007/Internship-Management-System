import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import ApplicantRegister from './ApplicantRegister';
import ApplicantLogin from './ApplicantLogin';

// A simple landing page component
function LandingPage() {
    return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
            <h1>Welcome to the WEBEL Internship Portal</h1>
            <p>Find exciting internship opportunities and kickstart your career.</p>
            <div>
                <Link to="/login"><button style={{ padding: '10px 20px', marginRight: '10px' }}>Login</button></Link>
                <Link to="/register"><button style={{ padding: '10px 20px' }}>Register</button></Link>
            </div>
        </div>
    );
}

function PublicRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<ApplicantRegister />} />
        <Route path="/login" element={<ApplicantLogin />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default PublicRoutes;
