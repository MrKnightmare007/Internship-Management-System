import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './AdminTables.module.css'; // Reusing the common table style
import Card from './ui/Card';
import Loader from './ui/Loader';

const AdminInternshipPrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLoading(true);
        api.get('/programs/all')
            .then(response => {
                setPrograms(response.data);
            })
            .catch(err => {
                console.error("Failed to fetch programs:", err);
                setError("Could not load internship programs. Please try again.");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <h1 className={styles.pageTitle}>All Internship Programs</h1>
            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr>
                                <th>Program Title</th>
                                <th>Organization</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {programs.map((prog) => (
                                <tr key={prog.intProgId}>
                                    <td>{prog.intProgName}</td>
                                    <td>{prog.organizationName}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[prog.progStatus?.toLowerCase()]}`}>
                                            {prog.progStatus}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {programs.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>No programs found across all organizations.</p>}
                </div>
            </Card>
        </div>
    );
};

export default AdminInternshipPrograms;