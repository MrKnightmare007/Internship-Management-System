// backend/ims-backend/src/main/java/com/webel/ims/InternshipApplicationRepository.java
package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternshipApplicationRepository extends JpaRepository<InternshipApplication, Long> {
    List<InternshipApplication> findByApplicantEmail(String applicantEmail);
}