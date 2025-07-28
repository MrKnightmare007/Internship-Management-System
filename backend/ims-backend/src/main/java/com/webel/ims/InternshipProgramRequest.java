// backend/ims-backend/src/main/java/com/webel/ims/InternshipProgramRequest.java
package com.webel.ims;

// This is a simple POJO (Plain Old Java Object) to hold the form data.
// It makes the controller code cleaner and the request handling more robust.
public class InternshipProgramRequest {

    private String intProgName;
    private String intProgDescription;
    private String progStartDate; // Dates are received as Strings
    private String progEndDate;
    private Integer progDurationWeeks;
    private Integer progMaxApplicants;
    private String progStatus;
    private String programApplicationStartDate;
    private String programApplicationEndDate;
    private String programEntry;
    private String programType;
    private String programMode;
    // --- NEW REQUEST FIELD ---
    private Double internshipAmount;
    // --- Standard Getters and Setters for all fields ---

    public String getIntProgName() { return intProgName; }
    public void setIntProgName(String intProgName) { this.intProgName = intProgName; }
    public Double getInternshipAmount() { return internshipAmount; }
    public void setInternshipAmount(Double internshipAmount) { this.internshipAmount = internshipAmount; }
    public String getIntProgDescription() { return intProgDescription; }
    public void setIntProgDescription(String intProgDescription) { this.intProgDescription = intProgDescription; }
    public String getProgStartDate() { return progStartDate; }
    public void setProgStartDate(String progStartDate) { this.progStartDate = progStartDate; }
    public String getProgEndDate() { return progEndDate; }
    public void setProgEndDate(String progEndDate) { this.progEndDate = progEndDate; }
    public Integer getProgDurationWeeks() { return progDurationWeeks; }
    public void setProgDurationWeeks(Integer progDurationWeeks) { this.progDurationWeeks = progDurationWeeks; }
    public Integer getProgMaxApplicants() { return progMaxApplicants; }
    public void setProgMaxApplicants(Integer progMaxApplicants) { this.progMaxApplicants = progMaxApplicants; }
    public String getProgStatus() { return progStatus; }
    public void setProgStatus(String progStatus) { this.progStatus = progStatus; }
    public String getProgramApplicationStartDate() { return programApplicationStartDate; }
    public void setProgramApplicationStartDate(String programApplicationStartDate) { this.programApplicationStartDate = programApplicationStartDate; }
    public String getProgramApplicationEndDate() { return programApplicationEndDate; }
    public void setProgramApplicationEndDate(String programApplicationEndDate) { this.programApplicationEndDate = programApplicationEndDate; }
    public String getProgramEntry() { return programEntry; }
    public void setProgramEntry(String programEntry) { this.programEntry = programEntry; }
    public String getProgramType() { return programType; }
    public void setProgramType(String programType) { this.programType = programType; }
    public String getProgramMode() { return programMode; }
    public void setProgramMode(String programMode) { this.programMode = programMode; }
}