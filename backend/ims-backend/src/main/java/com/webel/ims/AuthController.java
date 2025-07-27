package com.webel.ims;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
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

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Assume you have this for user_master

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Injects the secret key from your application.properties file
    @Value("${jwt.secret}")
    private String jwtSecret;

    // A Key object used for signing, generated from the secret string
    private Key getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> userOptional = userRepository.findByUsername(username); // Adjust to your repo method

        // Check if user exists, password matches, and user type is correct
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            if (passwordEncoder.matches(password, user.getUserPassword()) && "SUPER_ADMIN".equals(user.getUserType())) {
                
                // Generate the JWT token
                String token = Jwts.builder()
                        .setSubject(username)
                        .setIssuedAt(new Date())
                        .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 1 day expiration
                        .signWith(getSigningKey(), SignatureAlgorithm.HS512) // Use the secure key for signing
                        .compact();
                        
                return ResponseEntity.ok(Map.of("token", token));
            }
        }
        
        // If any check fails, return invalid credentials
        return ResponseEntity.status(401).body("Invalid credentials or insufficient permissions");
    }
}
