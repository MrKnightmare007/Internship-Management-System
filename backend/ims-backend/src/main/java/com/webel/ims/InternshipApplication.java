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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User applicantUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prog_id", nullable = false)
    private InternshipProgram program;

    // --- Form Fields ---
    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "dob")
    private String dob;

    @Column(name = "applicant_email", nullable = false)
    private String applicantEmail;

    @Column(name = "applicant_phone")
    private String applicantPhone;

    @Column(name = "current_address", columnDefinition = "TEXT")
    private String currentAddress;

    @Column(name = "permanent_address", columnDefinition = "TEXT")
    private String permanentAddress;
    
    @Column(name = "city_of_domicile")
    private String cityOfDomicile;

    @Column(name = "state_of_domicile")
    private String stateOfDomicile;

    @Column(name = "college_name_address", columnDefinition = "TEXT")
    private String collegeNameAddress;

    @Column(name = "university_name")
    private String universityName;

    @Column(name = "university_reg_no")
    private String universityRegNo;

    @Column(name = "university_roll_no")
    private String universityRollNo;

    @Column(name = "current_course")
    private String currentCourse;

    @Column(name = "current_semester")
    private String currentSemester;

    @Column(name = "academic_details", columnDefinition = "TEXT")
    private String academicDetails;

    // --- Document Fields ---
    @Column(name = "government_id_type")
    private String governmentIdType;

    @Column(name = "government_id_path")
    private String governmentIdPath;

    @Column(name = "cover_letter_path")
    private String coverLetterPath;
    
    @Column(name = "class_x_marksheet_path")
    private String classXMarksheetPath;

    @Column(name = "class_xii_marksheet_path")
    private String classXIIMarksheetPath;

    // --- Status and Timestamps ---
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
    
    // --- Getters and Setters ---
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
    public String getCurrentAddress() { return currentAddress; }
    public void setCurrentAddress(String currentAddress) { this.currentAddress = currentAddress; }
    public String getPermanentAddress() { return permanentAddress; }
    public void setPermanentAddress(String permanentAddress) { this.permanentAddress = permanentAddress; }
    public String getCityOfDomicile() { return cityOfDomicile; }
    public void setCityOfDomicile(String cityOfDomicile) { this.cityOfDomicile = cityOfDomicile; }
    public String getStateOfDomicile() { return stateOfDomicile; }
    public void setStateOfDomicile(String stateOfDomicile) { this.stateOfDomicile = stateOfDomicile; }
    public String getCollegeNameAddress() { return collegeNameAddress; }
    public void setCollegeNameAddress(String collegeNameAddress) { this.collegeNameAddress = collegeNameAddress; }
    public String getUniversityName() { return universityName; }
    public void setUniversityName(String universityName) { this.universityName = universityName; }
    public String getUniversityRegNo() { return universityRegNo; }
    public void setUniversityRegNo(String universityRegNo) { this.universityRegNo = universityRegNo; }
    public String getUniversityRollNo() { return universityRollNo; }
    public void setUniversityRollNo(String universityRollNo) { this.universityRollNo = universityRollNo; }
    public String getCurrentCourse() { return currentCourse; }
    public void setCurrentCourse(String currentCourse) { this.currentCourse = currentCourse; }
    public String getCurrentSemester() { return currentSemester; }
    public void setCurrentSemester(String currentSemester) { this.currentSemester = currentSemester; }
    public String getAcademicDetails() { return academicDetails; }
    public void setAcademicDetails(String academicDetails) { this.academicDetails = academicDetails; }
    public String getGovernmentIdType() { return governmentIdType; }
    public void setGovernmentIdType(String governmentIdType) { this.governmentIdType = governmentIdType; }
    public String getGovernmentIdPath() { return governmentIdPath; }
    public void setGovernmentIdPath(String governmentIdPath) { this.governmentIdPath = governmentIdPath; }
    public String getCoverLetterPath() { return coverLetterPath; }
    public void setCoverLetterPath(String coverLetterPath) { this.coverLetterPath = coverLetterPath; }
    public String getClassXMarksheetPath() { return classXMarksheetPath; }
    public void setClassXMarksheetPath(String classXMarksheetPath) { this.classXMarksheetPath = classXMarksheetPath; }
    public String getClassXIIMarksheetPath() { return classXIIMarksheetPath; }
    public void setClassXIIMarksheetPath(String classXIIMarksheetPath) { this.classXIIMarksheetPath = classXIIMarksheetPath; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getApplicationDate() { return applicationDate; }
    public void setApplicationDate(LocalDateTime applicationDate) { this.applicationDate = applicationDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
