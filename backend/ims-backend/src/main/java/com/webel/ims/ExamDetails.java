package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exam_details")
public class ExamDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exam_id")
    private Integer examId;

    @Column(name = "program_id", nullable = false)
    private Integer programId;

    @Column(name = "examination_location", nullable = false, length = 500)
    private String examinationLocation;

    @Column(name = "examination_centre_no", nullable = false, length = 50)
    private String examinationCentreNo;

    @Column(name = "examination_date", nullable = false)
    private LocalDate examinationDate;

    @Column(name = "number_of_shifts", nullable = false)
    private Integer numberOfShifts = 1;

    @Column(name = "organizer_signature_path", length = 500)
    private String organizerSignaturePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", insertable = false, updatable = false)
    private InternshipProgram program;

    @OneToMany(mappedBy = "examDetails", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ExamShift> examShifts;

    @OneToMany(mappedBy = "examDetails", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AcceptedStudent> acceptedStudents;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public ExamDetails() {}

    public ExamDetails(Integer programId, String examinationLocation, String examinationCentreNo, 
                      LocalDate examinationDate, Integer numberOfShifts, String organizerSignaturePath) {
        this.programId = programId;
        this.examinationLocation = examinationLocation;
        this.examinationCentreNo = examinationCentreNo;
        this.examinationDate = examinationDate;
        this.numberOfShifts = numberOfShifts;
        this.organizerSignaturePath = organizerSignaturePath;
    }

    // Getters and Setters
    public Integer getExamId() { return examId; }
    public void setExamId(Integer examId) { this.examId = examId; }

    public Integer getProgramId() { return programId; }
    public void setProgramId(Integer programId) { this.programId = programId; }

    public String getExaminationLocation() { return examinationLocation; }
    public void setExaminationLocation(String examinationLocation) { this.examinationLocation = examinationLocation; }

    public String getExaminationCentreNo() { return examinationCentreNo; }
    public void setExaminationCentreNo(String examinationCentreNo) { this.examinationCentreNo = examinationCentreNo; }

    public LocalDate getExaminationDate() { return examinationDate; }
    public void setExaminationDate(LocalDate examinationDate) { this.examinationDate = examinationDate; }

    public Integer getNumberOfShifts() { return numberOfShifts; }
    public void setNumberOfShifts(Integer numberOfShifts) { this.numberOfShifts = numberOfShifts; }

    public String getOrganizerSignaturePath() { return organizerSignaturePath; }
    public void setOrganizerSignaturePath(String organizerSignaturePath) { this.organizerSignaturePath = organizerSignaturePath; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public InternshipProgram getProgram() { return program; }
    public void setProgram(InternshipProgram program) { this.program = program; }

    public List<ExamShift> getExamShifts() { return examShifts; }
    public void setExamShifts(List<ExamShift> examShifts) { this.examShifts = examShifts; }

    public List<AcceptedStudent> getAcceptedStudents() { return acceptedStudents; }
    public void setAcceptedStudents(List<AcceptedStudent> acceptedStudents) { this.acceptedStudents = acceptedStudents; }

    // Helper methods
    public int getTotalCapacity() {
        return examShifts != null ? 
            examShifts.stream().mapToInt(ExamShift::getMaxApplicants).sum() : 0;
    }

    public int getCurrentTotalStudents() {
        return examShifts != null ? 
            examShifts.stream().mapToInt(ExamShift::getCurrentApplicants).sum() : 0;
    }

    public boolean hasCapacity() {
        return getCurrentTotalStudents() < getTotalCapacity();
    }
}