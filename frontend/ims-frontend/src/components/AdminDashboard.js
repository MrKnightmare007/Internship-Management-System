import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboardPage() {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrgs, setFilteredOrgs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newOrg, setNewOrg] = useState({
    orgName: '',
    orgAddress: '',
    orgContactEmail: '',
    orgContactPhone: '',
    orgWebsite: '',
    orgStatus: 'ACTIVE'
  });
  const [showForm, setShowForm] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editOrg, setEditOrg] = useState({
    orgName: '',
    orgAddress: '',
    orgContactEmail: '',
    orgContactPhone: '',
    orgWebsite: '',
    orgStatus: 'ACTIVE'
  });

  useEffect(() => {
    axios.get('/api/organizations')
      .then(response => {
        setOrganizations(response.data);
        setFilteredOrgs(response.data);
      })
      .catch(error => console.error('Error fetching organizations:', error));
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = organizations.filter(org => org.orgName.toLowerCase().includes(term));
    setFilteredOrgs(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrg({ ...newOrg, [name]: value });
  };

  const handleAddOrg = () => {
    axios.post('/api/organizations', newOrg)
      .then(response => {
        setOrganizations([...organizations, response.data]);
        setFilteredOrgs([...filteredOrgs, response.data]);
        setNewOrg({
          orgName: '',
          orgAddress: '',
          orgContactEmail: '',
          orgContactPhone: '',
          orgWebsite: '',
          orgStatus: 'ACTIVE'
        });
        setShowForm(false);
      })
      .catch(error => console.error('Error adding organization:', error));
  };

  const selectOrg = (orgId) => {
    setSelectedOrgId(orgId);
    axios.get(`/api/programs/by-org/${orgId}`)
      .then(response => setPrograms(response.data))
      .catch(error => console.error('Error fetching programs:', error));
  };

  const handleSendNotification = (orgId) => {
    axios.post('/api/notifications', { orgId, message: notificationMessage })
      .then(response => {
        alert('Notification sent successfully');
        setNotificationMessage('');
      })
      .catch(error => console.error('Error sending notification:', error));
  };

  // Edit handlers
  const openEditForm = (org) => {
    setEditingId(org.orgId);
    setEditOrg({
      orgName: org.orgName,
      orgAddress: org.orgAddress,
      orgContactEmail: org.orgContactEmail,
      orgContactPhone: org.orgContactPhone,
      orgWebsite: org.orgWebsite,
      orgStatus: org.orgStatus
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditOrg({ ...editOrg, [name]: value });
  };

  const handleUpdateOrg = (id) => {
    axios.patch(`/api/organizations/${id}`, editOrg)
      .then(response => {
        const updatedOrgs = organizations.map(org => 
          org.orgId === id ? response.data : org
        );
        setOrganizations(updatedOrgs);
        setFilteredOrgs(updatedOrgs.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase())));
        setEditingId(null);
      })
      .catch(error => console.error('Error updating organization:', error));
  };

  // Delete handler
  const handleDeleteOrg = (id) => {
    if (window.confirm('Are you sure you want to delete this organization?')) {
      axios.delete(`/api/organizations/${id}`)
        .then(() => {
          const updatedOrgs = organizations.filter(org => org.orgId !== id);
          setOrganizations(updatedOrgs);
          setFilteredOrgs(updatedOrgs.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase())));
          if (selectedOrgId === id) {
            setSelectedOrgId(null);
            setPrograms([]);
          }
        })
        .catch(error => console.error('Error deleting organization:', error));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Super Admin Dashboard - Organizations</h1>
      
      <input
        type="text"
        placeholder="Search by organization name"
        value={searchTerm}
        onChange={handleSearch}
        style={{ marginBottom: '20px', padding: '8px', width: '300px' }}
      />
      
      <button onClick={() => setShowForm(!showForm)} style={{ marginBottom: '20px', padding: '8px 16px' }}>
        {showForm ? 'Cancel' : 'Add New Organization'}
      </button>
      
      {showForm && (
        <div style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
          <input name="orgName" placeholder="Name" value={newOrg.orgName} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }} />
          <input name="orgAddress" placeholder="Address" value={newOrg.orgAddress} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }} />
          <input name="orgContactEmail" placeholder="Contact Email" value={newOrg.orgContactEmail} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }} />
          <input name="orgContactPhone" placeholder="Contact Phone" value={newOrg.orgContactPhone} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }} />
          <input name="orgWebsite" placeholder="Website" value={newOrg.orgWebsite} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }} />
          <select name="orgStatus" value={newOrg.orgStatus} onChange={handleInputChange} style={{ display: 'block', margin: '5px 0' }}>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
          <button onClick={handleAddOrg} style={{ padding: '8px 16px' }}>Save Organization</button>
        </div>
      )}
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Address</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Phone</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Website</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Created At</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Updated At</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrgs.map(org => (
            editingId === org.orgId ? (
              <tr key={org.orgId}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgId}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input name="orgName" value={editOrg.orgName} onChange={handleEditInputChange} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input name="orgAddress" value={editOrg.orgAddress} onChange={handleEditInputChange} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input name="orgContactEmail" value={editOrg.orgContactEmail} onChange={handleEditInputChange} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input name="orgContactPhone" value={editOrg.orgContactPhone} onChange={handleEditInputChange} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input name="orgWebsite" value={editOrg.orgWebsite} onChange={handleEditInputChange} />
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <select name="orgStatus" value={editOrg.orgStatus} onChange={handleEditInputChange}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.createdAt}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.updatedAt}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => handleUpdateOrg(org.orgId)} style={{ marginRight: '5px' }}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </td>
              </tr>
            ) : (
              <tr key={org.orgId}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgId}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgAddress}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgContactEmail}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgContactPhone}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgWebsite}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.orgStatus}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.createdAt}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{org.updatedAt}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <button onClick={() => openEditForm(org)} style={{ marginRight: '5px' }}>Edit</button>
                  <button onClick={() => handleDeleteOrg(org.orgId)} style={{ marginRight: '5px' }}>Delete</button>
                  <button onClick={() => selectOrg(org.orgId)}>View Programs</button>
                </td>
              </tr>
            )
          ))}
        </tbody>
      </table>

      {/* Section for selected org's programs and notification */}
      {selectedOrgId && (
        <div style={{ marginTop: '30px' }}>
          <h2>Internship Programs for Org ID {selectedOrgId}</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Program ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(program => (
                <tr key={program.intProgId}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{program.intProgId}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{program.intProgName}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{program.progStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Send Notification to Organization Master</h3>
          <textarea
            placeholder="Enter notification message (e.g., 'Create new program and upload documents')"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            style={{ width: '400px', height: '100px', marginBottom: '10px' }}
          />
          <button onClick={() => handleSendNotification(selectedOrgId)} style={{ padding: '8px 16px' }}>Send Notification</button>
        </div>
      )}
    </div>
  );
}

export default AdminDashboardPage;
