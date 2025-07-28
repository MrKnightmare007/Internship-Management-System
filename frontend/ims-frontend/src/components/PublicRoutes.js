import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PublicLandingPage from './PublicLandingPage';

function PublicRoutes() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        {/* Add other public-facing routes here in the future, like /about, /contact, etc. */}
        <Route path="*" element={<PublicLandingPage />} />
      </Routes>
    </Router>
  );
}

export default PublicRoutes;
