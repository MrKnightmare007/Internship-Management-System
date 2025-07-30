package com.webel.ims;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

@Configuration
@EnableWebSecurity
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
        return new JwtAuthenticationFilter();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers("/uploads/**");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new CorsConfiguration();
                    // Local development URLs
                    corsConfig.addAllowedOrigin("http://localhost:3000");
                    corsConfig.addAllowedOrigin("http://admin.localhost:3000");
                    corsConfig.addAllowedOrigin("http://organization.localhost:3000");

                    // Add your Vercel Production URLs
                    corsConfig.addAllowedOrigin("https://dev-internship-management-system.vercel.app"); // Your main
                                                                                                           // site
                    corsConfig.addAllowedOrigin("https://admin-dev-internship-management-system.vercel.app/"); // Your admin site (or whatever
                                                                                       // you named it)
                    corsConfig.addAllowedOrigin("https://organization-dev-internship-management-system.vercel.app/"); // Your org site (or whatever you
                                                                                     // named it)

                    corsConfig.addAllowedMethod("*");
                    corsConfig.addAllowedHeader("*");
                    corsConfig.setAllowCredentials(true);
                    return corsConfig;
                }))

                .authorizeHttpRequests(requests -> requests
                        // Allow all authentication endpoints, including new applicant
                        // registration/login
                        .requestMatchers("/api/auth/**").permitAll()

                        // Allow public GET requests for organizations and programs
                        .requestMatchers(HttpMethod.GET, "/api/organizations", "/api/programs/public-list").permitAll()

                        // --- ADD THIS LINE ---
                        // Allow UptimeRobot to make HEAD requests to keep the server alive
                        .requestMatchers(HttpMethod.HEAD, "/api/organizations").permitAll()
                        .requestMatchers("/api/applications/**").authenticated()
                        .requestMatchers("/error").permitAll()
                        .anyRequest().authenticated())

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}