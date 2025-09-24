package com.webel.ims;

import com.fasterxml.jackson.core.type.TypeReference;
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
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/applications")
public class InternshipApplicationController {

    @Autowired private InternshipApplicationRepository applicationRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private InternshipProgramRepository programRepository;
    @Autowired private AcceptedStudentRepository acceptedStudentRepository;
    @Autowired private ExamDetailsRepository examDetailsRepository;
    @Autowired private ExamShiftRepository examShiftRepository;

    private final String UPLOAD_DIR = "./uploads/applications/";

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitApplicationWithDocuments(
            @RequestParam("programId") Integer programId,
            @RequestParam("formData") String formDataJson,
            @RequestParam(value = "governmentIdFile", required = false) MultipartFile governmentIdFile,
            @RequestParam(value = "resumeFile", required = true) MultipartFile resumeFile,
            @RequestParam(value = "passportPhotoFile", required = true) MultipartFile passportPhotoFile,
            @RequestParam(value = "signatureFile", required = true) MultipartFile signatureFile,
            @RequestParam(value = "classXMarksheet", required = false) MultipartFile classXMarksheet,
            @RequestParam(value = "classXIIMarksheet", required = false) MultipartFile classXIIMarksheet
    ) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User applicant = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Applicant not found"));
            
            InternshipProgram program = programRepository.findById(programId)
                    .orElseThrow(() -> new RuntimeException("Program not found"));

            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> formData = mapper.readValue(formDataJson, new TypeReference<>() {});

            InternshipApplication app = new InternshipApplication();
            app.setApplicantUser(applicant);
            app.setProgram(program);
            app.setStatus("PENDING");

            // Map fields from formData
            app.setApplicantName((String) formData.get("fullName"));
            app.setDob((String) formData.get("dob"));
            app.setApplicantEmail((String) formData.get("email"));
            app.setApplicantPhone((String) formData.get("mobile"));
            app.setCurrentAddress((String) formData.get("currentAddress"));
            app.setPermanentAddress((String) formData.get("permanentAddress"));
            app.setCityOfDomicile((String) formData.get("cityOfDomicile"));
            app.setStateOfDomicile((String) formData.get("stateOfDomicile"));
            app.setCollegeNameAddress((String) formData.get("collegeNameAddress"));
            app.setUniversityName((String) formData.get("universityName"));
            app.setUniversityRegNo((String) formData.get("universityRegNo"));
            app.setCourseStream((String) formData.get("courseStream"));
            app.setCurrentSemester((String) formData.get("currentSemester"));
            app.setUniversityRollNo((String) formData.get("universityRollNo"));
            app.setGovernmentIdType((String) formData.get("governmentIdType"));

            String academicDetailsJson = mapper.writeValueAsString(formData.get("academicRecords"));
            app.setAcademicDetails(academicDetailsJson);

            // Handle file uploads
            String userId = applicant.getUserId().toString();
            String progId = program.getIntProgId().toString();

            if (governmentIdFile != null) app.setGovernmentIdPath(saveFile(governmentIdFile, "govtId_" + userId + "_" + progId));
            if (resumeFile != null) app.setResumePath(saveFile(resumeFile, "resume_" + userId + "_" + progId));
            if (passportPhotoFile != null) app.setPassportPhotoPath(saveFile(passportPhotoFile, "photo_" + userId + "_" + progId));
            if (signatureFile != null) app.setSignaturePath(saveFile(signatureFile, "signature_" + userId + "_" + progId));
            if (classXMarksheet != null) app.setClassXMarksheetPath(saveFile(classXMarksheet, "classX_" + userId + "_" + progId));
            if (classXIIMarksheet != null) app.setClassXIIMarksheetPath(saveFile(classXIIMarksheet, "classXII_" + userId + "_" + progId));
            
            applicationRepository.save(app);
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Application submitted successfully."));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error processing application: " + e.getMessage()));
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<List<?>> getMyApplications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User applicant = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Applicant not found"));

        List<InternshipApplication> applications = applicationRepository.findByApplicantUserUserId(applicant.getUserId());
        
        return ResponseEntity.ok(applications.stream().map(app -> Map.of(
            "programName", app.getProgram().getIntProgName(),
            "status", app.getStatus(),
            "appliedDate", app.getApplicationDate()
        )).collect(Collectors.toList()));
    }

    // NEW ENDPOINT: Get applications for organization master
    @GetMapping("/organization")
    public ResponseEntity<?> getApplicationsForOrganization() {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            // Get all programs for this organization
            List<InternshipProgram> orgPrograms = programRepository.findByIntOrgId(user.getOrganization().getOrgId());
            
            // Get all applications for these programs
            List<InternshipApplication> allApplications = new ArrayList<>();
            for (InternshipProgram program : orgPrograms) {
                List<InternshipApplication> programApplications = applicationRepository.findByProgramIntProgId(program.getIntProgId());
                allApplications.addAll(programApplications);
            }

            // Convert to DTOs with all required information
            List<Map<String, Object>> applicationDtos = allApplications.stream().map(app -> {
                Map<String, Object> dto = new HashMap<>();
                dto.put("applicationId", app.getId());
                dto.put("applicantName", app.getApplicantName());
                dto.put("applicantEmail", app.getApplicantUser().getUserEmail());
                dto.put("applicantPhone", app.getApplicantUser().getUserPhone());
                dto.put("programName", app.getProgram().getIntProgName());
                dto.put("currentCourse", app.getCourseStream());
                dto.put("currentSemester", app.getCurrentSemester());
                dto.put("status", app.getStatus());
                dto.put("appliedDate", app.getApplicationDate());
                
                // Add program details for filtering
                Map<String, Object> programDetails = new HashMap<>();
                programDetails.put("id", app.getProgram().getIntProgId());
                programDetails.put("intProgId", app.getProgram().getIntProgId());
                programDetails.put("name", app.getProgram().getIntProgName());
                programDetails.put("progStatus", app.getProgram().getProgStatus());
                programDetails.put("programApplicationEndDate", app.getProgram().getProgramApplicationEndDate());
                dto.put("program", programDetails);
                
                // Also add direct program ID for easier access
                dto.put("programId", app.getProgram().getIntProgId());
                dto.put("progId", app.getProgram().getIntProgId());
                
                return dto;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(applicationDtos);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching applications: " + e.getMessage());
        }
    }

    // NEW ENDPOINT: Get detailed application information
    @GetMapping("/{applicationId}")
    public ResponseEntity<?> getApplicationDetails(@PathVariable Integer applicationId) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            Optional<InternshipApplication> applicationOpt = applicationRepository.findById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found.");
            }

            InternshipApplication app = applicationOpt.get();
            
            // Verify the application belongs to this organization
            if (!app.getProgram().getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
            }

            // Create detailed DTO
            Map<String, Object> detailDto = new HashMap<>();
            detailDto.put("applicationId", app.getId());
            detailDto.put("applicantName", app.getApplicantName());
            detailDto.put("dob", app.getDob());
            detailDto.put("applicantEmail", app.getApplicantEmail());
            detailDto.put("applicantPhone", app.getApplicantPhone());
            detailDto.put("communicationAddress", app.getCurrentAddress());
            detailDto.put("permanentAddress", app.getPermanentAddress());
            detailDto.put("cityOfDomicile", app.getCityOfDomicile());
            detailDto.put("stateOfDomicile", app.getStateOfDomicile());
            detailDto.put("collegeNameAddress", app.getCollegeNameAddress());
            detailDto.put("universityName", app.getUniversityName());
            detailDto.put("universityRegNo", app.getUniversityRegNo());
            detailDto.put("universityRollNo", app.getUniversityRollNo());
            detailDto.put("currentCourse", app.getCourseStream());
            detailDto.put("currentSemester", app.getCurrentSemester());
            
            // Parse and add academic records
            try {
                if (app.getAcademicDetails() != null) {
                    ObjectMapper objectMapper = new ObjectMapper();
                    Object academicRecords = objectMapper.readValue(app.getAcademicDetails(), Object.class);
                    detailDto.put("academicRecords", academicRecords);
                } else {
                    detailDto.put("academicRecords", new ArrayList<>());
                }
            } catch (Exception e) {
                // If parsing fails, set empty array
                detailDto.put("academicRecords", new ArrayList<>());
            }
            
            detailDto.put("status", app.getStatus());
            detailDto.put("appliedDate", app.getApplicationDate());
            
            // Add document information with web-accessible paths
            Map<String, String> documents = new HashMap<>();
            if (app.getGovernmentIdPath() != null) {
                documents.put("aadharCard", convertToWebPath(app.getGovernmentIdPath()));
            }
            if (app.getResumePath() != null) {
                documents.put("resume", convertToWebPath(app.getResumePath()));
            }
            if (app.getPassportPhotoPath() != null) {
                documents.put("passportPhoto", convertToWebPath(app.getPassportPhotoPath()));
            }
            if (app.getSignaturePath() != null) {
                documents.put("signature", convertToWebPath(app.getSignaturePath()));
            }
            if (app.getClassXMarksheetPath() != null) {
                documents.put("classXMarksheet", convertToWebPath(app.getClassXMarksheetPath()));
            }
            if (app.getClassXIIMarksheetPath() != null) {
                documents.put("classXIIMarksheet", convertToWebPath(app.getClassXIIMarksheetPath()));
            }
            detailDto.put("documents", documents);

            return ResponseEntity.ok(detailDto);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching application details: " + e.getMessage());
        }
    }

    // NEW ENDPOINT: Update application status
    @PutMapping("/{applicationId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable Integer applicationId, @RequestBody Map<String, String> statusUpdate) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            Optional<InternshipApplication> applicationOpt = applicationRepository.findById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found.");
            }

            InternshipApplication app = applicationOpt.get();
            
            // Verify the application belongs to this organization
            if (!app.getProgram().getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
            }

            String newStatus = statusUpdate.get("status");
            if (newStatus == null || (!newStatus.equals("ACCEPTED") && !newStatus.equals("REJECTED") && !newStatus.equals("PENDING"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Must be ACCEPTED, REJECTED, or PENDING.");
            }

            String oldStatus = app.getStatus();
            
            // Handle ACCEPTED status - create AcceptedStudent record
            if ("ACCEPTED".equals(newStatus) && !"ACCEPTED".equals(oldStatus)) {
                // Check if exam setup exists and has capacity
                Optional<ExamDetails> examDetailsOpt = examDetailsRepository.findByProgramIdWithShifts(app.getProgram().getIntProgId());
                if (examDetailsOpt.isPresent()) {
                    ExamDetails examDetails = examDetailsOpt.get();
                    if (!examDetails.hasCapacity()) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                .body("Cannot accept more applications. Examination capacity is full.");
                    }
                }
                
                // Check if already accepted
                if (!acceptedStudentRepository.existsByApplicationId(applicationId)) {
                    // Generate registration number
                    String registrationNumber = generateRegistrationNumber(app.getProgram().getIntProgId());
                    
                    // Create AcceptedStudent record
                    AcceptedStudent acceptedStudent = new AcceptedStudent(
                        applicationId, 
                        app.getProgram().getIntProgId(), 
                        registrationNumber
                    );
                    
                    // If exam is setup, assign to a shift
                    if (examDetailsOpt.isPresent()) {
                        ExamDetails examDetails = examDetailsOpt.get();
                        List<ExamShift> availableShifts = examShiftRepository.findShiftsOrderedByAvailability(examDetails.getExamId());
                        if (!availableShifts.isEmpty() && availableShifts.get(0).hasCapacity()) {
                            acceptedStudent.setExamId(examDetails.getExamId());
                            acceptedStudent.setShiftId(availableShifts.get(0).getShiftId());
                        }
                    }
                    
                    acceptedStudent.setBarcodeData(registrationNumber);
                    acceptedStudentRepository.save(acceptedStudent);
                }
            }
            // Handle status change from ACCEPTED to other status - remove AcceptedStudent record
            else if ("ACCEPTED".equals(oldStatus) && !"ACCEPTED".equals(newStatus)) {
                Optional<AcceptedStudent> acceptedStudentOpt = acceptedStudentRepository.findByApplicationId(applicationId);
                acceptedStudentOpt.ifPresent(acceptedStudentRepository::delete);
            }

            app.setStatus(newStatus);
            applicationRepository.save(app);

            return ResponseEntity.ok(Map.of("message", "Application status updated successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating application status: " + e.getMessage());
        }
    }

    // NEW ENDPOINT: Download document
    @GetMapping("/{applicationId}/download/{documentType}")
    public ResponseEntity<?> downloadDocument(@PathVariable Integer applicationId, @PathVariable String documentType) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            Optional<InternshipApplication> applicationOpt = applicationRepository.findById(applicationId);
            if (applicationOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Application not found.");
            }

            InternshipApplication app = applicationOpt.get();
            
            // Verify the application belongs to this organization
            if (!app.getProgram().getIntOrgId().equals(user.getOrganization().getOrgId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
            }

            String filePath = null;
            switch (documentType.toLowerCase()) {
                case "aadharcard":
                case "governmentid":
                    filePath = app.getGovernmentIdPath();
                    break;
                case "resume":
                    filePath = app.getResumePath();
                    break;
                case "passportphoto":
                case "photo":
                    filePath = app.getPassportPhotoPath();
                    break;
                case "signature":
                    filePath = app.getSignaturePath();
                    break;
                case "classxmarksheet":
                    filePath = app.getClassXMarksheetPath();
                    break;
                case "classxiimarksheet":
                    filePath = app.getClassXIIMarksheetPath();
                    break;
                default:
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid document type.");
            }

            if (filePath == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found.");
            }

            // Convert full file path to web-accessible path
            String webPath = convertToWebPath(filePath);
            
            return ResponseEntity.ok(Map.of("filePath", webPath));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error downloading document: " + e.getMessage());
        }
    }

    // NEW ENDPOINT: Bulk update application status
    @PutMapping("/bulk-status")
    public ResponseEntity<?> updateBulkApplicationStatus(@RequestBody Map<String, Object> bulkUpdate) {
        try {
            String username = SecurityContextHolder.getContext().getAuthentication().getName();
            User user = userRepository.findByUsernameWithOrganization(username).orElse(null);
            
            if (user == null || !"ORGANIZATION_MASTER".equals(user.getUserType()) || user.getOrganization() == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
            }

            @SuppressWarnings("unchecked")
            List<Integer> applicationIds = (List<Integer>) bulkUpdate.get("applicationIds");
            String newStatus = (String) bulkUpdate.get("status");

            if (applicationIds == null || applicationIds.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("No application IDs provided.");
            }

            if (newStatus == null || (!newStatus.equals("ACCEPTED") && !newStatus.equals("REJECTED") && !newStatus.equals("PENDING"))) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid status. Must be ACCEPTED, REJECTED, or PENDING.");
            }

            int updatedCount = 0;
            for (Integer applicationId : applicationIds) {
                Optional<InternshipApplication> applicationOpt = applicationRepository.findById(applicationId);
                if (applicationOpt.isPresent()) {
                    InternshipApplication app = applicationOpt.get();
                    
                    // Verify the application belongs to this organization
                    if (app.getProgram().getIntOrgId().equals(user.getOrganization().getOrgId())) {
                        app.setStatus(newStatus);
                        applicationRepository.save(app);
                        updatedCount++;
                    }
                }
            }

            return ResponseEntity.ok(Map.of("message", updatedCount + " applications updated successfully."));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating application statuses: " + e.getMessage());
        }
    }

    private String saveFile(MultipartFile file, String prefix) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();
            
            String originalFilename = file.getOriginalFilename();
            String extension = Optional.ofNullable(originalFilename)
                                     .filter(f -> f.contains("."))
                                     .map(f -> f.substring(originalFilename.lastIndexOf(".")))
                                     .orElse("");

            String newFileName = prefix + "_" + System.currentTimeMillis() + extension;
            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, file.getBytes());
            return path.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    private String convertToWebPath(String filePath) {
        if (filePath == null) return null;
        // Convert Windows paths to web paths
        // Handle both .\\uploads\\... and ./uploads/... patterns
        String webPath = filePath.replace("\\", "/");  // Convert backslashes to forward slashes
        webPath = webPath.replace("./", "/");           // Convert ./ to /
        return webPath;
    }

    // Helper method to generate unique registration number
    private String generateRegistrationNumber(Integer programId) {
        String year = String.valueOf(java.time.LocalDateTime.now().getYear()).substring(2); // Last 2 digits of year
        String programCode = "CS"; // Can be made dynamic based on program type
        String sequence = String.valueOf(System.currentTimeMillis()).substring(8); // Last 5 digits of timestamp
        
        String regNumber;
        int attempts = 0;
        do {
            regNumber = programCode + year + "S" + programId + sequence + String.format("%02d", attempts);
            attempts++;
        } while (acceptedStudentRepository.existsByRegistrationNumber(regNumber) && attempts < 100);
        
        return regNumber;
    }
}
