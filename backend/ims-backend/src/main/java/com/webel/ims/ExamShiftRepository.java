package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ExamShiftRepository extends JpaRepository<ExamShift, Integer> {
    
    List<ExamShift> findByExamId(Integer examId);
    
    List<ExamShift> findByExamIdOrderByStartTime(Integer examId);
    
    @Query("SELECT es FROM ExamShift es WHERE es.examId = :examId AND es.currentApplicants < es.maxApplicants ORDER BY es.startTime")
    List<ExamShift> findAvailableShiftsByExamId(@Param("examId") Integer examId);
    
    @Query("SELECT es FROM ExamShift es WHERE es.examId = :examId AND es.currentApplicants < es.maxApplicants ORDER BY es.currentApplicants ASC, es.startTime ASC")
    List<ExamShift> findShiftsOrderedByAvailability(@Param("examId") Integer examId);
}