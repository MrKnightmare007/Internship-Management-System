import React, { useState } from 'react';
import styles from './ManageMentors.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Dialog from './ui/Dialog';

const ManageMentors = () => {
    // TODO: This data should be fetched from the backend API.
    const [mentors, setMentors] = useState([
        { name: 'Jane Smith', email: 'jane@webel.in', assigned: 5, status: 'Active' },
        { name: 'Mike Wilson', email: 'mike@webel.in', assigned: 3, status: 'Inactive' },
    ]);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    return (
        <div>
            <div className={styles.header}>
                <h1 className={styles.pageTitle}>Manage Mentors</h1>
                <Button onClick={() => setIsAddDialogOpen(true)} variant="primary">+ Add Mentor</Button>
            </div>
            <Card className={styles.tableCard}>
                <div className={styles.tableContainer}>
                    <table className={styles.mentorTable}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Assigned Applicants</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mentors.map(mentor => (
                                <tr key={mentor.email}>
                                    <td>{mentor.name}</td>
                                    <td>{mentor.email}</td>
                                    <td>{mentor.assigned}</td>
                                    <td>
                                        <span className={`${styles.status} ${styles[mentor.status.toLowerCase()]}`}>
                                            {mentor.status}
                                        </span>
                                    </td>
                                    <td className={styles.actionsCell}>
                                        <Button variant="secondary">Edit</Button>
                                        <Button variant="danger">Remove</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Dialog
                isOpen={isAddDialogOpen}
                onClose={() => setIsAddDialogOpen(false)}
                title="Add New Mentor"
                onConfirm={() => { alert('Mentor Added!'); setIsAddDialogOpen(false); }}
            >
                <div className={styles.formGrid}>
                    <input placeholder="Full Name" />
                    <input type="email" placeholder="Email Address" />
                    <select>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </Dialog>
        </div>
    );
};

export default ManageMentors;