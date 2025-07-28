import React, { useState, useEffect } from 'react';
import api from '../api';

// Component for managing organization masters (admins)
function OrgAdminsManager({ orgId, orgName, orgAdmins }) {
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
                // Simple page reload to refresh all data
                window.location.reload(); 
            })
            .catch(err => setError(err.response?.data?.message || "Creation failed"));
    };

    return (
        <div style={{ marginTop: '20px', borderTop: '2.5px solid #000', paddingTop: '15px' }}>
            <h3>Manage Masters for: {orgName}</h3>
            <div>
                <h4>Current Masters:</h4>
                {orgAdmins.length > 0 ? (
                    <ul>
                        {orgAdmins.map(admin => <li key={admin.userId}>{admin.username} ({admin.userEmail})</li>)}
                    </ul>
                ) : <p>No masters found for this organization.</p>}
            </div>
            <div style={{ marginTop: '15px' }}>
                <h4>Create New Master:</h4>
                <input type="text" placeholder="Username" value={newAdminUsername} onChange={e => setNewAdminUsername(e.target.value)} />
                <input type="email" placeholder="Email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} style={{ marginLeft: '10px' }} />
                <button onClick={handleCreateAdmin} style={{ marginLeft: '10px' }}>Create</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
            </div>
        </div>
    );
}

// Component for the detailed notification form
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
        if (file) {
            formData.append('file', file);
        }

        setStatus('Sending...');
        api.post('/notifications/send', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
        .then(res => {
            setStatus(`Success: ${res.data}`);
            setTitle('');
            setMessage('');
            setFile(null);
            document.getElementById('file-input').value = null;
        })
        .catch(err => {
            const errorMsg = err.response?.data?.message || err.response?.data || 'Failed to send notification.';
            setStatus(`Error: ${errorMsg}`);
        });
    };

    return (
        <div style={{ marginBottom: '20px', borderTop: '2.5px solid #000', paddingTop: '15px' }}>
            <h3>Send Notification to Organization Master</h3>
            <select value={selectedAdminId} onChange={e => setSelectedAdminId(e.target.value)} style={{ padding: '8px', minWidth: '200px' }}>
                {orgAdmins.length > 0 ? orgAdmins.map(admin => (
                    <option key={admin.userId} value={admin.userId}>{admin.username}</option>
                )) : <option value="">No masters available</option>}
            </select>
            <br/>
            <input type="text" placeholder="Notification Title" value={title} onChange={e => setTitle(e.target.value)} style={{ marginTop: '10px', width: '400px', padding: '8px' }} />
            <br/>
            <textarea
                placeholder="Enter notification message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '400px', height: '100px', marginTop: '10px', padding: '8px' }}
            />
            <br/>
            <input id="file-input" type="file" onChange={e => setFile(e.target.files[0])} style={{ marginTop: '10px' }} />
            <br/>
            <button onClick={handleSend} style={{ marginTop: '10px', padding: '10px 15px' }}>Send Notification</button>
            {status && <p>{status}</p>}
        </div>
    );
}

// Main Dashboard Page Component
function AdminDashboardPage() {
    const [organizations, setOrganizations] = useState([]);
    const [filteredOrgs, setFilteredOrgs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOrg, setNewOrg] = useState({ orgName: '', orgAddress: '', orgContactEmail: '', orgContactPhone: '', orgWebsite: '', orgStatus: 'ACTIVE' });
    const [showForm, setShowForm] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [programs, setPrograms] = useState([]);
    const [orgAdmins, setOrgAdmins] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [editOrg, setEditOrg] = useState({ orgName: '', orgAddress: '', orgContactEmail: '', orgContactPhone: '', orgWebsite: '', orgStatus: 'ACTIVE' });

    useEffect(() => {
        api.get('/organizations').then(response => {
            const sortedData = response.data.sort((a, b) => a.orgId - b.orgId);
            setOrganizations(sortedData);
            setFilteredOrgs(sortedData);
        }).catch(error => console.error('Error fetching organizations:', error));
    }, []);

    const selectOrgForManagement = (org) => {
        setSelectedOrg(org);
        api.get(`/programs/by-org/${org.orgId}`).then(response => {
            setPrograms(response.data.sort((a, b) => a.intProgId - b.intProgId));
        }).catch(error => console.error('Error fetching programs:', error));

        api.get(`/organization-admins/by-org/${org.orgId}`).then(response => {
            setOrgAdmins(response.data);
        }).catch(error => console.error('Error fetching org admins:', error));
    };

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
        api.post('/organizations', newOrg)
            .then(response => {
                const updatedOrganizations = [...organizations, response.data].sort((a, b) => a.orgId - b.orgId);
                setOrganizations(updatedOrganizations);
                const filtered = updatedOrganizations.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase()));
                setFilteredOrgs(filtered);
                setNewOrg({ orgName: '', orgAddress: '', orgContactEmail: '', orgContactPhone: '', orgWebsite: '', orgStatus: 'ACTIVE' });
                setShowForm(false);
            })
            .catch(error => console.error('Error adding organization:', error));
    };

    const openEditForm = (org) => {
        setEditingId(org.orgId);
        setEditOrg({
            orgName: org.orgName || '',
            orgAddress: org.orgAddress || '',
            orgContactEmail: org.orgContactEmail || '',
            orgContactPhone: org.orgContactPhone || '',
            orgWebsite: org.orgWebsite || '',
            orgStatus: org.orgStatus || 'ACTIVE'
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditOrg({ ...editOrg, [name]: value });
    };

    const handleUpdateOrg = (id) => {
        api.patch(`/organizations/${id}`, editOrg)
            .then(response => {
                const updatedOrgs = organizations.map(org => org.orgId === id ? response.data : org);
                setOrganizations(updatedOrgs);
                setFilteredOrgs(updatedOrgs.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase())));
                setEditingId(null);
            })
            .catch(error => console.error('Error updating organization:', error));
    };

    const handleDeleteOrg = (id) => {
        if (window.confirm('Are you sure you want to delete this organization?')) {
            api.delete(`/organizations/${id}`)
                .then(() => {
                    const updatedOrgs = organizations.filter(org => org.orgId !== id);
                    setOrganizations(updatedOrgs);
                    setFilteredOrgs(updatedOrgs.filter(org => org.orgName.toLowerCase().includes(searchTerm.toLowerCase())));
                    if (selectedOrg?.orgId === id) {
                        setSelectedOrg(null);
                        setPrograms([]);
                    }
                })
                .catch(error => console.error('Error deleting organization:', error));
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Super Admin Dashboard - Organizations</h1>
            <button onClick={() => { localStorage.clear(); window.location.href = '/admin-login'; }}>Logout</button>
            <input
                type="text"
                placeholder="Search by organization name"
                value={searchTerm}
                onChange={handleSearch}
                style={{ margin: '20px 0', padding: '8px', width: '300px' }}
            />
            <button onClick={() => setShowForm(!showForm)} style={{ marginLeft: '10px', padding: '8px 16px' }}>
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
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input name="orgName" value={editOrg.orgName} onChange={handleEditInputChange} /></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input name="orgAddress" value={editOrg.orgAddress} onChange={handleEditInputChange} /></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input name="orgContactEmail" value={editOrg.orgContactEmail} onChange={handleEditInputChange} /></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input name="orgContactPhone" value={editOrg.orgContactPhone} onChange={handleEditInputChange} /></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><input name="orgWebsite" value={editOrg.orgWebsite} onChange={handleEditInputChange} /></td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <select name="orgStatus" value={editOrg.orgStatus} onChange={handleEditInputChange}>
                                        <option value="ACTIVE">ACTIVE</option>
                                        <option value="INACTIVE">INACTIVE</option>
                                    </select>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(org.createdAt).toLocaleString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(org.updatedAt).toLocaleString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => handleUpdateOrg(org.orgId)} style={{ marginRight: '5px' }}>Save</button>
                                    <button onClick={cancelEdit}>Cancel</button>
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
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(org.createdAt).toLocaleString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(org.updatedAt).toLocaleString()}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    <button onClick={() => openEditForm(org)} style={{ marginRight: '5px' }}>Edit</button>
                                    <button onClick={() => handleDeleteOrg(org.orgId)} style={{ marginRight: '5px' }}>Delete</button>
                                    <button onClick={() => selectOrgForManagement(org)}>Manage</button>
                                </td>
                            </tr>
                        )
                    ))}
                </tbody>
            </table>

            {selectedOrg && (
                <div style={{ marginTop: '30px', border: '1px solid #eee', padding: '15px' }}>
                    <h2>Managing: {selectedOrg.orgName}</h2>
                    <div style={{ marginBottom: '20px' }}>
                        <h3>Internship Programs</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    </div>
                    
                    <SendNotificationManager orgId={selectedOrg.orgId} orgAdmins={orgAdmins} />
                    <OrgAdminsManager orgId={selectedOrg.orgId} orgName={selectedOrg.orgName} orgAdmins={orgAdmins} />
                </div>
            )}
        </div>
    );
}

export default AdminDashboardPage;
