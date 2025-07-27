package com.webel.ims;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity // **ADDED**: This is crucial for enabling Spring Web Security
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        // Assuming JwtAuthenticationFilter is a custom filter you have defined elsewhere
        // This filter should be designed to bypass the /api/auth/login endpoint,
        // as no JWT token will be present in the header for that request.
        return new JwtAuthenticationFilter();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // Disable CSRF protection as we are using stateless authentication (JWT)
            .csrf(csrf -> csrf.disable())
            
            // Add the CORS configuration
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new CorsConfiguration();
                corsConfig.addAllowedOrigin("http://localhost:3000"); // Allow frontend origin
                corsConfig.addAllowedMethod("*"); // Allow all HTTP methods
                corsConfig.addAllowedHeader("*"); // Allow all headers
                corsConfig.setAllowCredentials(true); // Allow credentials
                return corsConfig;
            }))
            
            // Define authorization rules for HTTP requests
            .authorizeHttpRequests(requests -> requests
                .requestMatchers("/api/auth/login").permitAll() // Allow unauthenticated access to the login endpoint
                .requestMatchers("/error").permitAll() // **ADDED**: Permit access to the error endpoint to see underlying exceptions
                .anyRequest().authenticated() // All other requests must be authenticated
            )
            
            // Configure session management to be stateless
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // Add the custom JWT authentication filter before the standard username/password filter
            .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
