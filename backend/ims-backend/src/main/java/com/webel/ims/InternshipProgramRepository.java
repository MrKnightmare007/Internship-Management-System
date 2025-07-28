package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternshipProgramRepository extends JpaRepository<InternshipProgram, Integer> {
    List<InternshipProgram> findByIntOrgId(Integer intOrgId);
    
    // NEW: Find all programs with a specific status
    List<InternshipProgram> findByProgStatus(String status);
}