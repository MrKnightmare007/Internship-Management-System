// backend/ims-backend/src/main/java/com/webel/ims/InternshipApplicationController.java
package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class InternshipApplicationController {

    @Autowired
    private InternshipApplicationRepository repository;

    @PostMapping
    public ResponseEntity<?> submitApplication(
            @RequestParam("applicantName") String applicantName,
            @RequestParam("applicantEmail") String applicantEmail,
            @RequestParam("applicantPhone") String applicantPhone,
            @RequestParam("currentAddress") String currentAddress,
            @RequestParam("universityRollNo") String universityRollNo,
            @RequestParam("dob") String dob,
            @RequestParam("collegeNameAddress") String collegeNameAddress,
            @RequestParam("universityName") String universityName,
            @RequestParam("currentCourse") String currentCourse,
            @RequestParam("currentSemester") String currentSemester,
            @RequestParam("cityOfDomicile") String cityOfDomicile,
            @RequestParam("stateOfDomicile") String stateOfDomicile,
            @RequestParam("governmentIdType") String governmentIdType,
            @RequestParam("academicDetails") String academicDetails,
            @RequestParam("progId") Long progId,
            @RequestParam("aadharCard") MultipartFile aadharCard,
            @RequestParam("classXMarksheet") MultipartFile classXMarksheet,
            @RequestParam("classXIIMarksheet") MultipartFile classXIIMarksheet,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter
    ) {
        try {
            // Validate required fields
            if (applicantName == null || applicantName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Applicant Name is required");
            }
            if (applicantEmail == null || applicantEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Applicant Email is required");
            }
            if (applicantPhone == null || applicantPhone.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Applicant Phone is required");
            }
            if (currentAddress == null || currentAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Communication Address is required");
            }
            if (universityRollNo == null || universityRollNo.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("University Roll Number is required");
            }
            if (dob == null || dob.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Date of Birth is required");
            }
            if (collegeNameAddress == null || collegeNameAddress.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("College Name and Address is required");
            }
            if (universityName == null || universityName.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("University Name is required");
            }
            if (currentCourse == null || currentCourse.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Current Course is required");
            }
            if (currentSemester == null || currentSemester.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Current Semester is required");
            }
            if (cityOfDomicile == null || cityOfDomicile.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("City of Domicile is required");
            }
            if (stateOfDomicile == null || stateOfDomicile.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("State of Domicile is required");
            }
            if (governmentIdType == null || governmentIdType.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Government ID Type is required");
            }
            if (academicDetails == null || academicDetails.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Academic Details are required");
            }
            if (progId == null) {
                return ResponseEntity.badRequest().body("Program ID is required");
            }
            if (aadharCard == null || aadharCard.isEmpty()) {
                return ResponseEntity.badRequest().body("Aadhar Card is required");
            }
            if (classXMarksheet == null || classXMarksheet.isEmpty()) {
                return ResponseEntity.badRequest().body("Class X Marksheet is required");
            }
            if (classXIIMarksheet == null || classXIIMarksheet.isEmpty()) {
                return ResponseEntity.badRequest().body("Class XII Marksheet is required");
            }

            // Create application entity
            InternshipApplication application = new InternshipApplication();
            application.setApplicantName(applicantName);
            application.setApplicantEmail(applicantEmail);
            application.setApplicantPhone(applicantPhone);
            application.setCurrentAddress(currentAddress);
            application.setUniversityRollNo(universityRollNo);
            application.setDob(dob);
            application.setCollegeNameAddress(collegeNameAddress);
            application.setUniversityName(universityName);
            application.setCurrentCourse(currentCourse);
            application.setCurrentSemester(currentSemester);
            application.setCityOfDomicile(cityOfDomicile);
            application.setStateOfDomicile(stateOfDomicile);
            application.setGovernmentIdType(governmentIdType);
            application.setAcademicDetails(academicDetails);
            application.setProgId(progId);
            application.setApplicationStatus("PENDING");
            application.setApplicationDate(LocalDateTime.now());
            application.setCreatedAt(LocalDateTime.now());
            application.setUpdatedAt(LocalDateTime.now());

            // Save uploaded files
            String uploadDir = "./Uploads/applications/";
            Files.createDirectories(Paths.get(uploadDir));

            String aadharPath = saveFile(aadharCard, uploadDir, "aadhar_" + progId + "_" + System.currentTimeMillis());
            String classXPath = saveFile(classXMarksheet, uploadDir, "classX_" + progId + "_" + System.currentTimeMillis());
            String classXIIPath = saveFile(classXIIMarksheet, uploadDir, "classXII_" + progId + "_" + System.currentTimeMillis());
            String coverLetterPath = coverLetter != null && !coverLetter.isEmpty()
                    ? saveFile(coverLetter, uploadDir, "coverLetter_" + progId + "_" + System.currentTimeMillis())
                    : null;

            application.setAadharCardPath(aadharPath);
            application.setClassXMarksheetPath(classXPath);
            application.setClassXIIMarksheetPath(classXIIPath);
            application.setCoverLetterPath(coverLetterPath);

            // Save to database
            repository.save(application);
            return ResponseEntity.ok("Application submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error processing application: " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        return ResponseEntity.ok("API is working!");
    }
    
    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications() {
        try {
            System.out.println("my-applications endpoint called");
            
            // For testing, let's return a simple response first
            List<Map<String, Object>> response = new java.util.ArrayList<>();
            
            try {
                // Try to get applications from database
                List<InternshipApplication> applications = repository.findAll();
                System.out.println("Found " + applications.size() + " applications");
                
                // Convert to a simplified format for the frontend
                response = applications.stream().map(app -> {
                    Map<String, Object> appMap = new HashMap<>();
                    appMap.put("applicationId", app.getId());
                    appMap.put("programName", "Program " + app.getProgId()); // Simplified - no lookup for now
                    appMap.put("status", app.getApplicationStatus());
                    appMap.put("appliedDate", app.getApplicationDate());
                    return appMap;
                }).collect(Collectors.toList());
                
            } catch (Exception dbError) {
                System.out.println("Database error: " + dbError.getMessage());
                dbError.printStackTrace();
                // Return empty list if database error
                response = new java.util.ArrayList<>();
            }
            
            System.out.println("Returning response: " + response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // Log the full error
            return ResponseEntity.status(500).body("Error fetching applications: " + e.getMessage());
        }
    }

    private String saveFile(MultipartFile file, String uploadDir, String prefix) throws Exception {
        String fileName = prefix + "_" + file.getOriginalFilename();
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());
        return filePath.toString();
    }
}