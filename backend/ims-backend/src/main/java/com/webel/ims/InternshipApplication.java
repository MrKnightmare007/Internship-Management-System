package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internship_application_master")
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "applicant_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User applicantUser; // Renamed for clarity

    @ManyToOne
    @JoinColumn(name = "prog_id", nullable = false)
    private InternshipProgram program;

    // --- NEW FIELDS MATCHING YOUR DATABASE SCHEMA ---
    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "dob")
    private String dob;

    @Column(name = "applicant_email", nullable = false)
    private String applicantEmail;

    @Column(name = "applicant_phone")
    private String applicantPhone;

    @Column(name = "communication_address", columnDefinition = "TEXT")
    private String communicationAddress;

    @Column(name = "college_name_address", columnDefinition = "TEXT")
    private String collegeNameAddress;

    @Column(name = "university_name")
    private String universityName;

    @Column(name = "university_reg_no")
    private String universityRegNo;

    @Column(name = "current_course")
    private String currentCourse;

    @Column(name = "current_semester")
    private String currentSemester;

    @Column(name = "academic_details", columnDefinition = "TEXT")
    private String academicDetails; // Storing the academic records array as a JSON string

    @Column(name = "application_status", nullable = false)
    private String status;

    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        applicationDate = now;
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // --- GETTERS AND SETTERS FOR ALL FIELDS ---
    // (You can generate these in your IDE or write them manually)

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public User getApplicantUser() { return applicantUser; }
    public void setApplicantUser(User applicantUser) { this.applicantUser = applicantUser; }
    public InternshipProgram getProgram() { return program; }
    public void setProgram(InternshipProgram program) { this.program = program; }
    public String getApplicantName() { return applicantName; }
    public void setApplicantName(String applicantName) { this.applicantName = applicantName; }
    public String getDob() { return dob; }
    public void setDob(String dob) { this.dob = dob; }
    public String getApplicantEmail() { return applicantEmail; }
    public void setApplicantEmail(String applicantEmail) { this.applicantEmail = applicantEmail; }
    public String getApplicantPhone() { return applicantPhone; }
    public void setApplicantPhone(String applicantPhone) { this.applicantPhone = applicantPhone; }
    public String getCommunicationAddress() { return communicationAddress; }
    public void setCommunicationAddress(String communicationAddress) { this.communicationAddress = communicationAddress; }
    public String getCollegeNameAddress() { return collegeNameAddress; }
    public void setCollegeNameAddress(String collegeNameAddress) { this.collegeNameAddress = collegeNameAddress; }
    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }
    public String getUniversityRegNo() { return universityRegNo; }
    public void setUniversityRegNo(String universityRegNo) { this.universityRegNo = universityRegNo; }
    public String getCurrentCourse() { return currentCourse; }
    public void setCurrentCourse(String currentCourse) { this.currentCourse = currentCourse; }
    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }
    public String getAcademicDetails() { return academicDetails; }
    public void setAcademicDetails(String academicDetails) { this.academicDetails = academicDetails; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}