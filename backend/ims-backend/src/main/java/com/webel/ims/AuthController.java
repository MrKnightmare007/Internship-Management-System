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

    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();
    private final Map<String, Long> otpExpiry = new ConcurrentHashMap<>();
    private static final long OTP_VALID_DURATION_MS = 5 * 60 * 1000;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;
    @Value("${jwt.secret}")
    private String jwtSecret;

    private Key getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --- NEW: Applicant Registration ---
    @PostMapping("/register")
    public ResponseEntity<?> registerApplicant(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String email = payload.get("email");
        String password = payload.get("password");

        if (userRepository.findByUsername(username).isPresent() || userRepository.findByUserEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Username or email already exists."));
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setUserEmail(email);
        newUser.setUserPassword(passwordEncoder.encode(password));
        newUser.setUserType("APPLICANT"); // Set user type
        newUser.setUserStatus("ACTIVE");   // Set default status

        userRepository.save(newUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Applicant registered successfully."));
    }

    // --- NEW: Applicant Login (No OTP) ---
    @PostMapping("/applicant-login")
    public ResponseEntity<?> applicantLogin(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getUserPassword()) && "APPLICANT".equals(user.getUserType())) {
                // Credentials are correct, issue token immediately
                String token = Jwts.builder()
                        .setSubject(username)
                        .setIssuedAt(new Date())
                        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day
                        .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                        .compact();
                return ResponseEntity.ok(Map.of("token", token));
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials.");
    }

    // --- SUPER ADMIN LOGIN (No Changes) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        // ... existing super admin login logic ...
        String username = credentials.get("username");
        String password = credentials.get("password");
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getUserPassword()) && "SUPER_ADMIN".equals(user.getUserType())) {
                String otp = String.format("%06d", new Random().nextInt(999999));
                otpStorage.put(username, otp);
                otpExpiry.put(username, System.currentTimeMillis() + OTP_VALID_DURATION_MS);
                try {
                    emailService.sendEmail("dassoumyadipta007@gmail.com", "Your IMS Login Verification Code", "Your One-Time Password is: " + otp);
                    return ResponseEntity.ok(Map.of("message", "Verification code sent to your email."));
                } catch (Exception e) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not send verification email.");
                }
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    // --- ORGANIZATION MASTER LOGIN (No Changes) ---
    @PostMapping("/org-login")
    public ResponseEntity<?> organizationLogin(@RequestBody Map<String, String> credentials) {
        // ... existing organization master login logic ...
        String username = credentials.get("username");
        String password = credentials.get("password");
        Integer orgId = Integer.parseInt(credentials.get("orgId"));
        Optional<User> userOptional = userRepository.findByUsername(username);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getUserPassword()) && "ORGANIZATION_MASTER".equals(user.getUserType()) && user.getOrganization() != null && user.getOrganization().getOrgId().equals(orgId)) {
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

    // --- OTP VERIFICATION (No Changes) ---
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> payload) {
        // ... existing OTP verification logic ...
        String username = payload.get("username");
        String otp = payload.get("otp");
        String storedOtp = otpStorage.get(username);
        Long expiryTime = otpExpiry.get(username);
        if (storedOtp != null && storedOtp.equals(otp) && System.currentTimeMillis() < expiryTime) {
            otpStorage.remove(username);
            otpExpiry.remove(username);
            String token = Jwts.builder()
                    .setSubject(username)
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                    .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                    .compact();
            return ResponseEntity.ok(Map.of("token", token));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired OTP.");
    }
}