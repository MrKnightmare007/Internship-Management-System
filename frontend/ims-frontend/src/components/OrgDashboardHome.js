import React from 'react';
import styles from './OrgDashboardHome.module.css';
import Card from './ui/Card';

const OrgDashboardHome = () => {
    // TODO: This data should be fetched from the backend API.
    // Using placeholder data from the concept PDF.
    const summaryData = {
        totalApps: 127,
        activeMentors: 5,
        completedInternships: 45,
        pendingReviews: 15
    };

    const recentActivities = [
        "Application Reviewed: John Doe - 07/12/2025",
        "Mentor Assigned: Jane Smith - 07/13/2025",
        "Internship Completed: Mike Johnson - 07/10/2025"
    ];

    return (
        <div>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <div className={styles.summaryGrid}>
                <Card className={styles.summaryCard}>
                    <h4 className={styles.summaryTitle}>Total Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.totalApps}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4 className={styles.summaryTitle}>Active Mentors</h4>
                    <p className={styles.summaryValue}>{summaryData.activeMentors}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4 className={styles.summaryTitle}>Completed Internships</h4>
                    <p className={styles.summaryValue}>{summaryData.completedInternships}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4 className={styles.summaryTitle}>Pending Reviews</h4>
                    <p className={styles.summaryValue}>{summaryData.pendingReviews}</p>
                </Card>
            </div>

            <h2 className={styles.sectionTitle}>Recent Activities</h2>
            <Card>
                <ul className={styles.activityList}>
                    {recentActivities.map((activity, index) => (
                        <li key={index} className={styles.activityItem}>
                            {activity}
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    );
};

export default OrgDashboardHome;