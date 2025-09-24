package com.webel.ims;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "selected_students")
public class SelectedStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "selected_id")
    private Integer selectedId;

    @Column(name = "accepted_id", nullable = false)
    private Integer acceptedId;

    @Column(name = "application_id", nullable = false)
    private Integer applicationId;

    @Column(name = "program_id", nullable = false)
    private Integer programId;

    @Column(name = "exam_id")
    private Integer examId;

    @Column(name = "shift_id")
    private Integer shiftId;

    @Column(name = "registration_number", nullable = false, length = 50)
    private String registrationNumber;

    @Column(name = "final_score", precision = 5, scale = 2)
    private BigDecimal finalScore;

    @Column(name = "exam_marks", precision = 5, scale = 2)
    private BigDecimal examMarks;

    @Column(name = "selection_remarks", columnDefinition = "TEXT")
    private String selectionRemarks;

    @Column(name = "selected_at", nullable = false)
    private LocalDateTime selectedAt;

    @Column(name = "selected_by", nullable = false)
    private Integer selectedBy;

    @Column(name = "internship_start_date")
    private LocalDate internshipStartDate;

    @Column(name = "internship_end_date")
    private LocalDate internshipEndDate;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "SELECTED";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "accepted_id", insertable = false, updatable = false)
    private AcceptedStudent acceptedStudent;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", insertable = false, updatable = false)
    private InternshipApplication application;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", insertable = false, updatable = false)
    private InternshipProgram program;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", insertable = false, updatable = false)
    private ExamDetails examDetails;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id", insertable = false, updatable = false)
    private ExamShift examShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "selected_by", insertable = false, updatable = false)
    private User selectedByUser;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (selectedAt == null) {
            selectedAt = now;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public SelectedStudent() {}

    public SelectedStudent(Integer acceptedId, Integer applicationId, Integer programId, 
                         String registrationNumber, Integer selectedBy) {
        this.acceptedId = acceptedId;
        this.applicationId = applicationId;
        this.programId = programId;
        this.registrationNumber = registrationNumber;
        this.selectedBy = selectedBy;
    }

    // Getters and Setters
    public Integer getSelectedId() { return selectedId; }
    public void setSelectedId(Integer selectedId) { this.selectedId = selectedId; }

    public Integer getAcceptedId() { return acceptedId; }
    public void setAcceptedId(Integer acceptedId) { this.acceptedId = acceptedId; }

    public Integer getApplicationId() { return applicationId; }
    public void setApplicationId(Integer applicationId) { this.applicationId = applicationId; }

    public Integer getProgramId() { return programId; }
    public void setProgramId(Integer programId) { this.programId = programId; }

    public Integer getExamId() { return examId; }
    public void setExamId(Integer examId) { this.examId = examId; }

    public Integer getShiftId() { return shiftId; }
    public void setShiftId(Integer shiftId) { this.shiftId = shiftId; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public BigDecimal getFinalScore() { return finalScore; }
    public void setFinalScore(BigDecimal finalScore) { this.finalScore = finalScore; }

    public BigDecimal getExamMarks() { return examMarks; }
    public void setExamMarks(BigDecimal examMarks) { this.examMarks = examMarks; }

    public String getSelectionRemarks() { return selectionRemarks; }
    public void setSelectionRemarks(String selectionRemarks) { this.selectionRemarks = selectionRemarks; }

    public LocalDateTime getSelectedAt() { return selectedAt; }
    public void setSelectedAt(LocalDateTime selectedAt) { this.selectedAt = selectedAt; }

    public Integer getSelectedBy() { return selectedBy; }
    public void setSelectedBy(Integer selectedBy) { this.selectedBy = selectedBy; }

    public LocalDate getInternshipStartDate() { return internshipStartDate; }
    public void setInternshipStartDate(LocalDate internshipStartDate) { this.internshipStartDate = internshipStartDate; }

    public LocalDate getInternshipEndDate() { return internshipEndDate; }
    public void setInternshipEndDate(LocalDate internshipEndDate) { this.internshipEndDate = internshipEndDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public AcceptedStudent getAcceptedStudent() { return acceptedStudent; }
    public void setAcceptedStudent(AcceptedStudent acceptedStudent) { this.acceptedStudent = acceptedStudent; }

    public InternshipApplication getApplication() { return application; }
    public void setApplication(InternshipApplication application) { this.application = application; }

    public InternshipProgram getProgram() { return program; }
    public void setProgram(InternshipProgram program) { this.program = program; }

    public ExamDetails getExamDetails() { return examDetails; }
    public void setExamDetails(ExamDetails examDetails) { this.examDetails = examDetails; }

    public ExamShift getExamShift() { return examShift; }
    public void setExamShift(ExamShift examShift) { this.examShift = examShift; }

    public User getSelectedByUser() { return selectedByUser; }
    public void setSelectedByUser(User selectedByUser) { this.selectedByUser = selectedByUser; }

    // Helper methods
    public boolean isSelected() {
        return "SELECTED".equals(status);
    }

    public boolean isEnrolled() {
        return "ENROLLED".equals(status);
    }

    public boolean isCompleted() {
        return "COMPLETED".equals(status);
    }
}