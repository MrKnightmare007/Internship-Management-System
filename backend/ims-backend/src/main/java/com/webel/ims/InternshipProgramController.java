package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/programs")
public class InternshipProgramController {

    @Autowired
    private InternshipProgramRepository programRepository;

    @Autowired
    private UserRepository userRepository;
    
    private final String UPLOAD_DIR = "./uploads/";

    private OrganizationMaster getCurrentUserOrganization() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = authentication.getName();
        User user = userRepository.findByUsername(currentUsername).orElse(null);
        if (user != null && "ORGANIZATION_MASTER".equals(user.getUserType())) {
            return user.getOrganization();
        }
        return null;
    }

    @GetMapping("/my-organization")
    public ResponseEntity<?> getProgramsForMyOrganization() {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        List<InternshipProgram> programs = programRepository.findByIntOrgId(org.getOrgId());
        List<InternshipProgramDto> dtos = programs.stream().map(InternshipProgramDto::new).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> createProgram(@RequestParam("intProgName") String intProgName,
                                           @RequestParam("intProgDescription") String intProgDescription,
                                           @RequestParam("progStartDate") LocalDate progStartDate,
                                           @RequestParam("progEndDate") LocalDate progEndDate,
                                           @RequestParam("progDurationWeeks") Integer progDurationWeeks,
                                           @RequestParam("progMaxApplicants") Integer progMaxApplicants,
                                           @RequestParam("progStatus") String progStatus,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }

        InternshipProgram newProgram = new InternshipProgram();
        newProgram.setIntProgName(intProgName);
        newProgram.setIntProgDescription(intProgDescription);
        newProgram.setProgStartDate(progStartDate);
        newProgram.setProgEndDate(progEndDate);
        newProgram.setProgDurationWeeks(progDurationWeeks);
        newProgram.setProgMaxApplicants(progMaxApplicants);
        newProgram.setProgStatus(progStatus);
        newProgram.setIntOrgId(org.getOrgId());
        User currentUser = userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).get();
        newProgram.setIntCoordinatorUserId(currentUser.getUserId());

        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file);
            if (filePath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed.");
            }
            newProgram.setAttachmentPath(filePath);
        }

        InternshipProgram savedProgram = programRepository.save(newProgram);
        return ResponseEntity.status(HttpStatus.CREATED).body(new InternshipProgramDto(savedProgram));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgram(@PathVariable Integer id,
                                           @RequestParam("intProgName") String intProgName,
                                           @RequestParam("intProgDescription") String intProgDescription,
                                           @RequestParam("progStartDate") LocalDate progStartDate,
                                           @RequestParam("progEndDate") LocalDate progEndDate,
                                           @RequestParam("progDurationWeeks") Integer progDurationWeeks,
                                           @RequestParam("progMaxApplicants") Integer progMaxApplicants,
                                           @RequestParam("progStatus") String progStatus,
                                           @RequestParam(value = "file", required = false) MultipartFile file) {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");

        Optional<InternshipProgram> existingProgramOpt = programRepository.findById(id);
        if (existingProgramOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");

        InternshipProgram existingProgram = existingProgramOpt.get();
        if (!existingProgram.getIntOrgId().equals(org.getOrgId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied.");
        }

        existingProgram.setIntProgName(intProgName);
        existingProgram.setIntProgDescription(intProgDescription);
        existingProgram.setProgStartDate(progStartDate);
        existingProgram.setProgEndDate(progEndDate);
        existingProgram.setProgDurationWeeks(progDurationWeeks);
        existingProgram.setProgMaxApplicants(progMaxApplicants);
        existingProgram.setProgStatus(progStatus);
        
        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file);
            if (filePath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed.");
            }
            existingProgram.setAttachmentPath(filePath);
        }

        InternshipProgram updatedProgram = programRepository.save(existingProgram);
        return ResponseEntity.ok(new InternshipProgramDto(updatedProgram));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Integer id) {
        // ... (delete logic remains the same)
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        Optional<InternshipProgram> programOpt = programRepository.findById(id);
        if (programOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
        if (!programOpt.get().getIntOrgId().equals(org.getOrgId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied.");
        programRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    private String saveFile(MultipartFile file) {
        try {
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();
            String newFileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + newFileName);
            Files.write(path, file.getBytes());
            return path.toString();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
