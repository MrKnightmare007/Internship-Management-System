package com.webel.ims;

import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "exam_shifts")
public class ExamShift {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shift_id")
    private Integer shiftId;

    @Column(name = "exam_id", nullable = false)
    private Integer examId;

    @Column(name = "shift_name", nullable = false, length = 100)
    private String shiftName;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "max_applicants", nullable = false)
    private Integer maxApplicants = 50;

    @Column(name = "current_applicants", nullable = false)
    private Integer currentApplicants = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", insertable = false, updatable = false)
    private ExamDetails examDetails;

    @OneToMany(mappedBy = "examShift", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AcceptedStudent> acceptedStudents;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public ExamShift() {}

    public ExamShift(Integer examId, String shiftName, LocalTime startTime, LocalTime endTime, Integer maxApplicants) {
        this.examId = examId;
        this.shiftName = shiftName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.maxApplicants = maxApplicants;
    }

    // Getters and Setters
    public Integer getShiftId() { return shiftId; }
    public void setShiftId(Integer shiftId) { this.shiftId = shiftId; }

    public Integer getExamId() { return examId; }
    public void setExamId(Integer examId) { this.examId = examId; }

    public String getShiftName() { return shiftName; }
    public void setShiftName(String shiftName) { this.shiftName = shiftName; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getMaxApplicants() { return maxApplicants; }
    public void setMaxApplicants(Integer maxApplicants) { this.maxApplicants = maxApplicants; }

    public Integer getCurrentApplicants() { return currentApplicants; }
    public void setCurrentApplicants(Integer currentApplicants) { this.currentApplicants = currentApplicants; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public ExamDetails getExamDetails() { return examDetails; }
    public void setExamDetails(ExamDetails examDetails) { this.examDetails = examDetails; }

    public List<AcceptedStudent> getAcceptedStudents() { return acceptedStudents; }
    public void setAcceptedStudents(List<AcceptedStudent> acceptedStudents) { this.acceptedStudents = acceptedStudents; }

    // Helper methods
    public boolean hasCapacity() {
        return currentApplicants < maxApplicants;
    }

    public int getAvailableCapacity() {
        return maxApplicants - currentApplicants;
    }

    public String getTimeRange() {
        return startTime + " - " + endTime;
    }
}