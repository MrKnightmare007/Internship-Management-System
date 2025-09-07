import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './MyApplications.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';

const MyApplications = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchMyApplications();
    }, []);

    const fetchMyApplications = async () => {
        try {
            const response = await api.get('/applications/my-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFilteredApplications = () => {
        if (filter === 'ALL') return applications;
        return applications.filter(app => app.status === filter);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'ACCEPTED': return '#10b981';
            case 'REJECTED': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PENDING': return '⏳';
            case 'ACCEPTED': return '✅';
            case 'REJECTED': return '❌';
            default: return '📄';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusMessage = (status) => {
        switch (status) {
            case 'PENDING':
                return 'Your application is under review. We will notify you once a decision is made.';
            case 'ACCEPTED':
                return 'Congratulations! Your application has been accepted. Check your email for further instructions.';
            case 'REJECTED':
                return 'Unfortunately, your application was not selected this time. Keep looking for other opportunities!';
            default:
                return 'Application status unknown.';
        }
    };

    if (isLoading) return <Loader />;

    const filteredApplications = getFilteredApplications();

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>My Applications</h1>
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

            <Card className={styles.filterCard}>
                <div className={styles.filters}>
                    <label>Filter by Status:</label>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                        <option value="ALL">All Applications</option>
                        <option value="PENDING">Pending</option>
                        <option value="ACCEPTED">Accepted</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>
            </Card>

            <div className={styles.applicationsGrid}>
                {filteredApplications.length === 0 ? (
                    <Card className={styles.noApplications}>
                        <div className={styles.noApplicationsContent}>
                            <div className={styles.noApplicationsIcon}>📝</div>
                            <h3>No Applications Found</h3>
                            <p>
                                {filter === 'ALL' 
                                    ? "You haven't submitted any applications yet. Browse available internship programs to get started!"
                                    : `No applications with status "${filter}" found.`
                                }
                            </p>
                        </div>
                    </Card>
                ) : (
                    filteredApplications.map((application, index) => (
                        <Card key={index} className={styles.applicationCard}>
                            <div className={styles.applicationHeader}>
                                <div className={styles.programInfo}>
                                    <h3 className={styles.programName}>{application.programName}</h3>
                                    <p className={styles.appliedDate}>
                                        Applied on {formatDate(application.appliedDate)}
                                    </p>
                                </div>
                                <div className={styles.statusBadge}>
                                    <span 
                                        className={styles.status}
                                        style={{ backgroundColor: getStatusColor(application.status) }}
                                    >
                                        {getStatusIcon(application.status)} {application.status}
                                    </span>
                                </div>
                            </div>
                            
                            <div className={styles.applicationBody}>
                                <div className={styles.statusMessage}>
                                    <p>{getStatusMessage(application.status)}</p>
                                </div>
                                
                                {application.status === 'ACCEPTED' && (
                                    <div className={styles.nextSteps}>
                                        <h4>Next Steps:</h4>
                                        <ul>
                                            <li>Check your email for detailed instructions</li>
                                            <li>Prepare required documents</li>
                                            <li>Wait for further communication from the organization</li>
                                        </ul>
                                    </div>
                                )}
                                
                                {application.status === 'PENDING' && (
                                    <div className={styles.pendingInfo}>
                                        <h4>What happens next?</h4>
                                        <ul>
                                            <li>Your application is being reviewed by the organization</li>
                                            <li>You will receive an email notification once a decision is made</li>
                                            <li>This process typically takes 3-5 business days</li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                            
                            <div className={styles.applicationFooter}>
                                <div className={styles.timeline}>
                                    <div className={`${styles.timelineStep} ${styles.completed}`}>
                                        <div className={styles.timelineIcon}>✓</div>
                                        <span>Application Submitted</span>
                                    </div>
                                    <div className={`${styles.timelineStep} ${application.status !== 'PENDING' ? styles.completed : styles.current}`}>
                                        <div className={styles.timelineIcon}>
                                            {application.status === 'PENDING' ? '⏳' : '✓'}
                                        </div>
                                        <span>Under Review</span>
                                    </div>
                                    <div className={`${styles.timelineStep} ${application.status === 'ACCEPTED' ? styles.completed : application.status === 'REJECTED' ? styles.rejected : ''}`}>
                                        <div className={styles.timelineIcon}>
                                            {application.status === 'ACCEPTED' ? '✓' : application.status === 'REJECTED' ? '❌' : '○'}
                                        </div>
                                        <span>Decision Made</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyApplications;