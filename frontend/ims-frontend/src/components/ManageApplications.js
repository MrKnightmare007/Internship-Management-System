import React from 'react';
import styles from './ManageApplications.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

const ManageApplications = () => {
    // TODO: This data should be fetched from the backend API.
    // Using placeholder data from the concept PDF.
    const summaryData = {
        total: 127,
        pending: 43,
        accepted: 67,
        rejected: 17
    };

    const applications = [
        { id: 'APP-2025-001', name: 'John Doe', date: '2025-07-01', status: 'Pending' },
        { id: 'APP-2025-002', name: 'Jane Smith', date: '2025-07-02', status: 'Accepted' },
        { id: 'APP-2025-003', name: 'Mike Johnson', date: '2025-07-03', status: 'Rejected' },
    ];

    return (
        <div>
            <h1 className={styles.pageTitle}>Application Management</h1>
            <div className={styles.summaryGrid}>
                <Card className={styles.summaryCard}>
                    <h4>Total Applications</h4>
                    <p className={styles.summaryValue}>{summaryData.total}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Pending Review</h4>
                    <p className={styles.summaryValue}>{summaryData.pending}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Accepted</h4>
                    <p className={styles.summaryValue}>{summaryData.accepted}</p>
                </Card>
                <Card className={styles.summaryCard}>
                    <h4>Rejected</h4>
                    <p className={styles.summaryValue}>{summaryData.rejected}</p>
                </Card>
            </div>

            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table className={styles.appTable}>
                        <thead>
                            <tr>
                                <th>Application ID</th>
                                <th>Applicant Name</th>
                                <th>Applied Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applications.map(app => (
                                <tr key={app.id}>
                                    <td>{app.id}</td>
                                    <td>{app.name}</td>
                                    <td>{app.date}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[app.status.toLowerCase()]}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <Button variant="secondary">View</Button>
                                        {app.status === 'Pending' && (
                                            <>
                                                <Button onClick={() => alert(`Accepted ${app.name}`)}>Accept</Button>
                                                <Button onClick={() => alert(`Rejected ${app.name}`)} variant="danger">Reject</Button>
                                            </>
                                        )}
                                        {app.status === 'Accepted' && (
                                            <Button onClick={() => alert(`Assigning mentor for ${app.name}`)}>Assign</Button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default ManageApplications;