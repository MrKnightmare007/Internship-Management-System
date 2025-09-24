package com.webel.ims;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class AdmitCardData {
    
    // Student Information
    private String studentName;
    private String registrationNumber;
    private String photoPath;
    private String signaturePath;
    private String governmentIdNumber;
    private String governmentIdType;
    
    // Program Information
    private String internshipTitle;
    private String organizationName;
    
    // Exam Information
    private LocalDate examinationDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String examinationLocation;
    private String examinationCentreNo;
    private String shiftName;
    
    // Barcode Information
    private String barcodeData;
    
    // Contact Information
    private String studentEmail;
    private String studentPhone;

    // Constructors
    public AdmitCardData() {}

    // Getters and Setters
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getPhotoPath() { return photoPath; }
    public void setPhotoPath(String photoPath) { this.photoPath = photoPath; }

    public String getSignaturePath() { return signaturePath; }
    public void setSignaturePath(String signaturePath) { this.signaturePath = signaturePath; }

    public String getGovernmentIdNumber() { return governmentIdNumber; }
    public void setGovernmentIdNumber(String governmentIdNumber) { this.governmentIdNumber = governmentIdNumber; }

    public String getGovernmentIdType() { return governmentIdType; }
    public void setGovernmentIdType(String governmentIdType) { this.governmentIdType = governmentIdType; }

    public String getInternshipTitle() { return internshipTitle; }
    public void setInternshipTitle(String internshipTitle) { this.internshipTitle = internshipTitle; }

    public String getOrganizationName() { return organizationName; }
    public void setOrganizationName(String organizationName) { this.organizationName = organizationName; }

    public LocalDate getExaminationDate() { return examinationDate; }
    public void setExaminationDate(LocalDate examinationDate) { this.examinationDate = examinationDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getExaminationLocation() { return examinationLocation; }
    public void setExaminationLocation(String examinationLocation) { this.examinationLocation = examinationLocation; }

    public String getExaminationCentreNo() { return examinationCentreNo; }
    public void setExaminationCentreNo(String examinationCentreNo) { this.examinationCentreNo = examinationCentreNo; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public String getBarcodeData() { return barcodeData; }
    public void setBarcodeData(String barcodeData) { this.barcodeData = barcodeData; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStudentPhone() { return studentPhone; }
    public void setStudentPhone(String studentPhone) { this.studentPhone = studentPhone; }

    // Helper methods
    public String getTimeRange() {
        if (startTime != null && endTime != null) {
            return startTime + " to " + endTime;
        }
        return "";
    }

    public String getFormattedExaminationDate() {
        if (examinationDate != null) {
            return examinationDate.toString(); // Can be formatted as needed
        }
        return "";
    }
}