import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import styles from './ApplicantDashboard.module.css';
import Card from './ui/Card';

// This is now the main dashboard summary page
const ApplicantDashboard = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/my-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const summaryData = {
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => app.status === 'PENDING').length,
        acceptedApplications: applications.filter(app => app.status === 'ACCEPTED').length,
        rejectedApplications: applications.filter(app => app.status === 'REJECTED').length
    };

    const recentApplications = applications
        .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
        .slice(0, 3);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'ACCEPTED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.summaryGrid}>
                <Card className={styles.summaryCard}>
                    <h4>Total Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.totalApplications}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Pending Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.pendingApplications}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Accepted Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.acceptedApplications}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Rejected Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.rejectedApplications}</p>
                </Card>
            </div>

            <div className={styles.dashboardContent}>
                <div className={styles.leftColumn}>
                    <h2 className={styles.sectionTitle}>Recent Applications</h2>
                    <Card>
                        {isLoading ? (
                            <div className={styles.loading}>Loading applications...</div>
                        ) : recentApplications.length > 0 ? (
                            <div className={styles.applicationsList}>
                                {recentApplications.map((application, index) => (
                                    <div key={index} className={styles.applicationItem}>
                                        <div className={styles.applicationInfo}>
                                            <h4>{application.programName}</h4>
                                            <p>Applied on {formatDate(application.appliedDate)}</p>
                                        </div>
                                        <span 
                                            className={styles.status}
                                            style={{ backgroundColor: getStatusColor(application.status) }}
                                        >
                                            {application.status}
                                        </span>
                                    </div>
                                ))}
                                <Link to="/applicant-dashboard/applications" className={styles.viewAllLink}>
                                    View All Applications →
                                </Link>
                            </div>
                        ) : (
                            <div className={styles.noApplications}>
                                <p>No applications submitted yet.</p>
                                <Link to="/applicant-dashboard/browse" className={styles.browseLink}>
                                    Browse Available Programs
                                </Link>
                            </div>
                        )}
                    </Card>
                </div>

                <div className={styles.rightColumn}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <Card>
                        <div className={styles.quickActions}>
                            <Link to="/applicant-dashboard/browse" className={styles.actionButton}>
                                <span>🔍</span>
                                <div>
                                    <h4>Browse Programs</h4>
                                    <p>Find new internship opportunities</p>
                                </div>
                            </Link>
                            <Link to="/applicant-dashboard/applications" className={styles.actionButton}>
                                <span>📋</span>
                                <div>
                                    <h4>My Applications</h4>
                                    <p>Track your application status</p>
                                </div>
                            </Link>
                            <Link to="/applicant-dashboard/profile" className={styles.actionButton}>
                                <span>👤</span>
                                <div>
                                    <h4>Update Profile</h4>
                                    <p>Keep your information current</p>
                                </div>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ApplicantDashboard;