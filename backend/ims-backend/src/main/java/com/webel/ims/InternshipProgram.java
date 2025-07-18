package com.webel.ims;

import jakarta.persistence.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Entity
@Table(name = "internship_program_master")
public class InternshipProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "int_prog_id")
    private Integer intProgId;

    @Column(name = "int_prog_name", nullable = false)
    private String intProgName;

    @Column(name = "int_prog_description")
    private String intProgDescription;

    @Column(name = "int_org_id", nullable = false)
    private Integer intOrgId;

    @Column(name = "int_coordinator_user_id", nullable = false)
    private Integer intCoordinatorUserId;

    @Column(name = "prog_start_date", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate progStartDate;

    @Column(name = "prog_end_date", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate progEndDate;

    @Column(name = "prog_duration_weeks", nullable = false)
    private Integer progDurationWeeks;

    @Column(name = "prog_max_applicants", nullable = false)
    private Integer progMaxApplicants;

    @Column(name = "prog_status", nullable = false)
    private String progStatus;  // Maps to ENUM values like 'ACTIVE', 'DRAFT'

    @Column(name = "created_at", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @Column(name = "updated_at", nullable = false)
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private LocalDate updatedAt;

    // Default no-arg constructor (required for JPA and JSON deserialization)
    public InternshipProgram() {}

    // Multi-arg constructor for static data or manual instantiation
    public InternshipProgram(Integer intProgId, String intProgName, String intProgDescription, 
                             Integer intOrgId, Integer intCoordinatorUserId, 
                             LocalDate progStartDate, LocalDate progEndDate, 
                             Integer progDurationWeeks, Integer progMaxApplicants, 
                             String progStatus, LocalDate createdAt, LocalDate updatedAt) {
        this.intProgId = intProgId;
        this.intProgName = intProgName;
        this.intProgDescription = intProgDescription;
        this.intOrgId = intOrgId;
        this.intCoordinatorUserId = intCoordinatorUserId;
        this.progStartDate = progStartDate;
        this.progEndDate = progEndDate;
        this.progDurationWeeks = progDurationWeeks;
        this.progMaxApplicants = progMaxApplicants;
        this.progStatus = progStatus;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Integer getIntProgId() {
        return intProgId;
    }

    public void setIntProgId(Integer intProgId) {
        this.intProgId = intProgId;
    }

    public String getIntProgName() {
        return intProgName;
    }

    public void setIntProgName(String intProgName) {
        this.intProgName = intProgName;
    }

    public String getIntProgDescription() {
        return intProgDescription;
    }

    public void setIntProgDescription(String intProgDescription) {
        this.intProgDescription = intProgDescription;
    }

    public Integer getIntOrgId() {
        return intOrgId;
    }

    public void setIntOrgId(Integer intOrgId) {
        this.intOrgId = intOrgId;
    }

    public Integer getIntCoordinatorUserId() {
        return intCoordinatorUserId;
    }

    public void setIntCoordinatorUserId(Integer intCoordinatorUserId) {
        this.intCoordinatorUserId = intCoordinatorUserId;
    }

    public LocalDate getProgStartDate() {
        return progStartDate;
    }

    public void setProgStartDate(LocalDate progStartDate) {
        this.progStartDate = progStartDate;
    }

    public LocalDate getProgEndDate() {
        return progEndDate;
    }

    public void setProgEndDate(LocalDate progEndDate) {
        this.progEndDate = progEndDate;
    }

    public Integer getProgDurationWeeks() {
        return progDurationWeeks;
    }

    public void setProgDurationWeeks(Integer progDurationWeeks) {
        this.progDurationWeeks = progDurationWeeks;
    }

    public Integer getProgMaxApplicants() {
        return progMaxApplicants;
    }

    public void setProgMaxApplicants(Integer progMaxApplicants) {
        this.progMaxApplicants = progMaxApplicants;
    }

    public String getProgStatus() {
        return progStatus;
    }

    public void setProgStatus(String progStatus) {
        this.progStatus = progStatus;
    }

    public LocalDate getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDate createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDate updatedAt) {
        this.updatedAt = updatedAt;
    }
}
