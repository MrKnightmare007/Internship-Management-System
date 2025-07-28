package com.webel.ims;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    // --- In-memory storage for OTPs. For production, a distributed cache like Redis is recommended. ---
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiry = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION_MS = 5 * 60 * 1000; // 5 minutes

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EmailService emailService; // Inject the EmailService

    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
    //SUPER-ADMIN LOGIN
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // Verify password and ensure the user is a SUPER_ADMIN
            if (passwordEncoder.matches(password, user.getUserPassword()) && "SUPER_ADMIN".equals(user.getUserType())) {
                
                // --- Step 1: Password is correct. Generate and send OTP. ---
                String otp = String.format("%06d", new Random().nextInt(999999));
                
                // Store the OTP and its expiry time
                otpStorage.put(username, otp);
                otpExpiry.put(username, System.currentTimeMillis() + OTP_VALID_DURATION_MS);

                try {
                    // Send the OTP via email to the hardcoded super admin address
                    String recipientEmail = "dassoumyadipta007@gmail.com";
                    String subject = "Your WEBEL IMS Super-Admin Login Verification Code";
                    String text = "Your One-Time Password for logging into the Super Admin Dashboard of Internship Management System is: " + otp
                                  + "\nThis code is valid for 5 minutes.";
                    
                    emailService.sendEmail(recipientEmail, subject, text);
                    
                    // Return a success message instead of a token
                    return ResponseEntity.ok(Map.of("message", "Verification code sent to the super-admin email."));

                } catch (Exception e) {
                    System.err.println("Could not send OTP email: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not send verification email. Please check server logs and configuration.");
                }
            }
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
 // --- NEW: ORGANIZATION MASTER LOGIN ---
 @PostMapping("/org-login")
 public ResponseEntity<?> organizationLogin(@RequestBody Map<String, String> credentials) {
     String username = credentials.get("username");
     String password = credentials.get("password");
     Integer orgId = Integer.parseInt(credentials.get("orgId"));

     Optional<User> userOptional = userRepository.findByUsername(username);

     if (userOptional.isPresent()) {
         User user = userOptional.get();
         // Verify password, user type, AND that the user belongs to the selected organization
         if (passwordEncoder.matches(password, user.getUserPassword()) &&
             "ORGANIZATION_MASTER".equals(user.getUserType()) &&
             user.getOrganization() != null &&
             user.getOrganization().getOrgId().equals(orgId)) {

             // Credentials are correct, now send OTP to this user's email
             String otp = String.format("%06d", new Random().nextInt(999999));
             otpStorage.put(username, otp);
             otpExpiry.put(username, System.currentTimeMillis() + OTP_VALID_DURATION_MS);

             try {
                 emailService.sendEmail(user.getUserEmail(), "Your IMS Login Verification Code", "Your One-Time Password is: " + otp);
                 return ResponseEntity.ok(Map.of("message", "Verification code sent to your email."));
             } catch (Exception e) {
                 return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not send verification email.");
             }
         }
     }
     return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials for the selected organization.");
 }
 //OTP VERIFICATION
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String otp = payload.get("otp");

        String storedOtp = otpStorage.get(username);
        Long expiryTime = otpExpiry.get(username);

        // Check if OTP is valid and not expired
        if (storedOtp != null && storedOtp.equals(otp) && System.currentTimeMillis() < expiryTime) {
            
            // --- Step 2: OTP is correct. Generate and return the JWT token. ---
            otpStorage.remove(username); // OTP is single-use, remove it
            otpExpiry.remove(username);

            String token = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiration
                    .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                    .compact();
            
            return ResponseEntity.ok(Map.of("token", token));
        }

        // If OTP is invalid or expired
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired OTP.");
    }
}
