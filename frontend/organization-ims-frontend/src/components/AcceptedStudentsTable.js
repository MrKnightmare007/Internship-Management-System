import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './AcceptedStudentsTable.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';

const AcceptedStudentsTable = ({ programId, programName, examSetup, onClose }) => {
    const [acceptedStudents, setAcceptedStudents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingAdmitCards, setIsGeneratingAdmitCards] = useState(false);
    const [isSelectingStudents, setIsSelectingStudents] = useState(false);
    const [error, setError] = useState('');
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [filters, setFilters] = useState({
        registrationNumber: '',
        name: ''
    });
    const [filteredStudents, setFilteredStudents] = useState([]);

    useEffect(() => {
        fetchAcceptedStudents();
    }, [programId]);

    useEffect(() => {
        // Apply filters when acceptedStudents or filters change
        let filtered = acceptedStudents;
        
        if (filters.registrationNumber) {
            filtered = filtered.filter(student => 
                student.registrationNumber.toLowerCase().includes(filters.registrationNumber.toLowerCase())
            );
        }
        
        if (filters.name) {
            filtered = filtered.filter(student => 
                student.studentName.toLowerCase().includes(filters.name.toLowerCase())
            );
        }
        
        setFilteredStudents(filtered);
    }, [acceptedStudents, filters]);

    const fetchAcceptedStudents = async () => {
        try {
            setIsLoading(true);
            const response = await api.get(`/exam/accepted-students/${programId}`);
            setAcceptedStudents(response.data.acceptedStudents || []);
        } catch (error) {
            console.error('Error fetching accepted students:', error);
            setError('Failed to fetch accepted students');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAndSendAdmitCards = async () => {
        setIsGeneratingAdmitCards(true);
        setError('');

        try {
            const response = await api.post(`/exam/generate-admit-cards/${programId}`);
            
            if (response.data) {
                alert(`Successfully generated and sent ${response.data.processedCount} admit cards!`);
                fetchAcceptedStudents(); // Refresh the data
            }
        } catch (error) {
            console.error('Error generating admit cards:', error);
            setError(error.response?.data || 'Failed to generate admit cards. Please try again.');
        } finally {
            setIsGeneratingAdmitCards(false);
        }
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedStudentIds(filteredStudents.map(student => student.acceptedId));
        } else {
            setSelectedStudentIds([]);
        }
    };

    const handleSelectStudent = (acceptedId, checked) => {
        if (checked) {
            setSelectedStudentIds(prev => [...prev, acceptedId]);
        } else {
            setSelectedStudentIds(prev => prev.filter(id => id !== acceptedId));
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFinalSelection = async () => {
        if (selectedStudentIds.length === 0) {
            alert('Please select at least one student for final selection.');
            return;
        }

        if (!window.confirm(`Are you sure you want to finally select ${selectedStudentIds.length} students for the internship?`)) {
            return;
        }

        setIsSelectingStudents(true);
        setError('');

        try {
            const response = await api.post(`/exam/select-final-students/${programId}`, {
                acceptedIds: selectedStudentIds
            });
            
            if (response.data) {
                alert(`Successfully selected ${response.data.selectedCount} students for the internship!`);
                setSelectedStudentIds([]);
                fetchAcceptedStudents(); // Refresh the data
            }
        } catch (error) {
            console.error('Error selecting students:', error);
            let errorMessage = 'Failed to select students. Please try again.';
            
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsSelectingStudents(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (student) => {
        if (student.admitCardSent) {
            return <span className={`${styles.statusBadge} ${styles.sent}`}>Admit Card Sent</span>;
        } else if (student.admitCardGenerated) {
            return <span className={`${styles.statusBadge} ${styles.generated}`}>Admit Card Generated</span>;
        } else {
            return <span className={`${styles.statusBadge} ${styles.pending}`}>Pending</span>;
        }
    };

    if (isLoading) {
        return (
            <div className={styles.modalOverlay}>
                <Card className={styles.acceptedStudentsTable}>
                    <Loader />
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.modalOverlay}>
            <Card className={styles.acceptedStudentsTable}>
                <div className={styles.tableHeader}>
                    <div className={styles.headerInfo}>
                        <h2>Accepted Students</h2>
                        <p>Program: <strong>{programName}</strong></p>
                        <div className={styles.statsInfo}>
                            <span>Total Accepted: <strong>{acceptedStudents.length}</strong></span>
                            {examSetup && (
                                <span>Total Capacity: <strong>{examSetup.totalCapacity}</strong></span>
                            )}
                        </div>
                    </div>
                    <Button 
                        onClick={onClose}
                        className={styles.closeButton}
                        variant="ghost"
                    >
                        ×
                    </Button>
                </div>

                {error && (
                    <div className={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {acceptedStudents.length === 0 ? (
                    <div className={styles.noData}>
                        <p>No accepted students found for this program.</p>
                        <p>Students will appear here after you accept their applications.</p>
                    </div>
                ) : (
                    <>
                        <div className={styles.filtersSection}>
                            <h3>Filter Students</h3>
                            <div className={styles.filtersContainer}>
                                <div className={styles.filterGroup}>
                                    <label>Registration Number:</label>
                                    <input
                                        type="text"
                                        value={filters.registrationNumber}
                                        onChange={(e) => handleFilterChange('registrationNumber', e.target.value)}
                                        placeholder="Search by registration number..."
                                        className={styles.filterInput}
                                    />
                                </div>
                                <div className={styles.filterGroup}>
                                    <label>Student Name:</label>
                                    <input
                                        type="text"
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        placeholder="Search by student name..."
                                        className={styles.filterInput}
                                    />
                                </div>
                                <div className={styles.filterStats}>
                                    <span>Showing {filteredStudents.length} of {acceptedStudents.length} students</span>
                                    {selectedStudentIds.length > 0 && (
                                        <span className={styles.selectedCount}>
                                            {selectedStudentIds.length} selected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.tableActions}>
                            {examSetup ? (
                                <div className={styles.actionsGroup}>
                                    <Button
                                        onClick={handleGenerateAndSendAdmitCards}
                                        disabled={isGeneratingAdmitCards}
                                        className={styles.generateButton}
                                        variant="secondary"
                                    >
                                        {isGeneratingAdmitCards ? 'Generating & Sending...' : 'Generate & Send Admit Cards'}
                                    </Button>
                                    
                                    <Button
                                        onClick={handleFinalSelection}
                                        disabled={isSelectingStudents || selectedStudentIds.length === 0}
                                        className={styles.selectButton}
                                    >
                                        {isSelectingStudents ? 'Selecting...' : `Accept Selected (${selectedStudentIds.length})`}
                                    </Button>
                                </div>
                            ) : (
                                <div className={styles.setupRequired}>
                                    <p>⚠️ Examination setup required before generating admit cards</p>
                                </div>
                            )}
                        </div>

                        <div className={styles.tableContainer}>
                            <table className={styles.studentsTable}>
                                <thead>
                                    <tr>
                                        <th className={styles.checkboxColumn}>
                                            <input
                                                type="checkbox"
                                                checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                                                onChange={(e) => handleSelectAll(e.target.checked)}
                                                className={styles.selectAllCheckbox}
                                            />
                                        </th>
                                        <th>Registration No.</th>
                                        <th>Student Name</th>
                                        <th>Email</th>
                                        <th>Course</th>
                                        <th>Semester</th>
                                        <th>Exam Shift</th>
                                        <th>Accepted Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudents.map(student => (
                                        <tr key={student.acceptedId}>
                                            <td className={styles.checkboxColumn}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudentIds.includes(student.acceptedId)}
                                                    onChange={(e) => handleSelectStudent(student.acceptedId, e.target.checked)}
                                                    className={styles.studentCheckbox}
                                                />
                                            </td>
                                            <td className={styles.registrationCell}>
                                                <span className={styles.registrationNumber}>
                                                    {student.registrationNumber}
                                                </span>
                                            </td>
                                            <td className={styles.nameCell}>
                                                <div>
                                                    <div className={styles.studentName}>{student.studentName}</div>
                                                    <div className={styles.studentPhone}>{student.studentPhone}</div>
                                                </div>
                                            </td>
                                            <td>{student.studentEmail}</td>
                                            <td>
                                                <div>
                                                    <div>{student.course}</div>
                                                    <div className={styles.semester}>Sem {student.semester}</div>
                                                </div>
                                            </td>
                                            <td>{student.semester}</td>
                                            <td>
                                                {student.shiftName ? (
                                                    <div className={styles.shiftInfo}>
                                                        <div className={styles.shiftName}>{student.shiftName}</div>
                                                        <div className={styles.examTime}>{student.examTime}</div>
                                                    </div>
                                                ) : (
                                                    <span className={styles.notAssigned}>Not Assigned</span>
                                                )}
                                            </td>
                                            <td>{formatDate(student.acceptedAt)}</td>
                                            <td>{getStatusBadge(student)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {examSetup && (
                            <div className={styles.examInfo}>
                                <h3>Examination Details</h3>
                                <div className={styles.examDetails}>
                                    <div className={styles.examDetailItem}>
                                        <strong>Date:</strong> {new Date(examSetup.examinationDate).toLocaleDateString('en-IN')}
                                    </div>
                                    <div className={styles.examDetailItem}>
                                        <strong>Location:</strong> {examSetup.examinationLocation}
                                    </div>
                                    <div className={styles.examDetailItem}>
                                        <strong>Centre No:</strong> {examSetup.examinationCentreNo}
                                    </div>
                                    <div className={styles.examDetailItem}>
                                        <strong>Shifts:</strong> {examSetup.numberOfShifts}
                                    </div>
                                </div>
                                
                                {examSetup.shifts && (
                                    <div className={styles.shiftsInfo}>
                                        <h4>Shift Details:</h4>
                                        <div className={styles.shiftsList}>
                                            {examSetup.shifts.map((shift, index) => (
                                                <div key={index} className={styles.shiftCard}>
                                                    <div className={styles.shiftHeader}>
                                                        <strong>{shift.shiftName}</strong>
                                                        <span className={styles.shiftTime}>
                                                            {shift.startTime} - {shift.endTime}
                                                        </span>
                                                    </div>
                                                    <div className={styles.shiftCapacity}>
                                                        Capacity: {shift.currentApplicants}/{shift.maxApplicants}
                                                        <div className={styles.capacityBar}>
                                                            <div 
                                                                className={styles.capacityFill}
                                                                style={{
                                                                    width: `${(shift.currentApplicants / shift.maxApplicants) * 100}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}

                <div className={styles.tableFooter}>
                    <Button onClick={onClose} variant="secondary">
                        Close
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default AcceptedStudentsTable;