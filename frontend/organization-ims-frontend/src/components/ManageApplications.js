import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './ManageApplications.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';
import Button from './ui/Button';
import ExamSetupForm from './ExamSetupForm';
import AcceptedStudentsTable from './AcceptedStudentsTable';

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
    const [showClosedInternships, setShowClosedInternships] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);
    const [bulkAction, setBulkAction] = useState(null);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [previewDocumentData, setPreviewDocumentData] = useState(null);
    const [showExamSetupForm, setShowExamSetupForm] = useState(false);
    const [showAcceptedStudentsTable, setShowAcceptedStudentsTable] = useState(false);
    const [selectedProgramForExam, setSelectedProgramForExam] = useState(null);
    const [acceptedStudentsData, setAcceptedStudentsData] = useState({});
    const [examSetupData, setExamSetupData] = useState({});

    useEffect(() => {
        loadApplications();
    }, []);

    useEffect(() => {
        // Fetch accepted students data after applications are loaded
        if (applications.length > 0) {
            fetchAcceptedStudentsData();
        }
    }, [applications]);

    const loadApplications = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/applications/organization');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        applyFilters();
    }, [applications, filters, showClosedInternships]);

    const fetchAcceptedStudentsData = async () => {
        try {
            console.log('Fetching accepted students data...');
            console.log('Applications data:', applications);
            
            // Get unique programs from applications with better extraction logic
            const uniquePrograms = [...new Set(applications.map(app => {
                // Try multiple ways to get program ID and name
                const programId = app.program?.id || app.program?.intProgId || app.programId || app.progId;
                const programName = app.programName || app.program?.intProgName || app.program?.name;
                
                console.log('App data:', {
                    app,
                    extractedId: programId,
                    extractedName: programName
                });
                
                return JSON.stringify({
                    id: programId,
                    name: programName
                });
            }))].map(str => JSON.parse(str)).filter(p => p.id && p.name); // Ensure both ID and name exist

            console.log('Unique programs found:', uniquePrograms);

            const acceptedData = {};
            const examData = {};

            for (const program of uniquePrograms) {
                try {
                    console.log(`Fetching accepted students for program ID: ${program.id}`);
                    // Fetch accepted students count
                    const acceptedResponse = await api.get(`/exam/accepted-students/${program.id}`);
                    console.log(`API response for program ${program.id}:`, acceptedResponse.data);
                    acceptedData[program.id] = acceptedResponse.data.acceptedStudents || [];
                    console.log(`Program ${program.id} accepted students:`, acceptedData[program.id].length);

                    // Fetch exam setup data
                    try {
                        const examResponse = await api.get(`/exam/details/${program.id}`);
                        examData[program.id] = examResponse.data;
                        console.log(`Exam data for program ${program.id}:`, examData[program.id]);
                    } catch (examError) {
                        // Exam not setup yet, which is fine
                        examData[program.id] = null;
                        console.log(`No exam setup for program ${program.id}:`, examError.response?.status);
                    }
                } catch (error) {
                    console.warn(`Error fetching data for program ${program.id}:`, error);
                    console.log(`Error details:`, error.response?.data);
                }
            }

            setAcceptedStudentsData(acceptedData);
            setExamSetupData(examData);
            console.log('Accepted students data updated:', acceptedData);
        } catch (error) {
            console.error('Error fetching accepted students data:', error);
        }
    };

    const applyFilters = () => {
        let filtered = [...applications];

        // Filter out closed internships unless showClosedInternships is true
        if (!showClosedInternships) {
            filtered = filtered.filter(app => {
                const program = app.program;
                const isClosedByStatus = program?.progStatus === 'CLOSED';
                const isClosedByDate = program?.programApplicationEndDate && 
                    new Date(program.programApplicationEndDate) < new Date();
                return !isClosedByStatus && !isClosedByDate;
            });
        }

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
            await loadApplications();
            // Also refresh accepted students data immediately after accepting
            if (status === 'ACCEPTED') {
                await fetchAcceptedStudentsData();
            }
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
            await loadApplications();
            // Refresh accepted students data for bulk accept operations
            if (status === 'ACCEPTED') {
                await fetchAcceptedStudentsData();
            }
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
        // Filter out closed programs based on status and application end date
        const availableApplications = applications.filter(app => {
            const program = app.program;
            const isClosedByStatus = program?.progStatus === 'CLOSED';
            const isClosedByDate = program?.programApplicationEndDate && 
                new Date(program.programApplicationEndDate) < new Date();
            return !isClosedByStatus && !isClosedByDate;
        });
        return [...new Set(availableApplications.map(app => app.programName))];
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

    // Exam Setup and Accepted Students Functions
    const handleSetupExam = (programId, programName) => {
        setSelectedProgramForExam({ id: programId, name: programName });
        setShowExamSetupForm(true);
    };

    const handleExamSetupComplete = (setupData) => {
        setShowExamSetupForm(false);
        setSelectedProgramForExam(null);
        // Refresh the accepted students data
        fetchAcceptedStudentsData();
        alert('Examination setup completed successfully!');
    };

    const handleShowAcceptedStudents = (programId, programName) => {
        setSelectedProgramForExam({ id: programId, name: programName });
        setShowAcceptedStudentsTable(true);
    };

    const handleCloseAcceptedStudents = () => {
        setShowAcceptedStudentsTable(false);
        setSelectedProgramForExam(null);
        // Refresh data after potential admit card generation
        fetchAcceptedStudentsData();
    };

    // Bulk Send Admit Cards Function
    const handleBulkSendAdmitCards = async (programId, programName) => {
        const confirmSend = window.confirm(
            `Are you sure you want to generate and send admit cards to all accepted students for "${programName}"?\n\nThis will send admit cards to all students who haven't received them yet.`
        );
        
        if (!confirmSend) return;

        try {
            setIsDetailLoading(true);
            const response = await api.post(`/exam/generate-admit-cards/${programId}`);
            
            if (response.data) {
                const { successCount, failureCount, totalStudents } = response.data;
                let message = `Admit card generation completed!\n\n`;
                message += `Total Students: ${totalStudents}\n`;
                message += `Successfully Sent: ${successCount}\n`;
                if (failureCount > 0) {
                    message += `Failed: ${failureCount}\n`;
                }
                
                alert(message);
                
                // Refresh accepted students data
                await fetchAcceptedStudentsData();
            }
        } catch (error) {
            console.error('Error bulk sending admit cards:', error);
            alert('Failed to send admit cards. Please try again.\n\nError: ' + (error.response?.data || error.message));
        } finally {
            setIsDetailLoading(false);
        }
    };

    const getAcceptedStudentsCount = (programId) => {
        return acceptedStudentsData[programId]?.length || 0;
    };

    const getExamSetupStatus = (programId) => {
        return examSetupData[programId] !== null;
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
                <div className={styles.filtersHeader}>
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
                    
                    <div className={styles.toggleSection}>
                        <label className={styles.toggleLabel}>
                            <input
                                type="checkbox"
                                checked={showClosedInternships}
                                onChange={(e) => setShowClosedInternships(e.target.checked)}
                                className={styles.toggleCheckbox}
                            />
                            <span className={styles.toggleText}>Show Closed Internships</span>
                        </label>
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
                
                {/* Accepted Students Summary Section */}
                <Card className={styles.acceptedStudentsCard}>
                    <div className={styles.acceptedStudentsHeader}>
                        <h3>Accepted Students by Program</h3>
                        <p>Manage examination setup and admit card generation</p>
                    </div>
                            
                    <div className={styles.programsList}>
                        {getUniquePrograms().map(programName => {
                            const programApplications = applications.filter(app => app.programName === programName);
                            const programId = programApplications[0]?.program?.id || programApplications[0]?.programId;
                            const acceptedCount = getAcceptedStudentsCount(programId);
                            const examSetup = getExamSetupStatus(programId);
                                    
                            if (acceptedCount === 0) return null;
                                    
                            return (
                                <div key={programName} className={styles.programCard}>
                                    <div className={styles.programInfo}>
                                        <div className={styles.programTitle}>
                                            <h4>{programName}</h4>
                                            <div className={styles.programStats}>
                                                <span className={styles.acceptedCount}>
                                                    {acceptedCount} Students Accepted
                                                </span>
                                                {examSetup ? (
                                                    <span className={styles.examSetupBadge}>Exam Setup Complete</span>
                                                ) : (
                                                    <span className={styles.examPendingBadge}>Exam Setup Pending</span>
                                                )}
                                            </div>
                                        </div>
                                                
                                        <div className={styles.programActions}>
                                            {!examSetup ? (
                                                <Button
                                                    onClick={() => handleSetupExam(programId, programName)}
                                                    className={styles.setupExamButton}
                                                    size="small"
                                                >
                                                    Setup Examination
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        onClick={() => handleBulkSendAdmitCards(programId, programName)}
                                                        className={styles.bulkSendButton}
                                                        size="small"
                                                        disabled={isDetailLoading}
                                                    >
                                                        {isDetailLoading ? 'Sending...' : 'Bulk Send Admit Cards'}
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleShowAcceptedStudents(programId, programName)}
                                                        className={styles.manageStudentsButton}
                                                        size="small"
                                                    >
                                                        Manage Students
                                                    </Button>
                                                </>
                                            )}
                                                    
                                            <Button
                                                onClick={() => handleShowAcceptedStudents(programId, programName)}
                                                className={styles.viewStudentsButton}
                                                size="small"
                                                variant="secondary"
                                            >
                                                View Students
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                                
                        {getUniquePrograms().every(programName => {
                            const programApplications = applications.filter(app => app.programName === programName);
                            const programId = programApplications[0]?.program?.id || programApplications[0]?.programId;
                            return getAcceptedStudentsCount(programId) === 0;
                        }) && (
                            <div className={styles.noAcceptedStudents}>
                                <p>No students have been accepted yet.</p>
                                <p>Accept applications to see them here and manage admit cards.</p>
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
                                                
                                                {selectedApplication.documents.resume && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>📄</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Resume/CV</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.resume, 'Resume/CV')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'resume')}
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
                                                
                                                {selectedApplication.documents.passportPhoto && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>📷</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Passport Photo</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.passportPhoto, 'Passport Photo')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'passportphoto')}
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
                                                
                                                {selectedApplication.documents.signature && (
                                                    <div className={styles.documentItem}>
                                                        <div className={styles.documentHeader}>
                                                            <span className={styles.documentIcon}>✍️</span>
                                                            <div className={styles.documentInfo}>
                                                                <span className={styles.documentName}>Digital Signature</span>
                                                                <div className={styles.documentActions}>
                                                                    <Button
                                                                        onClick={() => previewDocument(selectedApplication.documents.signature, 'Digital Signature')}
                                                                        className={styles.previewButton}
                                                                        size="small"
                                                                    >
                                                                        Preview
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => downloadDocument(selectedApplication.applicationId, 'signature')}
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

            {/* Exam Setup Form Modal */}
            {showExamSetupForm && selectedProgramForExam && (
                <ExamSetupForm
                    programId={selectedProgramForExam.id}
                    programName={selectedProgramForExam.name}
                    onSetupComplete={handleExamSetupComplete}
                    onCancel={() => {
                        setShowExamSetupForm(false);
                        setSelectedProgramForExam(null);
                    }}
                />
            )}

            {/* Accepted Students Table Modal */}
            {showAcceptedStudentsTable && selectedProgramForExam && (
                <AcceptedStudentsTable
                    programId={selectedProgramForExam.id}
                    programName={selectedProgramForExam.name}
                    examSetup={examSetupData[selectedProgramForExam.id]}
                    onClose={handleCloseAcceptedStudents}
                />
            )}
        </div>
    );
};

export default ManageApplications;