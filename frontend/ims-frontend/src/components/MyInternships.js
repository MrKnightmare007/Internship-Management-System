import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './MyInternships.module.css'; // <-- Import the new CSS file
import Card from './ui/Card';
import Loader from './ui/Loader';

const MyInternships = () => {
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/applications/my-applications')
            .then(res => setApplications(res.data))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) return <Loader />;

    return (
        <div>
            <h1 className={styles.pageTitle}>My Applications</h1>
            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>Program Name</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map((app, i) => (
                                <tr key={i}>
                                    <td>{app.programName}</td>
                                    <td>
                                        {/* This will now correctly apply the colored badge styles */}
                                        <span className={`${styles.status} ${styles[app.status.toLowerCase()]}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {applications.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>You have not applied to any internships yet.</p>}
                </div>
            </Card>
        </div>
    );
};

export default MyInternships;