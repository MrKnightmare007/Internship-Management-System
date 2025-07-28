import React from 'react';
import AdminRoutes from './components/AdminRoutes';
import PublicRoutes from './components/PublicRoutes';
import OrganizationRoutes from './components/OrganizationRoutes'; // Import new routes

const getSubdomain = () => {
  const host = window.location.hostname;
  const parts = host.split('.');
  
  if (parts.length >= 2) {
    if (parts[0] === 'admin') return 'admin';
    if (parts[0] === 'organization') return 'organization';
  }
  
  return null;
};

function App() {
  const subdomain = getSubdomain();

  if (subdomain === 'admin') {
    return <AdminRoutes />;
  }

  if (subdomain === 'organization') {
    return <OrganizationRoutes />;
  }
  
  return <PublicRoutes />;
}

export default App;
