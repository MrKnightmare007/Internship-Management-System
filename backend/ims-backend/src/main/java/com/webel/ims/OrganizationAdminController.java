package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organization-admins")
public class OrganizationAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService;

    private final String UPLOAD_DIR = "./uploads/";

    @PostMapping("/create")
    public ResponseEntity<?> createOrganizationAdmin(
            @RequestParam("username") String username,
            @RequestParam("email") String email,
            @RequestParam("orgId") Integer orgId,
            @RequestParam("internshipName") String internshipName,
            @RequestParam("orgName") String orgName,
            @RequestParam(value = "advertisementDocument", required = false) MultipartFile advertisementDocument) {
        try {
            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Username is already taken."));
            }
            if (userRepository.findByUserEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Email is already in use."));
            }

            Optional<OrganizationMaster> organization = organizationRepository.findById(orgId);
            if (organization.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Error: Organization not found."));
            }

            // Create new user
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setUserEmail(email);
            newUser.setUserPassword(passwordEncoder.encode("org_admin"));
            newUser.setUserType("ORGANIZATION_MASTER");
            newUser.setUserStatus("ACTIVE");
            newUser.setOrganization(organization.get());

            userRepository.save(newUser);

            // Handle file upload if provided
            String attachmentPath = null;
            if (advertisementDocument != null && !advertisementDocument.isEmpty()) {
                attachmentPath = saveFile(advertisementDocument);
            }

            // Get current super admin username
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String superAdminUsername = authentication.getName();

            // Send welcome email
            sendWelcomeEmail(email, username, orgName, internshipName, attachmentPath, superAdminUsername);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Coordinator created successfully and welcome email sent."));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "A user with this username or email already exists."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected server error occurred: " + e.getMessage()));
        }
    }

    private String saveFile(MultipartFile file) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            String newFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, file.getBytes());
            return path.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private void sendWelcomeEmail(String coordinatorEmail, String username, String orgName, String internshipName, String attachmentPath, String superAdminUsername) {
        try {
            String subject = "Welcome - Coordinator Account Created for " + internshipName;
            
            String message = String.format(
                "Respected Madam/Sir,\n\n" +
                "Good Morning!\n\n" +
                "I am very happy to inform you that our CoE (%s) has started onboarding of Interns for %s. " +
                "You have been appointed as the coordinator for this internship program.\n\n" +
                "Your login credentials are:\n" +
                "Username: %s\n" +
                "Default Password: org_admin\n\n" +
                "Please log in to the system and change your password immediately for security reasons.\n\n" +
                "You can now create and manage internship programs through the coordinator dashboard.\n\n" +
                "%s" +
                "\nThanks & Regards,\n" +
                "%s\n" +
                "Super Admin",
                orgName,
                internshipName,
                username,
                attachmentPath != null ? "The advertisement document is attached below." : "",
                superAdminUsername
            );

            emailService.sendEmailWithAttachment(coordinatorEmail, subject, message, attachmentPath);
        } catch (Exception e) {
            System.err.println("Failed to send welcome email: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @PutMapping("/update")
    public ResponseEntity<?> updateOrganizationAdmin(@RequestBody Map<String, Object> payload) {
        try {
            Integer userId = (Integer) payload.get("userId");
            String username = (String) payload.get("username");
            String email = (String) payload.get("email");
            String orgName = (String) payload.get("orgName");

            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Error: User not found."));
            }

            User user = userOptional.get();
            
            // Check if username is taken by another user
            Optional<User> existingUser = userRepository.findByUsername(username);
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Username is already taken."));
            }
            
            // Check if email is taken by another user
            existingUser = userRepository.findByUserEmail(email);
            if (existingUser.isPresent() && !existingUser.get().getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Email is already in use."));
            }

            // Update user details
            user.setUsername(username);
            user.setUserEmail(email);
            userRepository.save(user);

            // Get current super admin username
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String superAdminUsername = authentication.getName();

            // Send update notification email
            sendUpdateNotificationEmail(email, username, orgName, superAdminUsername);

            return ResponseEntity.ok(Map.of("message", "Coordinator updated successfully."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected server error occurred: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete/{userId}")
    public ResponseEntity<?> deleteOrganizationAdmin(@PathVariable Integer userId, @RequestBody Map<String, String> payload) {
        try {
            String orgName = payload.get("orgName");
            
            Optional<User> userOptional = userRepository.findById(userId);
            if (userOptional.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Error: User not found."));
            }

            User user = userOptional.get();
            String userEmail = user.getUserEmail();
            String username = user.getUsername();

            // Delete the user
            userRepository.deleteById(userId);

            // Get current super admin username
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String superAdminUsername = authentication.getName();

            // Send deletion notification email
            sendDeletionNotificationEmail(userEmail, username, orgName, superAdminUsername);

            return ResponseEntity.ok(Map.of("message", "Coordinator deleted successfully."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected server error occurred: " + e.getMessage()));
        }
    }

    // **FIXED**: This endpoint now returns a list of UserDto objects instead of User entities.
    @GetMapping("/by-org/{orgId}")
    public ResponseEntity<List<UserDto>> getAdminsByOrg(@PathVariable Integer orgId) {
        List<User> users = userRepository.findByOrganizationOrgId(orgId);
        
        // Convert the list of User entities to a list of safe UserDto objects
        List<UserDto> userDtos = users.stream()
                                      .map(UserDto::new) // Uses the constructor UserDto(User user)
                                      .collect(Collectors.toList());
                                      
        return ResponseEntity.ok(userDtos);
    }

    private void sendUpdateNotificationEmail(String coordinatorEmail, String username, String orgName, String superAdminUsername) {
        try {
            String subject = "Account Updated - Coordinator Profile";
            
            String message = String.format(
                "Respected Madam/Sir,\n\n" +
                "Good Morning!\n\n" +
                "This is to inform you that your coordinator account details have been updated by the Super Admin.\n\n" +
                "Updated Account Details:\n" +
                "Username: %s\n" +
                "Organization: %s\n\n" +
                "If you have any questions or concerns about these changes, please contact the administration.\n\n" +
                "Thanks & Regards,\n" +
                "%s\n" +
                "Super Admin",
                username,
                orgName,
                superAdminUsername
            );

            emailService.sendEmailWithAttachment(coordinatorEmail, subject, message, null);
        } catch (Exception e) {
            System.err.println("Failed to send update notification email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendDeletionNotificationEmail(String coordinatorEmail, String username, String orgName, String superAdminUsername) {
        try {
            String subject = "Account Deactivated - Coordinator Access Removed";
            
            String message = String.format(
                "Respected Madam/Sir,\n\n" +
                "Good Morning!\n\n" +
                "This is to inform you that your coordinator account (%s) for %s has been deactivated by the Super Admin.\n\n" +
                "Your access to the internship management system has been removed. If you believe this is an error or have any questions, please contact the administration.\n\n" +
                "Thank you for your service as a coordinator.\n\n" +
                "Thanks & Regards,\n" +
                "%s\n" +
                "Super Admin",
                username,
                orgName,
                superAdminUsername
            );

            emailService.sendEmailWithAttachment(coordinatorEmail, subject, message, null);
        } catch (Exception e) {
            System.err.println("Failed to send deletion notification email: " + e.getMessage());
            e.printStackTrace();
        }
    }
}