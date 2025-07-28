import React from 'react';

function PublicLandingPage() {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Welcome to the WEBEL Internship Management System</h1>
      <p>This is the main landing page for applicants and public viewers.</p>
      <p>Please visit <a href="http://admin.localhost:3000/admin-login">admin.localhost:3000</a> to log in as a Super Admin.</p>
    </div>
  );
}

export default PublicLandingPage;
