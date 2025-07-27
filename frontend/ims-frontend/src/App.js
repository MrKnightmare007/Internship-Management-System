import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import AdminDashboardPage from './components/AdminDashboard';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/admin-login" />;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <PrivateRoute>
            <AdminDashboardPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/admin-login" />} />
      </Routes>
    </Router>
  );
}

export default App;
