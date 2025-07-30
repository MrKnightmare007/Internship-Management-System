import React, { useState, useEffect } from 'react';
import api from '../api';

// Import new UI components
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Card from './ui/Card';
import styles from './AdminDashboard.module.css'; // New CSS module for the dashboard

// The logic inside the components is preserved from your original file.
// Only the JSX and structure have been updated for the new UI/UX.

function OrgAdminsManager({ orgId, orgName, orgAdmins, onAdminCreated }) {
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateAdmin = () => {
    setError('');
    setMessage('');
    api.post('/organization-admins/create', { username: newAdminUsername, email: newAdminEmail, orgId })
      .then(res => {
        setMessage(res.data.message);
        setNewAdminUsername('');
        setNewAdminEmail('');
        onAdminCreated(); // Callback to refresh the list in the parent
      })
      .catch(err => setError(err.response?.data?.message || "Creation failed"));
  };

  return (
    <Card className={styles.managementCard}>
      <h3 className={styles.cardTitle}>Manage Masters for: {orgName}</h3>
      <div className={styles.adminList}>
        <h4>Current Masters:</h4>
        {orgAdmins.length > 0 ? (
          <ul>
            {orgAdmins.map(admin => <li key={admin.userId}>{admin.username} ({admin.userEmail})</li>)}
          </ul>
        ) : <p>No masters found for this organization.</p>}
      </div>
      <div className={styles.createAdminForm}>
        <h4>Create New Master:</h4>
        <input type="text" placeholder="Username" value={newAdminUsername} onChange={e => setNewAdminUsername(e.target.value)} />
        <input type="email" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
        <Button onClick={handleCreateAdmin}>Create</Button>
        {error && <p className={styles.errorText}>{error}</p>}
        {message && <p className={styles.successText}>{message}</p>}
      </div>
    </Card>
  );
}

function SendNotificationManager({ orgId, orgAdmins }) {
  const [selectedAdminId, setSelectedAdminId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (orgAdmins && orgAdmins.length > 0) {
      setSelectedAdminId(orgAdmins[0].userId);
    } else {
      setSelectedAdminId('');
    }
  }, [orgAdmins]);

  const handleSend = () => {
    if (!selectedAdminId || !title || !message) {
      setStatus('Error: Please select a recipient and fill in the title and message.');
      return;
    }
    const formData = new FormData();
    formData.append('recipientId', selectedAdminId);
    formData.append('title', title);
    formData.append('message', message);
    if (file) formData.append('file', file);

    setStatus('Sending...');
    api.post('/notifications/send', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        setStatus(`Success: ${res.data}`);
        setTitle('');
        setMessage('');
        setFile(null);
        if (document.getElementById('file-input')) document.getElementById('file-input').value = null;
      })
      .catch(err => {
        const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to send notification.';
        setStatus(`Error: ${errorMsg}`);
      });
  };

  return (
    <Card className={styles.managementCard}>
      <h3 className={styles.cardTitle}>Send Notification</h3>
      <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)}>
        {orgAdmins.length > 0 ? orgAdmins.map(admin => (
          <option key={admin.userId} value={admin.userId}>{admin.username}</option>
        )) : <option value="">No masters available</option>}
      </select>
      <input type="text" placeholder="Notification Title" value={title} onChange={e => setTitle(e.target.value)} />
      <textarea placeholder="Enter notification message..." value={message} onChange={(e) => setMessage(e.target.value)} />
      <input id="file-input" type="file" onChange={e => setFile(e.target.files[0])} />
      <Button onClick={handleSend}>Send Notification</Button>
      {status && <p className={status.startsWith('Error') ? styles.errorText : styles.successText}>{status}</p>}
    </Card>
  );
}

// Main Dashboard Page Component
function AdminDashboardPage() {
  // All state management and logic from your original file is preserved here
  const [organizations, setOrganizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [orgAdmins, setOrgAdmins] = useState([]);

  // State for Modals/Dialogs
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState(null);
  const [editingOrg, setEditingOrg] = useState(null);

  const initialOrgState = { orgName: '', orgAddress: '', orgContactEmail: '', orgContactPhone: '', orgWebsite: '', orgStatus: 'ACTIVE' };
  const [formOrg, setFormOrg] = useState(initialOrgState);

  const fetchOrgs = () => {
    setIsLoading(true);
    api.get('/organizations').then(response => {
      setOrganizations(response.data.sort((a, b) => a.orgId - b.orgId));
      setIsLoading(false);
    }).catch(error => {
      console.error('Error fetching organizations:', error);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchOrgs();
  }, []);
  
  const filteredOrgs = organizations.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelectOrgForManagement = (org) => {
    if (selectedOrg?.orgId === org.orgId) {
      setSelectedOrg(null); // Toggle off if already selected
    } else {
      setSelectedOrg(org);
      api.get(`/programs/by-org/${org.orgId}`).then(res => setPrograms(res.data)).catch(err => console.error(err));
      api.get(`/organization-admins/by-org/${org.orgId}`).then(res => setOrgAdmins(res.data)).catch(err => console.error(err));
    }
  };
  
  const refreshOrgAdmins = () => {
      if (selectedOrg) {
          api.get(`/organization-admins/by-org/${selectedOrg.orgId}`)
             .then(res => setOrgAdmins(res.data))
             .catch(err => console.error(err));
      }
  };

  const openAddForm = () => {
    setEditingOrg(null);
    setFormOrg(initialOrgState);
    setIsFormOpen(true);
  };

  const openEditForm = (org) => {
    setEditingOrg(org);
    setFormOrg(org);
    setIsFormOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormOrg({ ...formOrg, [name]: value });
  };
  
  const handleFormSubmit = () => {
    const apiCall = editingOrg
      ? api.patch(`/organizations/${editingOrg.orgId}`, formOrg)
      : api.post('/organizations', formOrg);

    apiCall.then(() => {
      fetchOrgs();
      setIsFormOpen(false);
    }).catch(error => console.error('Error saving organization:', error));
  };

  const openDeleteDialog = (org) => {
    setOrgToDelete(org);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!orgToDelete) return;
    api.delete(`/organizations/${orgToDelete.orgId}`).then(() => {
      fetchOrgs();
      if (selectedOrg?.orgId === orgToDelete.orgId) setSelectedOrg(null);
      setIsDeleteDialogOpen(false);
      setOrgToDelete(null);
    }).catch(error => console.error('Error deleting organization:', error));
  };

  return (
    <div className={styles.page}>
      <Navbar title="Super Admin Dashboard" logoutPath="/admin-login" />
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1>Organization Management</h1>
          <Button onClick={openAddForm} variant="primary">Add New Organization</Button>
        </header>
        <Card>
            <input
              type="text"
              placeholder="Search by organization name..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
        </Card>

        {isLoading ? <Loader /> : (
          <div className={styles.tableContainer}>
            <table className={styles.orgTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map(org => (
                  <React.Fragment key={org.orgId}>
                    <tr className={selectedOrg?.orgId === org.orgId ? styles.selectedRow : ''}>
                      <td>{org.orgId}</td>
                      <td>{org.orgName}</td>
                      <td>{org.orgContactEmail}</td>
                      <td><span className={`${styles.status} ${styles[org.orgStatus?.toLowerCase()]}`}>{org.orgStatus}</span></td>
                      <td className={styles.actionsCell}>
                        <Button onClick={() => openEditForm(org)}>Edit</Button>
                        <Button onClick={() => openDeleteDialog(org)} variant="danger">Delete</Button>
                        <Button onClick={() => handleSelectOrgForManagement(org)} variant="secondary">
                            {selectedOrg?.orgId === org.orgId ? 'Hide' : 'Manage'}
                        </Button>
                      </td>
                    </tr>
                    {selectedOrg?.orgId === org.orgId && (
                      <tr className={styles.managementRow}>
                        <td colSpan="5">
                           <div className={styles.managementContainer}>
                                <OrgAdminsManager orgId={selectedOrg.orgId} orgName={selectedOrg.orgName} orgAdmins={orgAdmins} onAdminCreated={refreshOrgAdmins} />
                                <SendNotificationManager orgId={selectedOrg.orgId} orgAdmins={orgAdmins} />
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Add/Edit Form Dialog */}
      <Dialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingOrg ? 'Edit Organization' : 'Add New Organization'}
        onConfirm={handleFormSubmit}
      >
        <div className={styles.formGrid}>
            <input name="orgName" placeholder="Name" value={formOrg.orgName} onChange={handleFormChange} />
            <input name="orgAddress" placeholder="Address" value={formOrg.orgAddress} onChange={handleFormChange} />
            <input name="orgContactEmail" placeholder="Contact Email" value={formOrg.orgContactEmail} onChange={handleFormChange} />
            <input name="orgContactPhone" placeholder="Contact Phone" value={formOrg.orgContactPhone} onChange={handleFormChange} />
            <input name="orgWebsite" placeholder="Website" value={formOrg.orgWebsite} onChange={handleFormChange} />
            <select name="orgStatus" value={formOrg.orgStatus} onChange={handleFormChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
            </select>
        </div>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete the organization "{orgToDelete?.orgName}"? This action cannot be undone.</p>
      </Dialog>
      
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;