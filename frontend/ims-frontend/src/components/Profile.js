import React, { useState, useEffect } from 'react';
import styles from './Profile.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

const Profile = () => {
    // TODO: Replace with an API call to fetch current user's data
    const [profile, setProfile] = useState({
        username: 'student.test',
        userEmail: 'student.test@example.com',
        userPhone: '1234567890'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        // TODO: Implement API call to update the user profile
        console.log('Saving profile:', profile);
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div>
            <h1 className={styles.pageTitle}>My Profile</h1>
            <Card>
                <div className={styles.profileContent}>
                    <div className={styles.inputGroup}>
                        <label>Username</label>
                        <input type="text" value={profile.username} disabled />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input type="email" name="userEmail" value={profile.userEmail} onChange={handleInputChange} disabled={!isEditing} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Phone Number</label>
                        <input type="tel" name="userPhone" value={profile.userPhone} onChange={handleInputChange} disabled={!isEditing} />
                    </div>

                    <div className={styles.actions}>
                        {isEditing ? (
                            <>
                                <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                                <Button variant="primary" onClick={handleSave}>Save Changes</Button>
                            </>
                        ) : (
                            <Button variant="primary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                        )}
                    </div>
                    {message && <p className={styles.successMessage}>{message}</p>}
                </div>
            </Card>
        </div>
    );
};

export default Profile;