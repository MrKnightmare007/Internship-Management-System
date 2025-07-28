package com.webel.ims;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    // Logger for better debugging
    private static final Logger logger = LoggerFactory.getLogger(NotificationController.class);

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    private final String UPLOAD_DIR = "./uploads/";

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestParam("recipientId") Integer recipientId,
            @RequestParam("title") String title,
            @RequestParam("message") String message,
            @RequestParam(value = "file", required = false) MultipartFile file) {

        Optional<User> recipientOptional = userRepository.findById(recipientId);
        if (recipientOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Recipient user not found.");
        }
        User recipient = recipientOptional.get();

        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);

        String filePath = null;
        if (file != null && !file.isEmpty()) {
            try {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                    uploadDir.mkdirs();
                }

                String newFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR + newFileName);
                Files.write(path, file.getBytes());
                filePath = path.toString();
                notification.setAttachmentPath(filePath);

            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("File upload failed: " + e.getMessage());
            }
        }

        notificationRepository.save(notification);

        try {
            emailService.sendEmailWithAttachment(recipient.getUserEmail(), title, message, filePath);
        } catch (Exception e) {
            System.err.println("Could not send notification email: " + e.getMessage());
        }

        return ResponseEntity.status(HttpStatus.CREATED).body("Notification sent successfully.");
    }

    @GetMapping("/my-notifications")
    public ResponseEntity<?> getMyNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Defensive check for authentication
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getName())) {
            logger.warn("Attempt to fetch notifications by an unauthenticated user.");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User is not authenticated.");
        }

        String currentUsername = authentication.getName();
        logger.info("Fetching notifications for user: {}", currentUsername);

        Optional<User> userOptional = userRepository.findByUsername(currentUsername);
        if (userOptional.isEmpty()) {
            logger.error("Authenticated user '{}' could not be found in the database.", currentUsername);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }
        User currentUser = userOptional.get();

        try {
            // Fetch the raw notification entities from the database
            List<Notification> notifications = notificationRepository
                    .findByRecipientUserIdOrderByCreatedAtDesc(currentUser.getUserId());
            logger.info("Found {} notifications for user ID: {}", notifications.size(), currentUser.getUserId());

            // Manually convert them to safe DTOs
            List<NotificationDto> notificationDtos = notifications.stream()
                    .map(NotificationDto::new)
                    .collect(Collectors.toList());

            // Explicitly return the list of DTOs
            return ResponseEntity.ok(notificationDtos);

        } catch (Exception e) {
            // If any part of the process fails, log the error and return a 500 status
            logger.error("A critical error occurred while fetching or serializing notifications for user {}: {}",
                    currentUsername, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while processing your request.");
        }
    }
}