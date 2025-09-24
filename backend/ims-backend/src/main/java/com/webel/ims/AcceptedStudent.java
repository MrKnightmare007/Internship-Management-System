package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "accepted_students")
public class AcceptedStudent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "accepted_id")
    private Integer acceptedId;

    @Column(name = "application_id", nullable = false, unique = true)
    private Integer applicationId;

    @Column(name = "program_id", nullable = false)
    private Integer programId;

    @Column(name = "exam_id")
    private Integer examId;

    @Column(name = "shift_id")
    private Integer shiftId;

    @Column(name = "registration_number", nullable = false, unique = true, length = 50)
    private String registrationNumber;

    @Column(name = "barcode_data", length = 255)
    private String barcodeData;

    @Column(name = "admit_card_generated", nullable = false)
    private Boolean admitCardGenerated = false;

    @Column(name = "admit_card_sent", nullable = false)
    private Boolean admitCardSent = false;

    @Column(name = "accepted_at", nullable = false, updatable = false)
    private LocalDateTime acceptedAt;

    @Column(name = "admit_card_generated_at")
    private LocalDateTime admitCardGeneratedAt;

    @Column(name = "admit_card_sent_at")
    private LocalDateTime admitCardSentAt;

    // Relationships
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

    @PrePersist
    protected void onCreate() {
        acceptedAt = LocalDateTime.now();
    }

    // Constructors
    public AcceptedStudent() {}

    public AcceptedStudent(Integer applicationId, Integer programId, String registrationNumber) {
        this.applicationId = applicationId;
        this.programId = programId;
        this.registrationNumber = registrationNumber;
    }

    // Getters and Setters
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

    public String getBarcodeData() { return barcodeData; }
    public void setBarcodeData(String barcodeData) { this.barcodeData = barcodeData; }

    public Boolean getAdmitCardGenerated() { return admitCardGenerated; }
    public void setAdmitCardGenerated(Boolean admitCardGenerated) { this.admitCardGenerated = admitCardGenerated; }

    public Boolean getAdmitCardSent() { return admitCardSent; }
    public void setAdmitCardSent(Boolean admitCardSent) { this.admitCardSent = admitCardSent; }

    public LocalDateTime getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(LocalDateTime acceptedAt) { this.acceptedAt = acceptedAt; }

    public LocalDateTime getAdmitCardGeneratedAt() { return admitCardGeneratedAt; }
    public void setAdmitCardGeneratedAt(LocalDateTime admitCardGeneratedAt) { this.admitCardGeneratedAt = admitCardGeneratedAt; }

    public LocalDateTime getAdmitCardSentAt() { return admitCardSentAt; }
    public void setAdmitCardSentAt(LocalDateTime admitCardSentAt) { this.admitCardSentAt = admitCardSentAt; }

    public InternshipApplication getApplication() { return application; }
    public void setApplication(InternshipApplication application) { this.application = application; }

    public InternshipProgram getProgram() { return program; }
    public void setProgram(InternshipProgram program) { this.program = program; }

    public ExamDetails getExamDetails() { return examDetails; }
    public void setExamDetails(ExamDetails examDetails) { this.examDetails = examDetails; }

    public ExamShift getExamShift() { return examShift; }
    public void setExamShift(ExamShift examShift) { this.examShift = examShift; }

    // Helper methods
    public boolean isAdmitCardReady() {
        return admitCardGenerated != null && admitCardGenerated;
    }

    public boolean isAdmitCardSent() {
        return admitCardSent != null && admitCardSent;
    }

    public void markAdmitCardGenerated() {
        this.admitCardGenerated = true;
        this.admitCardGeneratedAt = LocalDateTime.now();
    }

    public void markAdmitCardSent() {
        this.admitCardSent = true;
        this.admitCardSentAt = LocalDateTime.now();
    }
}