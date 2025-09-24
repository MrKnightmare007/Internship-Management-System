package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ExamDetailsRepository extends JpaRepository<ExamDetails, Integer> {
    
    Optional<ExamDetails> findByProgramId(Integer programId);
    
    @Query("SELECT ed FROM ExamDetails ed JOIN FETCH ed.examShifts WHERE ed.programId = :programId")
    Optional<ExamDetails> findByProgramIdWithShifts(@Param("programId") Integer programId);
    
    List<ExamDetails> findByProgramIdIn(List<Integer> programIds);
    
    @Query("SELECT ed FROM ExamDetails ed WHERE ed.programId IN :programIds")
    List<ExamDetails> findByProgramIdsWithShifts(@Param("programIds") List<Integer> programIds);
}