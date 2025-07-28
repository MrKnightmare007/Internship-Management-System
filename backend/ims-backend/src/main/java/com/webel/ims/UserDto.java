package com.webel.ims;

/**
 * A Data Transfer Object (DTO) for safely sending user information to the frontend.
 * This prevents serialization issues with lazy-loaded JPA entities.
 */
public class UserDto {

    private Integer userId;
    private String username;
    private String userEmail;
    private String userType;
    private String userStatus;

    // We can include the organization ID and name if needed by the frontend
    private Integer orgId;
    private String orgName;

    // Default constructor is needed for some frameworks
    public UserDto() {}

    // Constructor to easily map from a User entity to this DTO
    public UserDto(User user) {
        this.userId = user.getUserId();
        this.username = user.getUsername();
        this.userEmail = user.getUserEmail();
        this.userType = user.getUserType();
        this.userStatus = user.getUserStatus();
        
        // Safely access the organization details
        if (user.getOrganization() != null) {
            this.orgId = user.getOrganization().getOrgId();
            this.orgName = user.getOrganization().getOrgName();
        }
    }

    // --- Getters and Setters ---
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public String getUserStatus() { return userStatus; }
    public void setUserStatus(String userStatus) { this.userStatus = userStatus; }
    public Integer getOrgId() { return orgId; }
    public void setOrgId(Integer orgId) { this.orgId = orgId; }
    public String getOrgName() { return orgName; }
    public void setOrgName(String orgName) { this.orgName = orgName; }
}