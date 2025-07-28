package com.webel.ims;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.Key;

// Make this a Spring Component to allow for dependency injection
@Component 
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    // Inject the secret from application.properties
    @Value("${jwt.secret}")
    private String jwtSecret;

    // This method creates the signing key. It's identical to the one in AuthController
    // to ensure the same key is used for signing and validation.
    private Key getSigningKey() {
        byte[] keyBytes = this.jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 1. Get the Authorization header
        final String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        // 2. Get the token from the header
        final String token = header.substring(7);
        String username = null;

        try {
            // 3. Validate the token using the correct, secure key
            Claims claims = Jwts.parserBuilder()
                                .setSigningKey(getSigningKey()) // Use the secure key
                                .build()
                                .parseClaimsJws(token)
                                .getBody();
            username = claims.getSubject();
        } catch (Exception e) {
            // e.g., Token expired, invalid signature, etc.
            // The context will remain unauthenticated
            logger.error("JWT Token validation error: " + e.getMessage());
        }

        // 4. If token is valid, set the authentication in the security context
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // NOTE: In a real app, you'd load UserDetails from a service here
            // For this setup, we trust the token and create a simple authentication object
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                username, 
                null, 
                null // No authorities are being passed for now
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }
        
        chain.doFilter(request, response);
    }
}
