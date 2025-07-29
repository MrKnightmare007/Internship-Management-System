import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './AdminManageCoordinators.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

// Sub-component for creating/viewing masters for the selected org
const OrgAdminsManager = ({ orgId, orgName, onAdminCreated }) => {
    const [admins, setAdmins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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

    const handleCreateAdmin = () => {
        setError('');
        setMessage('');
        api.post('/organization-admins/create', { username: newAdminUsername, email: newAdminEmail, orgId })
            .then(res => {
                setMessage(res.data.message);
                setNewAdminUsername('');
                setNewAdminEmail('');
                onAdminCreated(); // Callback to refresh the list
            })
            .catch(err => setError(err.response?.data?.message || "Creation failed"));
    };

    return (
        <Card>
            <h3 className={styles.cardTitle}>Organization Masters for: {orgName}</h3>
            {isLoading ? <Loader /> : (
                <div className={styles.adminList}>
                    <h4>Current Masters:</h4>
                    {admins.length > 0 ? (
                        <ul>{admins.map(admin => <li key={admin.userId}>{admin.username} ({admin.userEmail})</li>)}</ul>
                    ) : <p>No masters found for this organization.</p>}
                </div>
            )}
            <div className={styles.createAdminForm}>
                <h4>Create New Master:</h4>
                <input type="text" placeholder="Username" value={newAdminUsername} onChange={e => setNewAdminUsername(e.target.value)} />
                <input type="email" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} />
                <Button onClick={handleCreateAdmin}>Create Master</Button>
                {error && <p className={styles.errorText}>{error}</p>}
                {message && <p className={styles.successText}>{message}</p>}
            </div>
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
            <h3 className={styles.cardTitle}>Send Notification to: {orgName}</h3>
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