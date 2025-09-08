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

    private final String UPLOAD_DIR = "./uploads/applications/";

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> submitApplicationWithDocuments(
            @RequestParam("programId") Integer programId,
            @RequestParam("formData") String formDataJson,
            @RequestParam(value = "governmentIdFile", required = false) MultipartFile governmentIdFile,
            @RequestParam(value = "coverLetter", required = false) MultipartFile coverLetter,
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
            app.setCurrentCourse((String) formData.get("courseStream"));
            app.setCurrentSemester((String) formData.get("currentSemester"));
            app.setGovernmentIdType((String) formData.get("governmentIdType"));

            String academicDetailsJson = mapper.writeValueAsString(formData.get("academicRecords"));
            app.setAcademicDetails(academicDetailsJson);

            // Handle file uploads
            String userId = applicant.getUserId().toString();
            String progId = program.getIntProgId().toString();

            if (governmentIdFile != null) app.setGovernmentIdPath(saveFile(governmentIdFile, "govtId_" + userId + "_" + progId));
            if (coverLetter != null) app.setCoverLetterPath(saveFile(coverLetter, "coverLetter_" + userId + "_" + progId));
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
}
