import React from 'react';
import styles from './ApplicantDashboard.module.css';
import Card from './ui/Card';

// This is now the main dashboard summary page
const ApplicantDashboard = () => {
    // TODO: Replace with data from API calls
    const summaryData = {
        pendingTasks: 3,
        activeInternships: 1,
        certificatesEarned: 2,
        newNotifications: 1
    };

    const recentActivities = [
        { text: 'Internship Progress Updated: 65%', date: '07/12/2025' },
        { text: 'Task Completed: Data Analysis', date: '07/11/2025' },
        { text: 'Certificate Issued: Data Science Basics', date: '07/10/2025' }
    ];

    return (
        <div>
            <h1 className={styles.pageTitle}>Dashboard</h1>
            <div className={styles.summaryGrid}>
                <Card className={styles.summaryCard}>
                    <h4>Pending Tasks</h4>
                    <p className={styles.summaryValue}>{summaryData.pendingTasks}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Active Internships</h4>
                    <p className={styles.summaryValue}>{summaryData.activeInternships}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Certificates Earned</h4>
                    <p className={styles.summaryValue}>{summaryData.certificatesEarned}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>New Notifications</h4>
                    <p className={styles.summaryValue}>{summaryData.newNotifications}</p>
                </Card>
            </div>

            <h2 className={styles.sectionTitle}>Recent Activities</h2>
            <Card>
                <ul className={styles.activityList}>
                    {recentActivities.map((activity, index) => (
                        <li key={index}>
                            <span>{activity.text}</span>
                            <span className={styles.activityDate}>{activity.date}</span>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default ApplicantDashboard;