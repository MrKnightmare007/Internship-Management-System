import React, { useState, useEffect } from 'react';
import api from '../api';

function OrganizationDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // This function runs automatically when the dashboard loads
    api.get('/notifications/my-notifications')
      .then(response => {
        // **FIXED**: Add a check to ensure the response data is an array.
        if (Array.isArray(response.data)) {
          setNotifications(response.data);
        } else {
          // If the data is not an array, it's an unexpected response.
          // Log it and set an error message for the user.
          console.error("Expected an array of notifications, but received:", response.data);
          setError('Failed to load notifications due to an invalid server response.');
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch notifications:", err);
        setError('Could not load notifications. Please try again later.');
        setIsLoading(false);
      });
  }, []); // The empty array [] means this effect runs only once on mount

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
        <h1>Organization Master Dashboard</h1>
        <button 
          onClick={() => { localStorage.clear(); window.location.href = '/org-login'; }}
          style={{ padding: '8px 15px', border: 'none', borderRadius: '5px', backgroundColor: '#d9534f', color: 'white', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      <p style={{ marginTop: '20px' }}>Welcome! You can manage your internship programs and view notifications from here.</p>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Your Notifications</h2>
        {isLoading && <p>Loading notifications...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!isLoading && !error && notifications.length === 0 && (
          <div style={{ padding: '20px', backgroundColor: '#f9f9f9', border: '1px solid #ddd', borderRadius: '5px', textAlign: 'center' }}>
            <p>You have no new notifications.</p>
          </div>
        )}
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {notifications.map(notif => (
            <div key={notif.notificationId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px', backgroundColor: notif.status === 'UNREAD' ? '#f0f8ff' : '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, color: '#333' }}>{notif.title}</h3>
                <span style={{ fontSize: '0.9em', color: '#666' }}>
                  {new Date(notif.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ color: '#555', whiteSpace: 'pre-wrap' }}>{notif.message}</p>
              {notif.attachmentPath && (
                <a 
                  href={`http://localhost:8080/uploads/${notif.attachmentPath.split(/[\\/]/).pop()}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none' }}
                >
                  View Attachment
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrganizationDashboard;
