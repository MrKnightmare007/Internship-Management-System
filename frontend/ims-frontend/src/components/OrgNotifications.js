import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './OrgNotifications.module.css';
import Card from './ui/Card';
import Loader from './ui/Loader';

const OrgNotifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/notifications/my-notifications')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setNotifications(response.data);
                } else {
                    setError('Failed to load notifications due to an invalid server response.');
                }
            })
            .catch(err => {
                console.error("Failed to fetch notifications:", err);
                setError('Could not load notifications. Please try again later.');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, []);

    const renderContent = () => {
        if (isLoading) {
            return <Loader />;
        }
        if (error) {
            return <p className={styles.errorText}>{error}</p>;
        }
        if (notifications.length === 0) {
            return <p className={styles.noItemsText}>You have no new notifications.</p>;
        }
        return (
            <div className={styles.notificationList}>
                {notifications.map(notif => (
                    <div key={notif.notificationId} className={styles.notificationItem}>
                        <div className={styles.itemHeader}>
                            <h3 className={styles.notificationTitle}>{notif.title}</h3>
                            <span className={styles.notificationDate}>
                                {new Date(notif.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <p className={styles.notificationMessage}>{notif.message}</p>
                        {notif.attachmentPath && (
                            <a 
                                href={`http://localhost:8080/uploads/${notif.attachmentPath.split(/[\\/]/).pop()}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.attachmentLink}
                            >
                                View Attachment
                            </a>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div>
            <h1 className={styles.pageTitle}>Notifications</h1>
            <Card>
                {renderContent()}
            </Card>
        </div>
    );
};

export default OrgNotifications;