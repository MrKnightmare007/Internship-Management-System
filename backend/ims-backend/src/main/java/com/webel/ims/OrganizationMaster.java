package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "organization_master")
public class OrganizationMaster {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "org_id")
    private Integer orgId;

    @Column(name = "org_name", nullable = false)
    private String orgName;

    @Column(name = "org_address")
    private String orgAddress;

    @Column(name = "org_contact_email")
    private String orgContactEmail;

    @Column(name = "org_contact_phone")
    private String orgContactPhone;

    @Column(name = "org_website")
    private String orgWebsite;

    @Column(name = "org_status", nullable = false)
    private String orgStatus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Default no-arg constructor
    public OrganizationMaster() {}

    // Optional multi-arg constructor for manual creation (e.g., in tests)
    public OrganizationMaster(String orgName, String orgAddress, String orgContactEmail, 
                              String orgContactPhone, String orgWebsite, String orgStatus) {
        this.orgName = orgName;
        this.orgAddress = orgAddress;
        this.orgContactEmail = orgContactEmail;
        this.orgContactPhone = orgContactPhone;
        this.orgWebsite = orgWebsite;
        this.orgStatus = orgStatus;
    }

    // Getters and Setters
    public Integer getOrgId() {
        return orgId;
    }

    public void setOrgId(Integer orgId) {
        this.orgId = orgId;
    }

    public String getOrgName() {
        return orgName;
    }

    public void setOrgName(String orgName) {
        this.orgName = orgName;
    }

    public String getOrgAddress() {
        return orgAddress;
    }

    public void setOrgAddress(String orgAddress) {
        this.orgAddress = orgAddress;
    }

    public String getOrgContactEmail() {
        return orgContactEmail;
    }

    public void setOrgContactEmail(String orgContactEmail) {
        this.orgContactEmail = orgContactEmail;
    }

    public String getOrgContactPhone() {
        return orgContactPhone;
    }

    public void setOrgContactPhone(String orgContactPhone) {
        this.orgContactPhone = orgContactPhone;
    }

    public String getOrgWebsite() {
        return orgWebsite;
    }

    public void setOrgWebsite(String orgWebsite) {
        this.orgWebsite = orgWebsite;
    }

    public String getOrgStatus() {
        return orgStatus;
    }

    public void setOrgStatus(String orgStatus) {
        this.orgStatus = orgStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}