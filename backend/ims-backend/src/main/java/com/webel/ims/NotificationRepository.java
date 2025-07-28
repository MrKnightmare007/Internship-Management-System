package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    
    // Finds all notifications for a specific recipient user ID, ordered by creation date descending.
    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Integer userId);
}
