package com.webel.ims;

import java.time.LocalDateTime;

/**
 * DTO for safely sending notification data to the frontend.
 * This class acts as a clean data container, preventing serialization issues
 * that can occur with complex JPA/Hibernate entities.
 */
public class NotificationDto {

    private Integer notificationId;
    private String title;
    private String message;
    private String attachmentPath;
    private String status;
    private LocalDateTime createdAt;

    // A default constructor is required by many frameworks, including Jackson for JSON deserialization.
    public NotificationDto() {}

    /**
     * A convenient constructor to easily map a Notification entity to this DTO.
     * This is the primary way we will create instances of this class.
     * @param notification The JPA entity to convert.
     */
    public NotificationDto(Notification notification) {
        this.notificationId = notification.getNotificationId();
        this.title = notification.getTitle();
        this.message = notification.getMessage();
        this.attachmentPath = notification.getAttachmentPath();
        this.status = notification.getStatus();
        this.createdAt = notification.getCreatedAt();
    }

    // --- Standard Getters and Setters ---

    public Integer getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Integer notificationId) {
        this.notificationId = notificationId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAttachmentPath() {
        return attachmentPath;
    }

    public void setAttachmentPath(String attachmentPath) {
        this.attachmentPath = attachmentPath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
