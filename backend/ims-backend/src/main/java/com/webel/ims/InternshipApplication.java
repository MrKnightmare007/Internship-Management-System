// backend/ims-backend/src/main/java/com/webel/ims/InternshipApplication.java
package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "internship_application_master")
public class InternshipApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "applicant_name", nullable = false)
    private String applicantName;

    @Column(name = "applicant_email", nullable = false)
    private String applicantEmail;

    @Column(name = "applicant_phone", nullable = false)
    private String applicantPhone;

    @Column(name = "communication_address", nullable = false)
    private String currentAddress;

    @Column(name = "university_roll_no", nullable = false)
    private String universityRollNo;

    @Column(name = "dob", nullable = false)
    private String dob;

    @Column(name = "college_name_address", nullable = false)
    private String collegeNameAddress;

    @Column(name = "university_name", nullable = false)
    private String universityName;

    @Column(name = "current_course", nullable = false)
    private String currentCourse;

    @Column(name = "current_semester", nullable = false)
    private String currentSemester;

    @Column(name = "city_of_domicile", nullable = false)
    private String cityOfDomicile;

    @Column(name = "state_of_domicile", nullable = false)
    private String stateOfDomicile;

    @Column(name = "government_id_type", nullable = false)
    private String governmentIdType;

    @Column(name = "academic_details", nullable = false)
    private String academicDetails;

    @Column(name = "prog_id", nullable = false)
    private Long progId;

    @Column(name = "aadhar_card_path", nullable = false)
    private String aadharCardPath;

    @Column(name = "class_x_marksheet_path", nullable = false)
    private String classXMarksheetPath;

    @Column(name = "class_xii_marksheet_path", nullable = false)
    private String classXIIMarksheetPath;

    @Column(name = "cover_letter_path")
    private String coverLetterPath;

    @Column(name = "application_status", nullable = false)
    private String applicationStatus;

    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getApplicantName() {
        return applicantName;
    }

    public void setApplicantName(String applicantName) {
        this.applicantName = applicantName;
    }

    public String getApplicantEmail() {
        return applicantEmail;
    }

    public void setApplicantEmail(String applicantEmail) {
        this.applicantEmail = applicantEmail;
    }

    public String getApplicantPhone() {
        return applicantPhone;
    }

    public void setApplicantPhone(String applicantPhone) {
        this.applicantPhone = applicantPhone;
    }

    public String getCurrentAddress() {
        return currentAddress;
    }

    public void setCurrentAddress(String currentAddress) {
        this.currentAddress = currentAddress;
    }

    public String getUniversityRollNo() {
        return universityRollNo;
    }

    public void setUniversityRollNo(String universityRollNo) {
        this.universityRollNo = universityRollNo;
    }

    public String getDob() {
        return dob;
    }

    public void setDob(String dob) {
        this.dob = dob;
    }

    public String getCollegeNameAddress() {
        return collegeNameAddress;
    }

    public void setCollegeNameAddress(String collegeNameAddress) {
        this.collegeNameAddress = collegeNameAddress;
    }

    public String getUniversityName() {
        return universityName;
    }

    public void setUniversityName(String universityName) {
        this.universityName = universityName;
    }

    public String getCurrentCourse() {
        return currentCourse;
    }

    public void setCurrentCourse(String currentCourse) {
        this.currentCourse = currentCourse;
    }

    public String getCurrentSemester() {
        return currentSemester;
    }

    public void setCurrentSemester(String currentSemester) {
        this.currentSemester = currentSemester;
    }

    public String getCityOfDomicile() {
        return cityOfDomicile;
    }

    public void setCityOfDomicile(String cityOfDomicile) {
        this.cityOfDomicile = cityOfDomicile;
    }

    public String getStateOfDomicile() {
        return stateOfDomicile;
    }

    public void setStateOfDomicile(String stateOfDomicile) {
        this.stateOfDomicile = stateOfDomicile;
    }

    public String getGovernmentIdType() {
        return governmentIdType;
    }

    public void setGovernmentIdType(String governmentIdType) {
        this.governmentIdType = governmentIdType;
    }

    public String getAcademicDetails() {
        return academicDetails;
    }

    public void setAcademicDetails(String academicDetails) {
        this.academicDetails = academicDetails;
    }

    public Long getProgId() {
        return progId;
    }

    public void setProgId(Long progId) {
        this.progId = progId;
    }

    public String getAadharCardPath() {
        return aadharCardPath;
    }

    public void setAadharCardPath(String aadharCardPath) {
        this.aadharCardPath = aadharCardPath;
    }

    public String getClassXMarksheetPath() {
        return classXMarksheetPath;
    }

    public void setClassXMarksheetPath(String classXMarksheetPath) {
        this.classXMarksheetPath = classXMarksheetPath;
    }

    public String getClassXIIMarksheetPath() {
        return classXIIMarksheetPath;
    }

    public void setClassXIIMarksheetPath(String classXIIMarksheetPath) {
        this.classXIIMarksheetPath = classXIIMarksheetPath;
    }

    public String getCoverLetterPath() {
        return coverLetterPath;
    }

    public void setCoverLetterPath(String coverLetterPath) {
        this.coverLetterPath = coverLetterPath;
    }

    public String getApplicationStatus() {
        return applicationStatus;
    }

    public void setApplicationStatus(String applicationStatus) {
        this.applicationStatus = applicationStatus;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
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