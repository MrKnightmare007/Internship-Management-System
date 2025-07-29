import React from 'react';
import styles from './AdminTables.module.css'; // Reusing a common table style
import Card from './ui/Card';

const AdminInternshipPrograms = () => {
    // TODO: This requires a new API endpoint to fetch all programs from all orgs.
    const allPrograms = [
        { title: "Data Science & Machine Learning", org: "Centre of Excellence", status: "Active" },
        { title: "Web Development Internship", org: "WEBEL - IT Department", status: "Active" },
        { title: "AI & Robotics Internship", org: "Centre of Excellence - Robotics", status: "Closed" },
    ];

    return (
        <div>
            <h1 className={styles.pageTitle}>All Internship Programs</h1>
            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table>
                        <thead>
                            <tr><th>Program Title</th><th>Organization</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {allPrograms.map((prog, i) => (
                                <tr key={i}>
                                    <td>{prog.title}</td>
                                    <td>{prog.org}</td>
                                    <td><span className={`${styles.status} ${styles[prog.status.toLowerCase()]}`}>{prog.status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminInternshipPrograms;