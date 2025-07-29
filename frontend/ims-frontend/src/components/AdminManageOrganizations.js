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
    
    const initialOrgState = { orgName: '', orgAddress: '', orgContactEmail: '', orgContactPhone: '', orgWebsite: '', orgStatus: 'ACTIVE' };
    const [formOrg, setFormOrg] = useState(initialOrgState);

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

    const handleFormSubmit = () => {
        const apiCall = orgToEdit
            ? api.patch(`/organizations/${orgToEdit.orgId}`, formOrg)
            : api.post('/organizations', formOrg);

        apiCall.then(() => {
            fetchOrgs();
            setIsFormOpen(false);
        }).catch(error => console.error('Error saving organization:', error));
    };

    const handleDeleteConfirm = () => {
        if (!orgToDelete) return;
        api.delete(`/organizations/${orgToDelete.orgId}`).then(() => {
            fetchOrgs();
            setIsDeleteDialogOpen(false);
            setOrgToDelete(null);
        }).catch(error => {
            console.error('Error deleting organization:', error);
            alert('Failed to delete organization.');
            setIsDeleteDialogOpen(false);
        });
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
                confirmText="Save" // Use the new prop for the button text
                confirmVariant="primary" // Use the new prop for the button style
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