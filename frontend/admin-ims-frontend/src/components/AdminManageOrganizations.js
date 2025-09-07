import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './AdminManageOrganizations.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Dialog from './ui/Dialog';

const AdminManageOrganizations = () => {
    const [organizations, setOrganizations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for Modals/Dialogs
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [orgToEdit, setOrgToEdit] = useState(null);
    const [orgToDelete, setOrgToDelete] = useState(null);
    
    const initialOrgState = {
        orgName: '',
        orgAbbreviation: '', // New field for organization abbreviation
        orgAddress: '',
        orgContactEmail: '',
        orgContactPhone: '',
        orgWebsite: '',
        orgStatus: 'ACTIVE',
        coordinatorUsername: '',
        coordinatorEmail: '',
        coordinatorPassword: '',
        coordinatorPhone: '',
        coordinatorRole: 'COORDINATOR',
        internshipName: '',
    };
    const [formOrg, setFormOrg] = useState(initialOrgState);
    const [coordinatorFile, setCoordinatorFile] = useState(null);
    const [showCoordinatorSection, setShowCoordinatorSection] = useState(true);

    const fetchOrgs = () => {
        setIsLoading(true);
        api.get('/organizations').then(response => {
            setOrganizations(response.data.sort((a, b) => a.orgId - b.orgId));
        }).catch(error => {
            console.error('Error fetching organizations:', error);
            setError('Could not fetch organizations. Please try again.');
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => { fetchOrgs(); }, []);

    const openAddForm = () => {
        setOrgToEdit(null);
        setFormOrg(initialOrgState);
        setIsFormOpen(true);
    };

    const openEditForm = (org) => {
        setOrgToEdit(org);
        setFormOrg(org);
        setIsFormOpen(true);
    };

    const openDeleteDialog = (org) => {
        setOrgToDelete(org);
        setIsDeleteDialogOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormOrg({ ...formOrg, [name]: value });
    };

    const handleFormSubmit = async () => {
        try {
            // First create or update the organization
            const orgResponse = orgToEdit
                ? await api.patch(`/organizations/${orgToEdit.orgId}`, {
                    orgName: formOrg.orgName,
                    orgAddress: formOrg.orgAddress,
                    orgContactEmail: formOrg.orgContactEmail,
                    orgContactPhone: formOrg.orgContactPhone,
                    orgWebsite: formOrg.orgWebsite,
                    orgStatus: formOrg.orgStatus
                })
                : await api.post('/organizations', {
                    orgName: formOrg.orgName,
                    orgAddress: formOrg.orgAddress,
                    orgContactEmail: formOrg.orgContactEmail,
                    orgContactPhone: formOrg.orgContactPhone,
                    orgWebsite: formOrg.orgWebsite,
                    orgStatus: formOrg.orgStatus,
                    orgAbbreviation: formOrg.orgAbbreviation // Include abbreviation
                });
            
            // If creating a new organization and coordinator section is enabled
            if (!orgToEdit && showCoordinatorSection && formOrg.coordinatorUsername && formOrg.coordinatorEmail && formOrg.coordinatorPassword) {
                const orgId = orgResponse.data.orgId;
                const formData = new FormData();
                // Append organization abbreviation to username
                formData.append('username', `${formOrg.coordinatorUsername}@${formOrg.orgAbbreviation}`);
                formData.append('email', formOrg.coordinatorEmail);
                formData.append('password', formOrg.coordinatorPassword);
                formData.append('phone', formOrg.coordinatorPhone);
                formData.append('role', formOrg.coordinatorRole);
                formData.append('orgId', orgId);
                formData.append('internshipName', formOrg.internshipName);
                formData.append('orgName', formOrg.orgName);
                
                if (coordinatorFile) {
                    formData.append('advertisementDocument', coordinatorFile);
                }
                
                await api.post('/organization-admins/create', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            
            fetchOrgs();
            setIsFormOpen(false);
        } catch (error) {
            console.error('Error saving organization or coordinator:', error);
            alert('An error occurred while saving. Please try again.');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!orgToDelete) return;
        try {
            await api.delete(`/organizations/${orgToDelete.orgId}`);
            fetchOrgs();
            setIsDeleteDialogOpen(false);
            setOrgToDelete(null);
            alert('Organization deleted successfully');
        } catch (error) {
            console.error('Error deleting organization:', error);
            alert('Failed to delete organization. ' + (error.response?.data?.message || ''));
            setIsDeleteDialogOpen(false);
        }
    };

    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Manage Organizations</h1>
                <Button onClick={openAddForm} variant="primary">+ Add Organization</Button>
            </div>
            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr><th>ID</th><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {organizations.map(org => (
                                <tr key={org.orgId}>
                                    <td>{org.orgId}</td>
                                    <td>{org.orgName}</td>
                                    <td>{org.orgContactEmail}</td>
                                    <td><span className={`${styles.status} ${styles[org.orgStatus?.toLowerCase()]}`}>{org.orgStatus}</span></td>
                                    <td className={styles.actionsCell}>
                                        <Button onClick={() => openEditForm(org)} variant="secondary">Edit</Button>
                                        <Button onClick={() => openDeleteDialog(org)} variant="danger">Delete</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* --- THIS IS THE UPDATED DIALOG FOR THE FORM --- */}
            <Dialog
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={orgToEdit ? 'Edit Organization' : 'Add New Organization'}
                onConfirm={handleFormSubmit}
                confirmText="Save" 
                confirmVariant="primary"
            >
                <div className={styles.formSection}>
                    <h3>Organization Details</h3>
                    <div className={styles.formGrid}>
                        <input name="orgName" placeholder="Name *" value={formOrg.orgName} onChange={handleFormChange} required />
                        <input name="orgAddress" placeholder="Address" value={formOrg.orgAddress} onChange={handleFormChange} />
                        <input name="orgContactEmail" placeholder="Contact Email *" value={formOrg.orgContactEmail} onChange={handleFormChange} required />
                        <input name="orgContactPhone" placeholder="Contact Phone" value={formOrg.orgContactPhone} onChange={handleFormChange} />
                        <input name="orgAbbreviation" placeholder="Organization Abbreviation *" value={formOrg.orgAbbreviation} onChange={handleFormChange} required={!orgToEdit} />
                        <input name="orgWebsite" placeholder="Website" value={formOrg.orgWebsite} onChange={handleFormChange} />
                        <select name="orgStatus" value={formOrg.orgStatus} onChange={handleFormChange}>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                </div>
                
                {!orgToEdit && (
                    <div className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <h3>Coordinator Details</h3>
                            <label className={styles.toggleSwitch}>
                                <input 
                                    type="checkbox" 
                                    checked={showCoordinatorSection} 
                                    onChange={() => setShowCoordinatorSection(!showCoordinatorSection)}
                                />
                                <span className={styles.slider}></span>
                                <span className={styles.toggleLabel}>{showCoordinatorSection ? 'Enabled' : 'Disabled'}</span>
                            </label>
                        </div>
                        <p className={styles.formNote}>Create a coordinator for this organization</p>
                        
                        {showCoordinatorSection && (
                            <div className={styles.formGrid}>
                                <input 
                                    name="coordinatorUsername" 
                                    placeholder="Coordinator Username *" 
                                    value={formOrg.coordinatorUsername} 
                                    onChange={handleFormChange}
                                    required={showCoordinatorSection} 
                                />
                                <input 
                                    name="coordinatorEmail" 
                                    placeholder="Coordinator Email *" 
                                    value={formOrg.coordinatorEmail} 
                                    onChange={handleFormChange}
                                    required={showCoordinatorSection} 
                                />
                                <input 
                                    type="password"
                                    name="coordinatorPassword" 
                                    placeholder="Coordinator Password *" 
                                    value={formOrg.coordinatorPassword} 
                                    onChange={handleFormChange}
                                    required={showCoordinatorSection} 
                                />
                                <input 
                                    name="coordinatorPhone" 
                                    placeholder="Coordinator Phone" 
                                    value={formOrg.coordinatorPhone} 
                                    onChange={handleFormChange}
                                />
                                <select 
                                    name="coordinatorRole" 
                                    value={formOrg.coordinatorRole} 
                                    onChange={handleFormChange}
                                >
                                    <option value="COORDINATOR">Coordinator</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                                <input 
                                    name="internshipName" 
                                    placeholder="Internship Name *" 
                                    value={formOrg.internshipName} 
                                    onChange={handleFormChange}
                                    required={showCoordinatorSection} 
                                />
                                <div className={styles.fileInputGroup}>
                                    <label htmlFor="advertisementDoc">Advertisement Document (Optional):</label>
                                    <input
                                        id="advertisementDoc"
                                        type="file"
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        onChange={e => setCoordinatorFile(e.target.files[0])}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Dialog>

           {/* --- THIS IS THE UPDATED DIALOG FOR DELETION --- */}
           <Dialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Confirm Deletion"
                onConfirm={handleDeleteConfirm}
                confirmText="Delete" // Use the new prop for the button text
                confirmVariant="danger" // Use the new prop for the button style
            >
                <p>Are you sure you want to delete the organization "{orgToDelete?.orgName}"? This action cannot be undone.</p>
            </Dialog>
        </div>
    );
};

export default AdminManageOrganizations;