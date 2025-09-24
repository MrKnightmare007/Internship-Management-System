package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface SelectedStudentRepository extends JpaRepository<SelectedStudent, Integer> {
    
    // Find by program ID
    List<SelectedStudent> findByProgramId(Integer programId);
    
    // Find by accepted student ID
    Optional<SelectedStudent> findByAcceptedId(Integer acceptedId);
    
    // Find by registration number
    Optional<SelectedStudent> findByRegistrationNumber(String registrationNumber);
    
    // Find by registration number and program ID
    Optional<SelectedStudent> findByRegistrationNumberAndProgramId(String registrationNumber, Integer programId);
    
    // Find by status
    List<SelectedStudent> findByStatus(String status);
    
    // Find by program ID and status
    List<SelectedStudent> findByProgramIdAndStatus(Integer programId, String status);
    
    // Check if student is already selected
    boolean existsByAcceptedId(Integer acceptedId);
    
    // Check if registration number is already selected for program
    boolean existsByRegistrationNumberAndProgramId(String registrationNumber, Integer programId);
    
    // Custom query to get selected students with application details
    @Query("SELECT ss FROM SelectedStudent ss " +
           "JOIN FETCH ss.application app " +
           "WHERE ss.programId = :programId " +
           "ORDER BY ss.selectedAt DESC")
    List<SelectedStudent> findByProgramIdWithApplicationDetails(@Param("programId") Integer programId);
    
    // Get count of selected students by program
    @Query("SELECT COUNT(ss) FROM SelectedStudent ss WHERE ss.programId = :programId")
    long countByProgramId(@Param("programId") Integer programId);
    
    // Get count of selected students by program and status
    @Query("SELECT COUNT(ss) FROM SelectedStudent ss WHERE ss.programId = :programId AND ss.status = :status")
    long countByProgramIdAndStatus(@Param("programId") Integer programId, @Param("status") String status);
    
    // Find students by program IDs (for multiple programs)
    List<SelectedStudent> findByProgramIdIn(List<Integer> programIds);
}