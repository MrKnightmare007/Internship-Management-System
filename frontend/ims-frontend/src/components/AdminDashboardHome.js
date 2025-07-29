import React from 'react';
import styles from './AdminDashboardHome.module.css';
import Card from './ui/Card';

const AdminDashboardHome = () => {
    // TODO: This data should be fetched from the backend API.
    const programSummary = { active: 5, pending: 10, completed: 15 };
    const userStats = { admins: 1, coordinators: 10, applicants: 200 };
    const recentActivities = ["Program Created: 07/12/2025", "Applicant Added: 07/13/2025"];
    const notifications = ["New Application: John Doe", "Program Review Due: 07/15/2025"];

    return (
        <div>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>
            <div className={styles.grid}>
                <Card>
                    <h3 className={styles.cardTitle}>Programs Summary</h3>
                    <ul className={styles.statList}>
                        <li>Active: <span>{programSummary.active}</span></li>
                        <li>Pending: <span>{programSummary.pending}</span></li>
                        <li>Completed: <span>{programSummary.completed}</span></li>
                    </ul>
                </Card>
                <Card>
                    <h3 className={styles.cardTitle}>User Statistics</h3>
                     <ul className={styles.statList}>
                        <li>Admins: <span>{userStats.admins}</span></li>
                        <li>Coordinators: <span>{userStats.coordinators}</span></li>
                        <li>Applicants: <span>{userStats.applicants}</span></li>
                    </ul>
                </Card>
                <Card>
                    <h3 className={styles.cardTitle}>Recent Activities</h3>
                    <ul className={styles.activityList}>{recentActivities.map((act, i) => <li key={i}>{act}</li>)}</ul>
                </Card>
                <Card>
                    <h3 className={styles.cardTitle}>Notifications</h3>
                    <ul className={styles.activityList}>{notifications.map((n, i) => <li key={i}>{n}</li>)}</ul>
                </Card>
            </div>
        </div>
    );
};
export default AdminDashboardHome;