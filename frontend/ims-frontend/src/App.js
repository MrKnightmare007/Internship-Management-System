import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AdminDashboardPage from './components/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        {/* Add other routes later */}
      </Routes>
    </Router>
  );
}

export default App;
