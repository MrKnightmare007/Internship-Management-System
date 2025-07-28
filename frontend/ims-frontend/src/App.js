import React from 'react';
import AdminRoutes from './components/AdminRoutes';
import OrganizationRoutes from './components/OrganizationRoutes';
import MainSiteRoutes from './components/MainSiteRoutes'; // The new unified router

// This function checks the URL for a subdomain
const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length >= 2) {
    if (parts[0] === 'admin') return 'admin';
    if (parts[0] === 'organization') return 'organization';
  }
  return null; // This will be the case for 'localhost'
};

function App() {
  const subdomain = getSubdomain();

  // Render the Admin app if on the 'admin' subdomain
  if (subdomain === 'admin') {
    return <AdminRoutes />;
  }

  // Render the Organization app if on the 'organization' subdomain
  if (subdomain === 'organization') {
    return <OrganizationRoutes />;
  }
  
  // For the main domain (e.g., localhost), render the main public/applicant site.
  // This router handles its own public/private logic internally.
  return <MainSiteRoutes />;
}

export default App;
