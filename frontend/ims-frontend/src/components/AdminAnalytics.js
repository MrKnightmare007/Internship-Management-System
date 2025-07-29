import React from 'react';
import styles from './AdminAnalytics.module.css';
import Card from './ui/Card';

const AdminAnalytics = () => {
    // TODO: Data should be fetched from an analytics API endpoint.
    return (
        <div>
            <h1 className={styles.pageTitle}>Analytics Dashboard</h1>
            <div className={styles.grid}>
                <Card><h3>Program Status</h3>{/* Chart would go here */}</Card>
                <Card><h3>Applicant Trends</h3>{/* Chart would go here */}</Card>
                <Card className={styles.fullWidth}>
                    <h3>Performance Metrics</h3>
                    <div className={styles.metrics}>
                        <p>Completion Rate: <span>85%</span></p>
                        <p>Average Duration: <span>5 months</span></p>
                        <p>Satisfaction Score: <span>4.2/5</span></p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminAnalytics;