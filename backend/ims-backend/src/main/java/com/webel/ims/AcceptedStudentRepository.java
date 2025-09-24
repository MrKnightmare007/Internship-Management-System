package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface AcceptedStudentRepository extends JpaRepository<AcceptedStudent, Integer> {
    
    Optional<AcceptedStudent> findByApplicationId(Integer applicationId);
    
    Optional<AcceptedStudent> findByRegistrationNumber(String registrationNumber);
    
    List<AcceptedStudent> findByProgramId(Integer programId);
    
    List<AcceptedStudent> findByExamId(Integer examId);
    
    List<AcceptedStudent> findByShiftId(Integer shiftId);
    
    @Query("SELECT as FROM AcceptedStudent as JOIN FETCH as.application app WHERE as.programId = :programId")
    List<AcceptedStudent> findByProgramIdWithApplicationDetails(@Param("programId") Integer programId);
    
    @Query("SELECT as FROM AcceptedStudent as WHERE as.programId = :programId AND as.admitCardGenerated = false")
    List<AcceptedStudent> findByProgramIdWithoutAdmitCard(@Param("programId") Integer programId);
    
    @Query("SELECT as FROM AcceptedStudent as WHERE as.programId = :programId AND as.admitCardGenerated = true AND as.admitCardSent = false")
    List<AcceptedStudent> findByProgramIdWithUnssentAdmitCard(@Param("programId") Integer programId);
    
    @Query("SELECT COUNT(as) FROM AcceptedStudent as WHERE as.programId = :programId")
    Long countByProgramId(@Param("programId") Integer programId);
    
    @Query("SELECT COUNT(as) FROM AcceptedStudent as WHERE as.shiftId = :shiftId")
    Long countByShiftId(@Param("shiftId") Integer shiftId);
    
    boolean existsByApplicationId(Integer applicationId);
    
    boolean existsByRegistrationNumber(String registrationNumber);
}