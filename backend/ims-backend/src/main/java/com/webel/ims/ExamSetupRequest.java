package com.webel.ims;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class ExamSetupRequest {
    
    private Integer programId;
    
    // Legacy fields for backward compatibility
    private String examinationLocation;
    private String examinationCentreNo;
    
    // New structure for multiple centres
    private List<ExaminationCentre> examinationCentres;
    
    private LocalDate examinationDate;
    private Integer numberOfShifts;
    private List<ShiftDetails> shifts;
    private String organizerSignaturePath;

    public static class ExaminationCentre {
        private String examinationLocation;
        private String examinationCentreNo;
        
        public ExaminationCentre() {}
        
        public ExaminationCentre(String examinationLocation, String examinationCentreNo) {
            this.examinationLocation = examinationLocation;
            this.examinationCentreNo = examinationCentreNo;
        }
        
        public String getExaminationLocation() { return examinationLocation; }
        public void setExaminationLocation(String examinationLocation) { this.examinationLocation = examinationLocation; }
        
        public String getExaminationCentreNo() { return examinationCentreNo; }
        public void setExaminationCentreNo(String examinationCentreNo) { this.examinationCentreNo = examinationCentreNo; }
    }

    public static class ShiftDetails {
        private String shiftName;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer maxApplicants;

        // Constructors
        public ShiftDetails() {}

        public ShiftDetails(String shiftName, LocalTime startTime, LocalTime endTime, Integer maxApplicants) {
            this.shiftName = shiftName;
            this.startTime = startTime;
            this.endTime = endTime;
            this.maxApplicants = maxApplicants;
        }

        // Getters and Setters
        public String getShiftName() { return shiftName; }
        public void setShiftName(String shiftName) { this.shiftName = shiftName; }

        public LocalTime getStartTime() { return startTime; }
        public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

        public LocalTime getEndTime() { return endTime; }
        public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

        public Integer getMaxApplicants() { return maxApplicants; }
        public void setMaxApplicants(Integer maxApplicants) { this.maxApplicants = maxApplicants; }
    }

    // Constructors
    public ExamSetupRequest() {}

    // Getters and Setters
    public Integer getProgramId() { return programId; }
    public void setProgramId(Integer programId) { this.programId = programId; }

    public String getExaminationLocation() { 
        // Return legacy field or first centre's location
        if (examinationLocation != null) return examinationLocation;
        if (examinationCentres != null && !examinationCentres.isEmpty()) {
            return examinationCentres.get(0).getExaminationLocation();
        }
        return null;
    }
    public void setExaminationLocation(String examinationLocation) { this.examinationLocation = examinationLocation; }

    public String getExaminationCentreNo() { 
        // Return legacy field or first centre's number
        if (examinationCentreNo != null) return examinationCentreNo;
        if (examinationCentres != null && !examinationCentres.isEmpty()) {
            return examinationCentres.get(0).getExaminationCentreNo();
        }
        return null;
    }
    public void setExaminationCentreNo(String examinationCentreNo) { this.examinationCentreNo = examinationCentreNo; }
    
    public List<ExaminationCentre> getExaminationCentres() { return examinationCentres; }
    public void setExaminationCentres(List<ExaminationCentre> examinationCentres) { this.examinationCentres = examinationCentres; }

    public LocalDate getExaminationDate() { return examinationDate; }
    public void setExaminationDate(LocalDate examinationDate) { this.examinationDate = examinationDate; }

    public Integer getNumberOfShifts() { return numberOfShifts; }
    public void setNumberOfShifts(Integer numberOfShifts) { this.numberOfShifts = numberOfShifts; }

    public List<ShiftDetails> getShifts() { return shifts; }
    public void setShifts(List<ShiftDetails> shifts) { this.shifts = shifts; }

    public String getOrganizerSignaturePath() { return organizerSignaturePath; }
    public void setOrganizerSignaturePath(String organizerSignaturePath) { this.organizerSignaturePath = organizerSignaturePath; }

    // Helper methods
    public int getTotalCapacity() {
        return shifts != null ? shifts.stream().mapToInt(ShiftDetails::getMaxApplicants).sum() : 0;
    }

    public boolean isValid() {
        if (programId == null || examinationDate == null || numberOfShifts == null || numberOfShifts <= 0) {
            return false;
        }
        
        // Check examination location/centre - either legacy format or new format
        boolean hasValidLocation = false;
        if (examinationLocation != null && !examinationLocation.trim().isEmpty() &&
            examinationCentreNo != null && !examinationCentreNo.trim().isEmpty()) {
            hasValidLocation = true;
        } else if (examinationCentres != null && !examinationCentres.isEmpty()) {
            hasValidLocation = examinationCentres.stream().allMatch(centre ->
                centre.getExaminationLocation() != null && !centre.getExaminationLocation().trim().isEmpty() &&
                centre.getExaminationCentreNo() != null && !centre.getExaminationCentreNo().trim().isEmpty()
            );
        }
        
        if (!hasValidLocation) {
            return false;
        }
        
        // Validate shifts
        return shifts != null && shifts.size() == numberOfShifts &&
               shifts.stream().allMatch(shift -> 
                   shift.getShiftName() != null && !shift.getShiftName().trim().isEmpty() &&
                   shift.getStartTime() != null &&
                   shift.getEndTime() != null &&
                   shift.getMaxApplicants() != null && shift.getMaxApplicants() > 0 &&
                   shift.getStartTime().isBefore(shift.getEndTime())
               );
    }
}