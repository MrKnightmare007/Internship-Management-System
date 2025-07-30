package com.webel.ims;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * NOTE: This controller has been updated to use the correct Spring Data JPA method names.
 * Please ensure your `InternshipApplicationRepository` interface has methods with
 * the following exact signatures:
 * - List<InternshipApplication> findByApplicantUserUserId(Integer userId);
 * - List<InternshipApplication> findByProgramIntProgId(Integer programId);
 */
@RestController
@RequestMapping("/api/applications")
public class InternshipApplicationController {

    @Autowired private InternshipApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InternshipProgramRepository programRepository;

    @PostMapping
    public ResponseEntity<?> submitApplication(@RequestBody Map<String, Object> payload) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User applicant = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Applicant not found"));
            
            Integer programId = (Integer) payload.get("programId");
            InternshipProgram program = programRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Program not found"));

            // Extract form data from the payload
            @SuppressWarnings("unchecked")
            Map<String, Object> formData = (Map<String, Object>) payload.get("formData");

            InternshipApplication app = new InternshipApplication();
            app.setApplicantUser(applicant);
            app.setProgram(program);
            app.setStatus("PENDING");

            // Map all the fields from the form
            app.setApplicantName((String) formData.get("name"));
            app.setDob((String) formData.get("dob"));
            app.setApplicantEmail((String) formData.get("email"));
            app.setApplicantPhone((String) formData.get("mobile"));
            app.setCommunicationAddress((String) formData.get("address"));
            app.setCollegeNameAddress((String) formData.get("collegeNameAddress"));
            app.setUniversityName((String) formData.get("universityName"));
            app.setUniversityRegNo((String) formData.get("universityRegNo"));
            app.setCurrentCourse((String) formData.get("courseStream"));
            app.setCurrentSemester((String) formData.get("currentSemester"));

            // Convert academic records list to a JSON string
            ObjectMapper mapper = new ObjectMapper();
            String academicDetailsJson = mapper.writeValueAsString(formData.get("academicRecords"));
            app.setAcademicDetails(academicDetailsJson);
            
            applicationRepository.save(app);
            return ResponseEntity.status(HttpStatus.CREATED).body("Application submitted successfully.");

        } catch (Exception e) {
            // Log the full error on the server for debugging
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing application: " + e.getMessage());
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<?>> getMyApplications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User applicant = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        // CORRECTED: Removed underscore from method name. It should be findByApplicantUserUserId.
        List<InternshipApplication> applications = applicationRepository.findByApplicantUserUserId(applicant.getUserId());
        
        // Return a simplified map of data for the applicant's view
        return ResponseEntity.ok(applications.stream().map(app -> Map.of(
            "programName", app.getProgram().getIntProgName(),
            "status", app.getStatus(),
            "appliedDate", app.getApplicationDate()
        )).collect(Collectors.toList()));
    }

    @GetMapping("/organization")
    public ResponseEntity<List<?>> getApplicationsForOrganization() {
         String username = SecurityContextHolder.getContext().getAuthentication().getName();
         User coordinator = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Coordinator not found"));
        
        // Ensure the user is a coordinator and has an organization
        if (coordinator.getOrganization() == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(List.of("User is not associated with an organization."));
        }
        
        Integer orgId = coordinator.getOrganization().getOrgId();
        
        // Find all programs for the coordinator's organization
        List<InternshipProgram> programsInOrg = programRepository.findByIntOrgId(orgId);
        
        // For each program, get all applications
        // CORRECTED: Removed underscore from method name. It should be findByProgramIntProgId.
        List<InternshipApplication> applications = programsInOrg.stream()
                .flatMap(prog -> applicationRepository.findByProgramIntProgId(prog.getIntProgId()).stream())
                .collect(Collectors.toList());

        // Return a detailed map of data for the coordinator's view
        return ResponseEntity.ok(applications.stream().map(app -> Map.of(
            "applicationId", app.getId(),
            "applicantName", app.getApplicantName(), // Use the name from the form
            "programName", app.getProgram().getIntProgName(),
            "status", app.getStatus(),
            "appliedDate", app.getApplicationDate()
        )).collect(Collectors.toList()));
    }
}
