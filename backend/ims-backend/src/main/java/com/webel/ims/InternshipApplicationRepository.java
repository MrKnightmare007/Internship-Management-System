package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Integer> {
    
    /**
     * Finds all applications submitted by a specific user.
     * Spring Data JPA automatically creates the query by looking for a property named 'userId'
     * inside the 'applicantUser' object of the InternshipApplication entity.
     * @param userId The ID of the user.
     * @return A list of applications for that user.
     */
    List<InternshipApplication> findByApplicantUserUserId(Integer userId);

    /**
     * Finds all applications for a specific internship program.
     * Spring Data JPA creates the query by looking for a property named 'intProgId'
     * inside the 'program' object of the InternshipApplication entity.
     * @param programId The ID of the internship program.
     * @return A list of applications for that program.
     */
    List<InternshipApplication> findByProgramIntProgId(Integer programId);
}
