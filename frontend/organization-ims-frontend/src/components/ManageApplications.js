import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './ManageApplications.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';
import Button from './ui/Button';

const ManageApplications = () => {
    const [applications, setApplications] = useState([]);
    const [filteredApplications, setFilteredApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [selectedApplications, setSelectedApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [filters, setFilters] = useState({
        status: 'ALL',
        program: 'ALL',
        search: ''
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [previewDocumentData, setPreviewDocumentData] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [applications, filters]);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/organization');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...applications];

        if (filters.status !== 'ALL') {
            filtered = filtered.filter(app => app.status === filters.status);
        }

        if (filters.program !== 'ALL') {
            filtered = filtered.filter(app => app.programName === filters.program);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(app => 
                app.applicantName.toLowerCase().includes(searchLower) ||
                app.applicantEmail.toLowerCase().includes(searchLower) ||
                app.programName.toLowerCase().includes(searchLower)
            );
        }

        setFilteredApplications(filtered);
    };

    const fetchApplicationDetails = async (applicationId) => {
        setIsDetailLoading(true);
        try {
            const response = await api.get(`/applications/${applicationId}`);
            setSelectedApplication(response.data);
        } catch (error) {
            console.error('Error fetching application details:', error);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const updateApplicationStatus = async (applicationId, status) => {
        try {
            await api.put(`/applications/${applicationId}/status`, { status });
            await fetchApplications();
            if (selectedApplication && selectedApplication.applicationId === applicationId) {
                setSelectedApplication({ ...selectedApplication, status });
            }
        } catch (error) {
            console.error('Error updating application status:', error);
        }
    };

    const updateBulkStatus = async (status) => {
        try {
            await api.put('/applications/bulk-status', {
                applicationIds: selectedApplications,
                status
            });
            await fetchApplications();
            setSelectedApplications([]);
        } catch (error) {
            console.error('Error updating bulk status:', error);
        }
    };

    const handleStatusChange = (applicationId, status) => {
        setConfirmAction({ applicationId, status });
        setShowConfirmDialog(true);
    };

    const handleBulkAction = (status) => {
        if (selectedApplications.length === 0) return;
        setBulkAction(status);
        setShowBulkConfirm(true);
    };

    const confirmStatusChange = () => {
        if (confirmAction) {
            updateApplicationStatus(confirmAction.applicationId, confirmAction.status);
        }
        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const confirmBulkAction = () => {
        if (bulkAction) {
            updateBulkStatus(bulkAction);
        }
        setShowBulkConfirm(false);
        setBulkAction(null);
    };

    const toggleSelectApplication = (applicationId) => {
        setSelectedApplications(prev => 
            prev.includes(applicationId) 
                ? prev.filter(id => id !== applicationId)
                : [...prev, applicationId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedApplications.length === filteredApplications.length) {
            setSelectedApplications([]);
        } else {
            setSelectedApplications(filteredApplications.map(app => app.applicationId));
        }
    };

    const getUniquePrograms = () => {
        return [...new Set(applications.map(app => app.programName))];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const downloadDocument = async (applicationId, documentType) => {
        try {
            const response = await api.get(`/applications/${applicationId}/download/${documentType}`);
            if (response.data.filePath) {
                // Open the file in a new tab for download
                window.open(`http://localhost:8080${response.data.filePath}`, '_blank');
            }
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document. Please try again.');
        }
    };

    const previewDocument = (documentPath, documentName) => {
        if (documentPath) {
            setPreviewDocumentData({
                path: `http://localhost:8080${documentPath}`,
                name: documentName,
                type: getFileType(documentPath)
            });
            setShowDocumentPreview(true);
        }
    };

    const getFileType = (filePath) => {
        const extension = filePath.split('.').pop().toLowerCase();
        if (['pdf'].includes(extension)) return 'pdf';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
        if (['doc', 'docx'].includes(extension)) return 'document';
        return 'unknown';
    };

    const closeDocumentPreview = () => {
        setShowDocumentPreview(false);
        setPreviewDocumentData(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'ACCEPTED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    if (isLoading) return <Loader />;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Application Management</h1>
                <div className={styles.stats}>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{applications.length}</span>
                        <span className={styles.statLabel}>Total Applications</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{applications.filter(app => app.status === 'PENDING').length}</span>
                        <span className={styles.statLabel}>Pending</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{applications.filter(app => app.status === 'ACCEPTED').length}</span>
                        <span className={styles.statLabel}>Accepted</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNumber}>{applications.filter(app => app.status === 'REJECTED').length}</span>
                        <span className={styles.statLabel}>Rejected</span>
                    </div>
                </div>
            </div>

            <Card className={styles.filtersCard}>
                <div className={styles.filters}>
                    <div className={styles.filterGroup}>
                        <label>Status:</label>
                        <select 
                            value={filters.status} 
                            onChange={(e) => setFilters({...filters, status: e.target.value})}
                        >
                            <option value="ALL">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="ACCEPTED">Accepted</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Program:</label>
                        <select 
                            value={filters.program} 
                            onChange={(e) => setFilters({...filters, program: e.target.value})}
                        >
                            <option value="ALL">All Programs</option>
                            {getUniquePrograms().map(program => (
                                <option key={program} value={program}>{program}</option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label>Search:</label>
                        <input
                            type="text"
                            placeholder="Search by name, email, or program..."
                            value={filters.search}
                            onChange={(e) => setFilters({...filters, search: e.target.value})}
                        />
                    </div>
                </div>
                
                {selectedApplications.length > 0 && (
                    <div className={styles.bulkActions}>
                        <span>{selectedApplications.length} applications selected</span>
                        <div className={styles.bulkButtons}>
                            <Button 
                                onClick={() => handleBulkAction('ACCEPTED')}
                                className={styles.acceptButton}
                            >
                                Bulk Accept
                            </Button>
                            <Button 
                                onClick={() => handleBulkAction('REJECTED')}
                                className={styles.rejectButton}
                            >
                                Bulk Reject
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <div className={styles.content}>
                <Card className={styles.tableCard}>
                    <div className={styles.tableContainer}>
                        <table className={styles.appTable}>
                            <thead>
                                <tr>
                                    <th>
                                        <input
                                            type="checkbox"
                                            checked={selectedApplications.length === filteredApplications.length && filteredApplications.length > 0}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th>Applicant Name</th>
                                    <th>Email</th>
                                    <th>Program</th>
                                    <th>Course</th>
                                    <th>Status</th>
                                    <th>Applied Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.map(app => (
                                    <tr key={app.applicationId}>
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={selectedApplications.includes(app.applicationId)}
                                                onChange={() => toggleSelectApplication(app.applicationId)}
                                            />
                                        </td>
                                        <td className={styles.nameCell}>
                                            <div>
                                                <div className={styles.applicantName}>{app.applicantName}</div>
                                                <div className={styles.applicantPhone}>{app.applicantPhone}</div>
                                            </div>
                                        </td>
                                        <td>{app.applicantEmail}</td>
                                        <td>{app.programName}</td>
                                        <td>
                                            <div>
                                                <div>{app.currentCourse}</div>
                                                <div className={styles.semester}>Sem {app.currentSemester}</div>
                                            </div>
                                        </td>
                                        <td>
                                            <span 
                                                className={styles.status}
                                                style={{ backgroundColor: getStatusColor(app.status) }}
                                            >
                                                {app.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(app.appliedDate)}</td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <Button
                                                    onClick={() => fetchApplicationDetails(app.applicationId)}
                                                    className={styles.viewButton}
                                                    size="small"
                                                >
                                                    View
                                                </Button>
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <Button
                                                            onClick={() => handleStatusChange(app.applicationId, 'ACCEPTED')}
                                                            className={styles.acceptButton}
                                                            size="small"
                                                        >
                                                            Accept
                                                        </Button>
                                                        <Button
                                                            onClick={() => handleStatusChange(app.applicationId, 'REJECTED')}
                                                            className={styles.rejectButton}
                                                            size="small"
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {filteredApplications.length === 0 && (
                            <div className={styles.noData}>
                                No applications found matching your criteria.
                            </div>
                        )}
                    </div>
                </Card>

                {selectedApplication && (
                    <Card className={styles.detailCard}>
                        <div className={styles.detailHeader}>
                            <h3>Application Details</h3>
                            <Button 
                                onClick={() => setSelectedApplication(null)}
                                className={styles.closeButton}
                            >
                                ×
                            </Button>
                        </div>
                        
                        {isDetailLoading ? (
                            <Loader />
                        ) : (
                            <div className={styles.detailContent}>
                                <div className={styles.detailSection}>
                                    <h4>Personal Information</h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <label>Name:</label>
                                            <span>{selectedApplication.applicantName}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Date of Birth:</label>
                                            <span>{selectedApplication.dob}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Email:</label>
                                            <span>{selectedApplication.applicantEmail}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Phone:</label>
                                            <span>{selectedApplication.applicantPhone}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Address:</label>
                                            <span>{selectedApplication.communicationAddress}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Academic Information</h4>
                                    <div className={styles.detailGrid}>
                                        <div className={styles.detailItem}>
                                            <label>College:</label>
                                            <span>{selectedApplication.collegeNameAddress}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>University:</label>
                                            <span>{selectedApplication.universityName}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Registration No:</label>
                                            <span>{selectedApplication.universityRegNo}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>University Roll No:</label>
                                            <span>{selectedApplication.universityRollNo}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Current Course:</label>
                                            <span>{selectedApplication.currentCourse}</span>
                                        </div>
                                        <div className={styles.detailItem}>
                                            <label>Current Semester:</label>
                                            <span>{selectedApplication.currentSemester}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Academic Records</h4>
                                    <div className={styles.academicRecords}>
                                        {Array.isArray(selectedApplication.academicRecords) ? (
                                            selectedApplication.academicRecords.map((record, index) => (
                                                <div key={index} className={styles.recordItem}>
                                                    <span>{record.exam}: {record.percentage}% ({record.year})</span>
                                                </div>
                                            ))
                                        ) : (
                                            <span>Academic records not available</span>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Uploaded Documents</h4>
                                    <div className={styles.documentsSection}>
                                        {selectedApplication.documents ? (
                                            <div className={styles.documentsList}>
                                                {selectedApplication.documents.aadharCard && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>🆔</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Aadhar Card</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.aadharCard, 'Aadhar Card')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'aadharcard')}
                                                                        className={styles.downloadButton}
                                                                        size="small"
                                                                    >
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {selectedApplication.documents.classXMarksheet && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>📜</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Class X Marksheet</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.classXMarksheet, 'Class X Marksheet')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'classxmarksheet')}
                                                                        className={styles.downloadButton}
                                                                        size="small"
                                                                    >
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {selectedApplication.documents.classXIIMarksheet && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>📜</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Class XII Marksheet</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.classXIIMarksheet, 'Class XII Marksheet')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'classxiimarksheet')}
                                                                        className={styles.downloadButton}
                                                                        size="small"
                                                                    >
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {selectedApplication.documents.coverLetter && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>📝</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Cover Letter (Optional)</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.coverLetter, 'Cover Letter')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'coverletter')}
                                                                        className={styles.downloadButton}
                                                                        size="small"
                                                                    >
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {selectedApplication.documents.additionalDocuments && 
                                                 Array.isArray(selectedApplication.documents.additionalDocuments) && 
                                                 selectedApplication.documents.additionalDocuments.length > 0 && (
                                                    <div className={styles.additionalDocuments}>
                                                        <h5>Additional Documents:</h5>
                                                        {selectedApplication.documents.additionalDocuments.map((docPath, index) => (
                                                            <div key={index} className={styles.documentItem}>
                                                                <div className={styles.documentHeader}>
                                                                    <span className={styles.documentIcon}>📎</span>
                                                                    <div className={styles.documentInfo}>
                                                                        <span className={styles.documentName}>Document {index + 1}</span>
                                                                        <div className={styles.documentActions}>
                                                                            <Button
                                                                                onClick={() => previewDocument(docPath, `Additional Document ${index + 1}`)}
                                                                                className={styles.previewButton}
                                                                                size="small"
                                                                            >
                                                                                Preview
                                                                            </Button>
                                                                            <Button
                                                                                onClick={() => window.open(`http://localhost:8080${docPath}`, '_blank')}
                                                                                className={styles.downloadButton}
                                                                                size="small"
                                                                            >
                                                                                Download
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className={styles.noDocuments}>
                                                <span>No documents uploaded</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.detailSection}>
                                    <h4>Application Status</h4>
                                    <div className={styles.statusSection}>
                                        <span 
                                            className={styles.currentStatus}
                                            style={{ backgroundColor: getStatusColor(selectedApplication.status) }}
                                        >
                                            {selectedApplication.status}
                                        </span>
                                        <div className={styles.statusActions}>
                                            {selectedApplication.status === 'PENDING' && (
                                                <>
                                                    <Button
                                                        onClick={() => handleStatusChange(selectedApplication.applicationId, 'ACCEPTED')}
                                                        className={styles.acceptButton}
                                                    >
                                                        Accept Application
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleStatusChange(selectedApplication.applicationId, 'REJECTED')}
                                                        className={styles.rejectButton}
                                                    >
                                                        Reject Application
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>

            {/* Confirmation Dialogs */}
            {showConfirmDialog && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Action</h3>
                        <p>
                            Are you sure you want to {confirmAction?.status.toLowerCase()} this application?
                            This action cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
                            <Button 
                                onClick={confirmStatusChange}
                                className={confirmAction?.status === 'ACCEPTED' ? styles.acceptButton : styles.rejectButton}
                            >
                                Confirm {confirmAction?.status}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showBulkConfirm && (
                <div className={styles.modal}>
                    <div className={styles.modalContent}>
                        <h3>Confirm Bulk Action</h3>
                        <p>
                            Are you sure you want to {bulkAction?.toLowerCase()} {selectedApplications.length} applications?
                            This action cannot be undone.
                        </p>
                        <div className={styles.modalActions}>
                            <Button onClick={() => setShowBulkConfirm(false)}>Cancel</Button>
                            <Button 
                                onClick={confirmBulkAction}
                                className={bulkAction === 'ACCEPTED' ? styles.acceptButton : styles.rejectButton}
                            >
                                Confirm Bulk {bulkAction}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Document Preview Modal */}
            {showDocumentPreview && previewDocumentData && (
                <div className={styles.documentModal}>
                    <div className={styles.documentModalContent}>
                        <div className={styles.documentModalHeader}>
                            <h3>{previewDocumentData.name}</h3>
                            <div className={styles.documentModalActions}>
                                <Button
                                    onClick={() => window.open(previewDocumentData.path, '_blank')}
                                    className={styles.downloadButton}
                                    size="small"
                                >
                                    Open in New Tab
                                </Button>
                                <Button 
                                    onClick={closeDocumentPreview}
                                    className={styles.closeButton}
                                >
                                    ×
                                </Button>
                            </div>
                        </div>
                        
                        <div className={styles.documentPreviewContainer}>
                            {previewDocumentData.type === 'pdf' && (
                                <iframe
                                    src={previewDocumentData.path}
                                    className={styles.documentFrame}
                                    title={previewDocumentData.name}
                                />
                            )}
                            
                            {previewDocumentData.type === 'image' && (
                                <img
                                    src={previewDocumentData.path}
                                    alt={previewDocumentData.name}
                                    className={styles.documentImage}
                                />
                            )}
                            
                            {previewDocumentData.type === 'document' && (
                                <div className={styles.documentNotSupported}>
                                    <div className={styles.documentIcon}>📄</div>
                                    <p>Preview not available for this document type.</p>
                                    <p>Click "Open in New Tab" to view or download the document.</p>
                                    <Button
                                        onClick={() => window.open(previewDocumentData.path, '_blank')}
                                        className={styles.downloadButton}
                                    >
                                        Open Document
                                    </Button>
                                </div>
                            )}
                            
                            {previewDocumentData.type === 'unknown' && (
                                <div className={styles.documentNotSupported}>
                                    <div className={styles.documentIcon}>❓</div>
                                    <p>Preview not available for this file type.</p>
                                    <p>Click "Open in New Tab" to download the document.</p>
                                    <Button
                                        onClick={() => window.open(previewDocumentData.path, '_blank')}
                                        className={styles.downloadButton}
                                    >
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageApplications;