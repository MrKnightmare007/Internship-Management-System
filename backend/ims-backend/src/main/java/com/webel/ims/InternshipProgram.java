// backend/ims-backend/src/main/java/com/webel/ims/InternshipProgram.java
package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "internship_program_master")
public class InternshipProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "int_prog_id")
    private Integer intProgId;

    @Column(name = "int_prog_name", nullable = false)
    private String intProgName;

    @Column(name = "int_prog_description", columnDefinition = "TEXT")
    private String intProgDescription;

    @Column(name = "int_org_id", nullable = false)
    private Integer intOrgId;

    @Column(name = "int_coordinator_user_id", nullable = false)
    private Integer intCoordinatorUserId;

    @Column(name = "prog_start_date")
    private LocalDate progStartDate;

    @Column(name = "prog_end_date")
    private LocalDate progEndDate;

    // --- NEW FIELD ---
    @Column(name = "internship_amount")
    private Double internshipAmount;


    @Column(name = "program_application_start_date")
    private LocalDate programApplicationStartDate;

    @Column(name = "program_application_end_date")
    private LocalDate programApplicationEndDate;

    // e.g., OPEN, CLOSED, SUSPENDED
    @Column(name = "program_entry")
    private String programEntry;

    // e.g., FREE, PAID_BY_ORGANIZATION, PAID_BY_APPLICANT
    @Column(name = "program_type")
    private String programType;

    // e.g., ONLINE, OFFLINE, HYBRID
    @Column(name = "program_mode")
    private String programMode;

    // --- NEW FIELDS END ---

    @Column(name = "prog_duration_weeks")
    private Integer progDurationWeeks;

    @Column(name = "prog_max_applicants")
    private Integer progMaxApplicants;

    @Column(name = "prog_status", nullable = false)
    private String progStatus;
    
    @Column(name = "attachment_path")
    private String attachmentPath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // --- Getters and Setters ---
    public Integer getIntProgId() { return intProgId; }
    public void setIntProgId(Integer intProgId) { this.intProgId = intProgId; }
    public String getIntProgName() { return intProgName; }
    public void setIntProgName(String intProgName) { this.intProgName = intProgName; }
    public Double getInternshipAmount() { return internshipAmount; }
    public void setInternshipAmount(Double internshipAmount) { this.internshipAmount = internshipAmount; }
    public String getIntProgDescription() { return intProgDescription; }
    public void setIntProgDescription(String intProgDescription) { this.intProgDescription = intProgDescription; }
    public Integer getIntOrgId() { return intOrgId; }
    public void setIntOrgId(Integer intOrgId) { this.intOrgId = intOrgId; }
    public Integer getIntCoordinatorUserId() { return intCoordinatorUserId; }
    public void setIntCoordinatorUserId(Integer intCoordinatorUserId) { this.intCoordinatorUserId = intCoordinatorUserId; }
    public LocalDate getProgStartDate() { return progStartDate; }
    public void setProgStartDate(LocalDate progStartDate) { this.progStartDate = progStartDate; }
    public LocalDate getProgEndDate() { return progEndDate; }
    public void setProgEndDate(LocalDate progEndDate) { this.progEndDate = progEndDate; }
    public Integer getProgDurationWeeks() { return progDurationWeeks; }
    public void setProgDurationWeeks(Integer progDurationWeeks) { this.progDurationWeeks = progDurationWeeks; }
    public Integer getProgMaxApplicants() { return progMaxApplicants; }
    public void setProgMaxApplicants(Integer progMaxApplicants) { this.progMaxApplicants = progMaxApplicants; }
    public String getProgStatus() { return progStatus; }
    public void setProgStatus(String progStatus) { this.progStatus = progStatus; }
    public String getAttachmentPath() { return attachmentPath; }
    public void setAttachmentPath(String attachmentPath) { this.attachmentPath = attachmentPath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Getters and Setters for NEW fields
    public LocalDate getProgramApplicationStartDate() { return programApplicationStartDate; }
    public void setProgramApplicationStartDate(LocalDate programApplicationStartDate) { this.programApplicationStartDate = programApplicationStartDate; }
    public LocalDate getProgramApplicationEndDate() { return programApplicationEndDate; }
    public void setProgramApplicationEndDate(LocalDate programApplicationEndDate) { this.programApplicationEndDate = programApplicationEndDate; }
    public String getProgramEntry() { return programEntry; }
    public void setProgramEntry(String programEntry) { this.programEntry = programEntry; }
    public String getProgramType() { return programType; }
    public void setProgramType(String programType) { this.programType = programType; }
    public String getProgramMode() { return programMode; }
    public void setProgramMode(String programMode) { this.programMode = programMode; }
}