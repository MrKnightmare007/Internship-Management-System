// backend/ims-backend/src/main/java/com/webel/ims/InternshipProgramController.java
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

    @Autowired 
    private OrganizationRepository organizationRepository;

    private final String UPLOAD_DIR = "./uploads/";

    // --- SUPER ADMIN METHOD ---
    @GetMapping("/all")
    public ResponseEntity<List<InternshipProgramDto>> getAllPrograms() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username).orElse(null);

        if (currentUser == null || !"SUPER_ADMIN".equals(currentUser.getUserType())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<InternshipProgram> allPrograms = programRepository.findAll();
        
        List<InternshipProgramDto> dtos = allPrograms.stream().map(program -> {
            OrganizationMaster org = organizationRepository.findById(program.getIntOrgId()).orElse(null);
            return new InternshipProgramDto(program, org);
        }).collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> createProgram(@RequestBody InternshipProgramRequest programRequest) {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");
        }
        InternshipProgram newProgram = new InternshipProgram();
        mapRequestToEntity(programRequest, newProgram);
        newProgram.setIntOrgId(org.getOrgId());
        User currentUser = userRepository.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName()).get();
        newProgram.setIntCoordinatorUserId(currentUser.getUserId());
        
        InternshipProgram savedProgram = programRepository.save(newProgram);
        // CORRECTED: Pass the organization object to the constructor
        return ResponseEntity.status(HttpStatus.CREATED).body(new InternshipProgramDto(savedProgram, org));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProgram(@PathVariable Integer id, @RequestBody InternshipProgramRequest programRequest) {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");

        Optional<InternshipProgram> existingProgramOpt = programRepository.findById(id);
        if (existingProgramOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");

        InternshipProgram existingProgram = existingProgramOpt.get();
        if (!existingProgram.getIntOrgId().equals(org.getOrgId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied.");
        }
        mapRequestToEntity(programRequest, existingProgram);
        InternshipProgram updatedProgram = programRepository.save(existingProgram);
        // CORRECTED: Pass the organization object to the constructor
        return ResponseEntity.ok(new InternshipProgramDto(updatedProgram, org));
    }

    @PostMapping("/{id}/upload-document")
    public ResponseEntity<?> uploadDocument(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        OrganizationMaster org = getCurrentUserOrganization();
        if (org == null) return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied.");

        Optional<InternshipProgram> programOpt = programRepository.findById(id);
        if (programOpt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Program not found.");
        
        InternshipProgram program = programOpt.get();
        if (!program.getIntOrgId().equals(org.getOrgId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Permission denied.");
        }
        
        if (file != null && !file.isEmpty()) {
            String filePath = saveFile(file);
            if (filePath == null) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("File upload failed.");
            }
            program.setAttachmentPath(filePath);
            programRepository.save(program);
        }
        // CORRECTED: Pass the organization object to the constructor
        return ResponseEntity.ok(new InternshipProgramDto(program, org));
    }

    private void mapRequestToEntity(InternshipProgramRequest request, InternshipProgram entity) {
        entity.setIntProgName(request.getIntProgName());
        entity.setIntProgDescription(request.getIntProgDescription());
        entity.setProgDurationWeeks(request.getProgDurationWeeks());
        entity.setProgMaxApplicants(request.getProgMaxApplicants());
        entity.setProgStatus(request.getProgStatus());
        entity.setProgramEntry(request.getProgramEntry());
        entity.setProgramType(request.getProgramType());
        entity.setProgramMode(request.getProgramMode());
        entity.setInternshipAmount(request.getInternshipAmount());

        if (request.getProgStartDate() != null && !request.getProgStartDate().isEmpty()) {
            entity.setProgStartDate(LocalDate.parse(request.getProgStartDate()));
        } else {
            entity.setProgStartDate(null);
        }
        if (request.getProgEndDate() != null && !request.getProgEndDate().isEmpty()) {
            entity.setProgEndDate(LocalDate.parse(request.getProgEndDate()));
        } else {
            entity.setProgEndDate(null);
        }
        if (request.getProgramApplicationStartDate() != null && !request.getProgramApplicationStartDate().isEmpty()) {
            entity.setProgramApplicationStartDate(LocalDate.parse(request.getProgramApplicationStartDate()));
        } else {
            entity.setProgramApplicationStartDate(null);
        }
        if (request.getProgramApplicationEndDate() != null && !request.getProgramApplicationEndDate().isEmpty()) {
            entity.setProgramApplicationEndDate(LocalDate.parse(request.getProgramApplicationEndDate()));
        } else {
            entity.setProgramApplicationEndDate(null);
        }
    }
    
    @GetMapping("/public-list")
    public ResponseEntity<List<InternshipProgramDto>> getPublicPrograms() {
        List<InternshipProgram> programs = programRepository.findByProgStatus("ACTIVE");
        // CORRECTED: Now fetches the organization for each program to provide its name
        List<InternshipProgramDto> dtos = programs.stream().map(program -> {
            OrganizationMaster org = organizationRepository.findById(program.getIntOrgId()).orElse(null);
            return new InternshipProgramDto(program, org);
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
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
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied or user not associated with an organization.");
        }
        List<InternshipProgram> programs = programRepository.findByIntOrgId(org.getOrgId());
        // CORRECTED: Pass the organization object to the constructor
        List<InternshipProgramDto> dtos = programs.stream()
            .map(program -> new InternshipProgramDto(program, org))
            .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProgram(@PathVariable Integer id) {
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
