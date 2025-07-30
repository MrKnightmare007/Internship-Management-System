import React from 'react';
import styles from './OrgReports.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

const OrgReports = () => {
    // TODO: This data should be fetched from the backend API.
    const appReport = { total: 127, accepted: 67, pending: 43, rejected: 17 };
    const completionReport = { completed: 45, avgDuration: '5 months', successRate: '88%' };
    const mentorReport = { active: 5, avgApplicants: 3.5, feedback: '4.1/5' };

    return (
        <div>
            <h1 className={styles.pageTitle}>Reports</h1>
            <div className={styles.reportsGrid}>
                <Card className={styles.reportCard}>
                    <h3 className={styles.reportTitle}>Application Status Report</h3>
                    <ul className={styles.statList}>
                        <li><strong>Total:</strong> {appReport.total}</li>
                        <li><strong>Accepted:</strong> {appReport.accepted}</li>
                        <li><strong>Pending:</strong> {appReport.pending}</li>
                        <li><strong>Rejected:</strong> {appReport.rejected}</li>
                    </ul>
                    <Button variant="primary">Download PDF</Button>
                </Card>

                <Card className={styles.reportCard}>
                    <h3 className={styles.reportTitle}>Program Completion Report</h3>
                    <ul className={styles.statList}>
                        <li><strong>Completed:</strong> {completionReport.completed}</li>
                        <li><strong>Avg. Duration:</strong> {completionReport.avgDuration}</li>
                        <li><strong>Success Rate:</strong> {completionReport.successRate}</li>
                    </ul>
                    <Button variant="primary">Download PDF</Button>
                </Card>

                <Card className={styles.reportCard}>
                    <h3 className={styles.reportTitle}>Mentor Performance Report</h3>
                    <ul className={styles.statList}>
                        <li><strong>Active Mentors:</strong> {mentorReport.active}</li>
                        <li><strong>Avg. Applicants:</strong> {mentorReport.avgApplicants}</li>
                        <li><strong>Feedback Score:</strong> {mentorReport.feedback}</li>
                    </ul>
                    <Button variant="primary">Download PDF</Button>
                </Card>
            </div>
        </div>
    );
};

export default OrgReports;