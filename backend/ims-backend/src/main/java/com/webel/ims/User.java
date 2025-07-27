package com.webel.ims;

import jakarta.persistence.*;

@Entity
@Table(name = "user_master")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "username")
    private String username;

    @Column(name = "user_password")
    private String userPassword;

    @Column(name = "user_type")
    private String userType;

    // Getters/setters
    public String getUsername() { return username; }
    public String getUserPassword() { return userPassword; }
    public String getUserType() { return userType; }
    // Add others as needed
}
