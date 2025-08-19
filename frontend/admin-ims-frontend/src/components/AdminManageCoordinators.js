import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './AdminManageCoordinators.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

// Simple Toaster Component
const Toaster = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`${styles.toaster} ${styles[type]}`}>
            <span>{message}</span>
            <button onClick={onClose} className={styles.toasterClose}>×</button>
        </div>
    );
};

// Sub-component for creating/viewing masters for the selected org
const OrgAdminsManager = ({ orgId, orgName, onAdminCreated }) => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [internshipName, setInternshipName] = useState('');
    const [advertisementDocument, setAdvertisementDocument] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [toaster, setToaster] = useState(null);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

    const fetchAdmins = () => {
        if (orgId) {
            setIsLoading(true);
            api.get(`/organization-admins/by-org/${orgId}`)
                .then(res => setAdmins(res.data))
                .catch(err => console.error("Failed to fetch admins"))
                .finally(() => setIsLoading(false));
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [orgId]);

    const resetForm = () => {
        setNewAdminUsername('');
        setNewAdminEmail('');
        setInternshipName('');
        setAdvertisementDocument(null);
        setEditingAdmin(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
    };

    const handleCreateAdmin = () => {
        setError('');
        setMessage('');

        if (!newAdminUsername || !newAdminEmail || !internshipName) {
            setError('Please fill in all required fields');
            return;
        }

        setIsCreating(true);
        const formData = new FormData();
        formData.append('username', newAdminUsername);
        formData.append('email', newAdminEmail);
        formData.append('orgId', orgId);
        formData.append('internshipName', internshipName);
        formData.append('orgName', orgName);

        if (advertisementDocument) {
            formData.append('advertisementDocument', advertisementDocument);
        }

        api.post('/organization-admins/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
            .then(res => {
                setToaster({
                    message: 'Coordinator created successfully! Welcome email sent.',
                    type: 'success'
                });
                resetForm();
                fetchAdmins(); // Refresh the list
            })
            .catch(err => {
                setError(err.response?.data?.message || "Creation failed");
                setToaster({
                    message: 'Failed to create coordinator. Please try again.',
                    type: 'error'
                });
            })
            .finally(() => {
                setIsCreating(false);
            });
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setNewAdminUsername(admin.username);
        setNewAdminEmail(admin.userEmail);
        setInternshipName(''); // This would need to be stored if we want to edit it
    };

    const handleUpdateAdmin = () => {
        setError('');
        setMessage('');

        if (!newAdminUsername || !newAdminEmail) {
            setError('Please fill in all required fields');
            return;
        }

        setIsCreating(true);
        const updateData = {
            userId: editingAdmin.userId,
            username: newAdminUsername,
            email: newAdminEmail,
            orgName: orgName
        };

        api.put('/organization-admins/update', updateData)
            .then(res => {
                setToaster({
                    message: 'Coordinator updated successfully! Notification email sent.',
                    type: 'success'
                });
                resetForm();
                fetchAdmins();
            })
            .catch(err => {
                setError(err.response?.data?.message || "Update failed");
                setToaster({
                    message: 'Failed to update coordinator. Please try again.',
                    type: 'error'
                });
            })
            .finally(() => {
                setIsCreating(false);
            });
    };

    const handleDeleteAdmin = (admin) => {
        if (window.confirm(`Are you sure you want to delete coordinator "${admin.username}"? This action cannot be undone.`)) {
            api.delete(`/organization-admins/delete/${admin.userId}`, {
                data: { orgName: orgName }
            })
                .then(res => {
                    setToaster({
                        message: 'Coordinator deleted successfully! Notification email sent.',
                        type: 'success'
                    });
                    fetchAdmins();
                })
                .catch(err => {
                    setToaster({
                        message: 'Failed to delete coordinator. Please try again.',
                        type: 'error'
                    });
                });
        }
    };

    return (
        <Card>
            <h3 className={styles.cardTitle}>Organization Masters for: {orgName}</h3>
            {isLoading ? <Loader /> : (
                <div className={styles.adminList}>
                    <h4>Current Coordinators:</h4>
                    {admins.length > 0 ? (
                        <div className={styles.adminTable}>
                            {admins.map(admin => (
                                <div key={admin.userId} className={styles.adminRow}>
                                    <div className={styles.adminInfo}>
                                        <strong>{admin.username}</strong>
                                        <span>{admin.userEmail}</span>
                                    </div>
                                    <div className={styles.adminActions}>
                                        <button
                                            onClick={() => handleEditAdmin(admin)}
                                            className={styles.editBtn}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin)}
                                            className={styles.deleteBtn}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : <p>No coordinators found for this organization.</p>}
                </div>
            )}
            <div className={styles.createAdminForm}>
                <h4>{editingAdmin ? 'Edit Coordinator:' : 'Create New Coordinator:'}</h4>
                <div className={styles.formGrid}>
                    <input
                        type="text"
                        placeholder="Username *"
                        value={newAdminUsername}
                        onChange={e => setNewAdminUsername(e.target.value)}
                        required
                    />
                    <input
                        type="email"
                        placeholder="Email *"
                        value={newAdminEmail}
                        onChange={e => setNewAdminEmail(e.target.value)}
                        required
                    />
                    {!editingAdmin && (
                        <>
                            <input
                                type="text"
                                placeholder="Internship Name *"
                                value={internshipName}
                                onChange={e => setInternshipName(e.target.value)}
                                required
                            />
                            <div className={styles.fileInputGroup}>
                                <label htmlFor="advertisementDoc">Advertisement Document (Optional):</label>
                                <input
                                    id="advertisementDoc"
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={e => setAdvertisementDocument(e.target.files[0])}
                                />
                            </div>
                        </>
                    )}
                </div>
                <div className={styles.formActions}>
                    <Button
                        onClick={editingAdmin ? handleUpdateAdmin : handleCreateAdmin}
                        className={styles.createBtn}
                        disabled={isCreating}
                    >
                        {isCreating ? 'Processing...' : (editingAdmin ? 'Update Coordinator' : 'Create Coordinator')}
                    </Button>
                    {editingAdmin && (
                        <Button
                            onClick={resetForm}
                            className={styles.cancelBtn}
                        >
                            Cancel
                        </Button>
                    )}
                </div>
                {error && <p className={styles.errorText}>{error}</p>}
                {message && <p className={styles.successText}>{message}</p>}
            </div>

            {toaster && (
                <Toaster
                    message={toaster.message}
                    type={toaster.type}
                    onClose={() => setToaster(null)}
                />
            )}
        </Card>
    );
};

// Sub-component for sending notifications
const SendNotificationManager = ({ orgId, orgName }) => {
    const [admins, setAdmins] = useState([]);
    const [selectedAdminId, setSelectedAdminId] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (orgId) {
            api.get(`/organization-admins/by-org/${orgId}`).then(res => {
                setAdmins(res.data);
                if (res.data.length > 0) {
                    setSelectedAdminId(res.data[0].userId);
                }
            });
        }
    }, [orgId]);

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
            })
            .catch(err => setStatus(`Error: Failed to send notification.`));
    };

    return (
        <Card>
            <h3 className={styles.cardTitle}>Send Notification to Coordinator</h3>
            <div className={styles.notificationForm}>
                <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)}>
                    {admins.length > 0 ? admins.map(admin => (
                        <option key={admin.userId} value={admin.userId}>{admin.username}</option>
                    )) : <option value="">No masters available</option>}
                </select>
                <input type="text" placeholder="Notification Title" value={title} onChange={e => setTitle(e.target.value)} />
                <textarea placeholder="Enter notification message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <input type="file" onChange={e => setFile(e.target.files[0])} />
                <Button onClick={handleSend}>Send Notification</Button>
                {status && <p className={status.startsWith('Error') ? styles.errorText : styles.successText}>{status}</p>}
            </div>
        </Card>
    );
};

// Main Page Component
const AdminManageCoordinators = () => {
    const [organizations, setOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [error, setError] = useState('');

    const fetchOrgs = () => {
        setIsLoading(true);
        api.get('/organizations')
            .then(res => setOrganizations(res.data.sort((a, b) => a.orgId - b.orgId)))
            .catch(err => setError('Could not fetch organizations.'))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchOrgs(); }, []);

    const handleSelectOrg = (org) => {
        if (selectedOrg?.orgId === org.orgId) {
            setSelectedOrg(null); // Toggle off if clicking the same one
        } else {
            setSelectedOrg(org);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <h1 className={styles.pageTitle}>Manage Organization Masters</h1>
            <p className={styles.instructions}>Select an organization from the list below to manage its masters and send notifications.</p>

            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Organization Name</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.orgId} className={selectedOrg?.orgId === org.orgId ? styles.selectedRow : ''}>
                                    <td>{org.orgId}</td>
                                    <td>{org.orgName}</td>
                                    <td><span className={`${styles.status} ${styles[org.orgStatus?.toLowerCase()]}`}>{org.orgStatus}</span></td>
                                    <td><Button onClick={() => handleSelectOrg(org)}>{selectedOrg?.orgId === org.orgId ? 'Hide' : 'Manage'}</Button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {selectedOrg && (
                <div className={styles.managementSection}>
                    <OrgAdminsManager
                        orgId={selectedOrg.orgId}
                        orgName={selectedOrg.orgName}
                        onAdminCreated={() => handleSelectOrg(selectedOrg)} // Simple refresh by toggling
                    />
                    <SendNotificationManager orgId={selectedOrg.orgId} orgName={selectedOrg.orgName} />
                </div>
            )}
        </div>
    );
};

export default AdminManageCoordinators;