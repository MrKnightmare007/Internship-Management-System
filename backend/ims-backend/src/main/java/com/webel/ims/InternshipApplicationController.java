package com.webel.ims;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;

import java.util.HashMap;
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
@CrossOrigin(origins = "*", maxAge = 3600)
public class InternshipApplicationController {

    @Autowired private InternshipApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InternshipProgramRepository programRepository;

    private final String UPLOAD_DIR = "./uploads/applications/";

    // Handle JSON requests (backward compatibility)
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> submitApplicationJson(@RequestBody Map<String, Object> payload) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User applicant = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Applicant not found"));
            
            Integer programId = (Integer) payload.get("programId");
            InternshipProgram program = programRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Program not found"));

            @SuppressWarnings("unchecked")
            Map<String, Object> formData = (Map<String, Object>) payload.get("formData");

            InternshipApplication app = new InternshipApplication();
            app.setApplicantUser(applicant);
            app.setProgram(program);
            app.setStatus("PENDING");

            // Map all the fields from the form
            app.setApplicantName((String) formData.get("fullName"));
            app.setDob((String) formData.get("dob"));
            app.setApplicantEmail((String) formData.get("email"));
            app.setApplicantPhone((String) formData.get("mobile"));
            app.setCommunicationAddress((String) formData.get("address"));
            app.setCollegeNameAddress((String) formData.get("collegeNameAddress"));
            app.setUniversityName((String) formData.get("universityName"));
            // University registration number is now optional since we have resume upload
            String universityRegNo = (String) formData.get("universityRegNo");
            app.setUniversityRegNo(universityRegNo != null ? universityRegNo : "N/A");
            app.setCurrentCourse((String) formData.get("courseStream"));
            app.setCurrentSemester((String) formData.get("currentSemester"));

            // Convert academic records list to a JSON string
            ObjectMapper mapper = new ObjectMapper();
            String academicDetailsJson = mapper.writeValueAsString(formData.get("academicRecords"));
            app.setAcademicDetails(academicDetailsJson);
            
            applicationRepository.save(app);
            return ResponseEntity.status(HttpStatus.CREATED).body("Application submitted successfully.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing application: " + e.getMessage());
        }
    }

    // Handle multipart requests (with documents)
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitApplicationWithDocuments(
            @RequestParam("programId") Integer programId,
            @RequestParam("formData") String formDataJson,
            @RequestParam(value = "aadharCard", required = false) MultipartFile aadharCard,
            @RequestParam(value = "classXMarksheet", required = false) MultipartFile classXMarksheet,
            @RequestParam(value = "classXIIMarksheet", required = false) MultipartFile classXIIMarksheet,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User applicant = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Applicant not found"));
            
            InternshipProgram program = programRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Program not found"));

            // Parse form data from JSON string
            ObjectMapper mapper = new ObjectMapper();
            @SuppressWarnings("unchecked")
            Map<String, Object> formData = mapper.readValue(formDataJson, Map.class);

            InternshipApplication app = new InternshipApplication();
            app.setApplicantUser(applicant);
            app.setProgram(program);
            app.setStatus("PENDING");

            // Map all the fields from the form
            app.setApplicantName((String) formData.get("fullName"));
            app.setDob((String) formData.get("dob"));
            app.setApplicantEmail((String) formData.get("email"));
            app.setApplicantPhone((String) formData.get("mobile"));
            app.setCommunicationAddress((String) formData.get("address"));
            app.setCollegeNameAddress((String) formData.get("collegeNameAddress"));
            app.setUniversityName((String) formData.get("universityName"));
            app.setUniversityRollNo((String) formData.get("universityRollNo"));
            // University registration number is now optional since we have resume upload
            String universityRegNoMultipart = (String) formData.get("universityRegNo");
            app.setUniversityRegNo(universityRegNoMultipart != null ? universityRegNoMultipart : "N/A");
            app.setCurrentCourse((String) formData.get("courseStream"));
            app.setCurrentSemester((String) formData.get("currentSemester"));

            // Convert academic records list to a JSON string
            String academicDetailsJson = mapper.writeValueAsString(formData.get("academicRecords"));
            app.setAcademicDetails(academicDetailsJson);

            // Handle file uploads
            if (aadharCard != null && !aadharCard.isEmpty()) {
                String aadharPath = saveFile(aadharCard, "aadhar_" + applicant.getUserId() + "_" + programId);
                app.setAadharCardPath(aadharPath);
            }

            if (classXMarksheet != null && !classXMarksheet.isEmpty()) {
                String classXPath = saveFile(classXMarksheet, "class_x_" + applicant.getUserId() + "_" + programId);
                app.setClassXMarksheetPath(classXPath);
            }

            if (classXIIMarksheet != null && !classXIIMarksheet.isEmpty()) {
                String classXIIPath = saveFile(classXIIMarksheet, "class_xii_" + applicant.getUserId() + "_" + programId);
                app.setClassXIIMarksheetPath(classXIIPath);
            }

            if (coverLetter != null && !coverLetter.isEmpty()) {
                String coverLetterPath = saveFile(coverLetter, "cover_letter_" + applicant.getUserId() + "_" + programId);
                app.setCoverLetterPath(coverLetterPath);
            }
            
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
        List<InternshipApplication> applications = programsInOrg.stream()
                .flatMap(prog -> applicationRepository.findByProgramIntProgId(prog.getIntProgId()).stream())
                .collect(Collectors.toList());

        // Return a detailed map of data for the coordinator's view
        return ResponseEntity.ok(applications.stream().map(app -> {
            Map<String, Object> appMap = new HashMap<>();
            appMap.put("applicationId", app.getId());
            appMap.put("applicantName", app.getApplicantName());
            appMap.put("applicantEmail", app.getApplicantEmail());
            appMap.put("applicantPhone", app.getApplicantPhone());
            appMap.put("programName", app.getProgram().getIntProgName());
            appMap.put("programId", app.getProgram().getIntProgId());
            appMap.put("status", app.getStatus());
            appMap.put("appliedDate", app.getApplicationDate());
            appMap.put("dob", app.getDob());
            appMap.put("currentCourse", app.getCurrentCourse());
            appMap.put("currentSemester", app.getCurrentSemester());
            appMap.put("universityName", app.getUniversityName());
            return appMap;
        }).collect(Collectors.toList()));
    }

    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getApplicationDetails(@PathVariable Integer applicationId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User coordinator = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            
            InternshipApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Verify the application belongs to the coordinator's organization
            if (!application.getProgram().getIntOrgId().equals(coordinator.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            // Parse academic details JSON
            ObjectMapper mapper = new ObjectMapper();
            Object academicRecords = null;
            try {
                academicRecords = mapper.readValue(application.getAcademicDetails(), Object.class);
            } catch (Exception e) {
                academicRecords = application.getAcademicDetails();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("applicationId", application.getId());
            response.put("applicantName", application.getApplicantName());
            response.put("dob", application.getDob());
            response.put("applicantEmail", application.getApplicantEmail());
            response.put("applicantPhone", application.getApplicantPhone());
            response.put("communicationAddress", application.getCommunicationAddress());
            response.put("collegeNameAddress", application.getCollegeNameAddress());
            response.put("universityName", application.getUniversityName());
            response.put("universityRegNo", application.getUniversityRegNo());
            response.put("universityRollNo", application.getUniversityRollNo());
            response.put("currentCourse", application.getCurrentCourse());
            response.put("currentSemester", application.getCurrentSemester());
            response.put("academicRecords", academicRecords);
            response.put("programName", application.getProgram().getIntProgName());
            response.put("programId", application.getProgram().getIntProgId());
            response.put("status", application.getStatus());
            response.put("appliedDate", application.getApplicationDate());
            response.put("updatedAt", application.getUpdatedAt());
            
            // Add document information
            Map<String, Object> documents = new HashMap<>();
            documents.put("aadharCard", application.getAadharCardPath());
            documents.put("classXMarksheet", application.getClassXMarksheetPath());
            documents.put("classXIIMarksheet", application.getClassXIIMarksheetPath());
            documents.put("coverLetter", application.getCoverLetterPath());
            response.put("documents", documents);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching application details: " + e.getMessage());
        }
    }

    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Integer applicationId, @RequestBody Map<String, String> payload) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User coordinator = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            
            InternshipApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Verify the application belongs to the coordinator's organization
            if (!application.getProgram().getIntOrgId().equals(coordinator.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            String newStatus = payload.get("status");
            if (!List.of("PENDING", "ACCEPTED", "REJECTED").contains(newStatus)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status");
            }
            
            application.setStatus(newStatus);
            applicationRepository.save(application);
            
            return ResponseEntity.ok(Map.of("message", "Application status updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating application status: " + e.getMessage());
        }
    }

    @PutMapping("/bulk-status")
    public ResponseEntity<?> updateBulkApplicationStatus(@RequestBody Map<String, Object> payload) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User coordinator = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            
            @SuppressWarnings("unchecked")
            List<Integer> applicationIds = (List<Integer>) payload.get("applicationIds");
            String newStatus = (String) payload.get("status");
            
            if (!List.of("PENDING", "ACCEPTED", "REJECTED").contains(newStatus)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status");
            }
            
            List<InternshipApplication> applications = applicationRepository.findAllById(applicationIds);
            
            // Verify all applications belong to the coordinator's organization
            for (InternshipApplication app : applications) {
                if (!app.getProgram().getIntOrgId().equals(coordinator.getOrganization().getOrgId())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied for one or more applications");
                }
            }
            
            // Update all applications
            applications.forEach(app -> app.setStatus(newStatus));
            applicationRepository.saveAll(applications);
            
            return ResponseEntity.ok(Map.of("message", applications.size() + " applications updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating applications: " + e.getMessage());
        }
    }

    @GetMapping("/{applicationId}/download/{documentType}")
    public ResponseEntity<?> downloadDocument(@PathVariable Integer applicationId, @PathVariable String documentType) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User coordinator = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            
            InternshipApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Verify the application belongs to the coordinator's organization
            if (!application.getProgram().getIntOrgId().equals(coordinator.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            String filePath = null;
            switch (documentType.toLowerCase()) {
                case "aadharcard":
                    filePath = application.getAadharCardPath();
                    break;
                case "classxmarksheet":
                    filePath = application.getClassXMarksheetPath();
                    break;
                case "classxiimarksheet":
                    filePath = application.getClassXIIMarksheetPath();
                    break;
                case "coverletter":
                    filePath = application.getCoverLetterPath();
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid document type");
            }
            
            if (filePath == null || filePath.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }
            
            File file = new File(filePath);
            if (!file.exists()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("File not found on server");
            }
            
            // Return file path for frontend to handle download
            return ResponseEntity.ok(Map.of("filePath", "/uploads/applications/" + file.getName()));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error downloading document: " + e.getMessage());
        }
    }

    @GetMapping("/{applicationId}/documents/{documentType}")
    public ResponseEntity<?> serveDocument(
            @PathVariable Integer applicationId,
            @PathVariable String documentType) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User coordinator = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Coordinator not found"));
            
            InternshipApplication application = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new RuntimeException("Application not found"));
            
            // Verify the application belongs to the coordinator's organization
            if (!application.getProgram().getIntOrgId().equals(coordinator.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied");
            }
            
            String filePath = null;
            switch (documentType.toLowerCase()) {
                case "aadharcard":
                    filePath = application.getAadharCardPath();
                    break;
                case "classxmarksheet":
                    filePath = application.getClassXMarksheetPath();
                    break;
                case "classxiimarksheet":
                    filePath = application.getClassXIIMarksheetPath();
                    break;
                case "coverletter":
                    filePath = application.getCoverLetterPath();
                    break;
                default:
                    return ResponseEntity.badRequest().body("Invalid document type");
            }
            
            if (filePath == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok(Map.of("filePath", filePath));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error serving document: " + e.getMessage());
        }
    }

    @PostMapping("/test-upload")
    public ResponseEntity<?> testUpload(
            @RequestParam("testFile") MultipartFile testFile,
            @RequestParam("testData") String testData) {
        try {
            return ResponseEntity.ok(Map.of(
                "message", "Upload test successful",
                "fileName", testFile.getOriginalFilename(),
                "fileSize", testFile.getSize(),
                "testData", testData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Test failed: " + e.getMessage());
        }
    }

    private String saveFile(MultipartFile file, String prefix) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") 
                ? originalFilename.substring(originalFilename.lastIndexOf(".")) 
                : "";
            String newFileName = prefix + "_" + System.currentTimeMillis() + extension;
            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, file.getBytes());
            return path.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
