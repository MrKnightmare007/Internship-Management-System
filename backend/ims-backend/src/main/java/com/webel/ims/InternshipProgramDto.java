// backend/ims-backend/src/main/java/com/webel/ims/InternshipProgramDto.java
package com.webel.ims;

import java.time.LocalDate;

public class InternshipProgramDto {

    private Integer intProgId;
    private String intProgName;
    private String intProgDescription;
    private Integer intOrgId;
    private LocalDate progStartDate;
    private LocalDate progEndDate;
    private Integer progDurationWeeks;
    private Integer progMaxApplicants;
    private String progStatus;
    private String attachmentPath;


    // --- NEW DTO FIELD ---
    private Double internshipAmount;
    private LocalDate programApplicationStartDate;
    private LocalDate programApplicationEndDate;
    private String programEntry;
    private String programType;
    private String programMode;

    public InternshipProgramDto() {}

    public InternshipProgramDto(InternshipProgram program) {
        this.intProgId = program.getIntProgId();
        this.intProgName = program.getIntProgName();
        this.intProgDescription = program.getIntProgDescription();
        this.intOrgId = program.getIntOrgId();
        this.progStartDate = program.getProgStartDate();
        this.progEndDate = program.getProgEndDate();
        this.progDurationWeeks = program.getProgDurationWeeks();
        this.progMaxApplicants = program.getProgMaxApplicants();
        this.progStatus = program.getProgStatus();
        this.attachmentPath = program.getAttachmentPath();
        
        // --- MAPPING NEW FIELDS ---
        this.programApplicationStartDate = program.getProgramApplicationStartDate();
        this.programApplicationEndDate = program.getProgramApplicationEndDate();
        this.programEntry = program.getProgramEntry();
        this.programType = program.getProgramType();
        this.programMode = program.getProgramMode();
        // --- MAPPING NEW FIELD ---
        this.internshipAmount = program.getInternshipAmount();
    }

    // --- Getters and Setters ---
    public Integer getIntProgId() { return intProgId; }
    public void setIntProgId(Integer intProgId) { this.intProgId = intProgId; }
    public Double getInternshipAmount() { return internshipAmount; }
    public void setInternshipAmount(Double internshipAmount) { this.internshipAmount = internshipAmount; }
    public String getIntProgName() { return intProgName; }
    public void setIntProgName(String intProgName) { this.intProgName = intProgName; }
    public String getIntProgDescription() { return intProgDescription; }
    public void setIntProgDescription(String intProgDescription) { this.intProgDescription = intProgDescription; }
    public Integer getIntOrgId() { return intOrgId; }
    public void setIntOrgId(Integer intOrgId) { this.intOrgId = intOrgId; }
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

    // --- Getters and Setters for NEW DTO FIELDS ---
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