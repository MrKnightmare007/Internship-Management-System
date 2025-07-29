import React, { useState } from 'react';
import styles from './Profile.module.css'; // Reusing the same CSS as applicant profile
import Card from './ui/Card';
import Button from './ui/Button';

const OrgProfile = () => {
    // TODO: Replace with an API call to fetch the coordinator's data
    const [profile, setProfile] = useState({
        username: 'coordinator.jane',
        userEmail: 'jane.smith@webel.in',
        userPhone: '9876543210'
    });
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div>
            <h1 className={styles.pageTitle}>Coordinator Profile</h1>
            <Card>
                <div className={styles.profileContent}>
                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input type="text" value={profile.username} disabled />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="email" value={profile.userEmail} disabled={!isEditing} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input type="tel" value={profile.userPhone} disabled={!isEditing} />
                    </div>
                    <div className={styles.actions}>
                        {isEditing 
                            ? <Button variant="primary">Save Changes</Button> 
                            : <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        }
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default OrgProfile;