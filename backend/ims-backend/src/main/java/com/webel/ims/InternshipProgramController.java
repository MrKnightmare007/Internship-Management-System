package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/programs")
public class InternshipProgramController {

    @Autowired
    private InternshipProgramRepository repository;

    // GET all programs
    @GetMapping
    public List<InternshipProgram> getAll() {
        return repository.findAll();
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<InternshipProgram> getById(@PathVariable Integer id) {
        Optional<InternshipProgram> program = repository.findById(id);
        return program.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // New method: Get programs by org ID
    @GetMapping("/by-org/{orgId}")
    public ResponseEntity<List<InternshipProgram>> getByOrgId(@PathVariable Integer orgId) {
        List<InternshipProgram> programs = repository.findByIntOrgId(orgId);
        return ResponseEntity.ok(programs);
    }

    // POST create new program
    @PostMapping
    public ResponseEntity<InternshipProgram> create(@RequestBody InternshipProgram newProgram) {
        InternshipProgram saved = repository.save(newProgram);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT full update
    @PutMapping("/{id}")
    public ResponseEntity<InternshipProgram> update(@PathVariable Integer id, @RequestBody InternshipProgram updatedProgram) {
        return repository.findById(id)
                .map(program -> {
                    updatedProgram.setIntProgId(id);
                    updatedProgram.setCreatedAt(program.getCreatedAt());
                    updatedProgram.setUpdatedAt(LocalDateTime.now());
                    InternshipProgram saved = repository.save(updatedProgram);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // PATCH partial update
    @PatchMapping("/{id}")
    public ResponseEntity<InternshipProgram> partialUpdate(@PathVariable Integer id, @RequestBody InternshipProgram partialUpdate) {
        return repository.findById(id)
                .map(program -> {
                    if (partialUpdate.getIntProgName() != null) {
                        program.setIntProgName(partialUpdate.getIntProgName());
                    }
                    if (partialUpdate.getIntProgDescription() != null) {
                        program.setIntProgDescription(partialUpdate.getIntProgDescription());
                    }
                    if (partialUpdate.getIntOrgId() != null) {
                        program.setIntOrgId(partialUpdate.getIntOrgId());
                    }
                    if (partialUpdate.getIntCoordinatorUserId() != null) {
                        program.setIntCoordinatorUserId(partialUpdate.getIntCoordinatorUserId());
                    }
                    if (partialUpdate.getProgStartDate() != null) {
                        program.setProgStartDate(partialUpdate.getProgStartDate());
                    }
                    if (partialUpdate.getProgEndDate() != null) {
                        program.setProgEndDate(partialUpdate.getProgEndDate());
                    }
                    if (partialUpdate.getProgDurationWeeks() != null) {
                        program.setProgDurationWeeks(partialUpdate.getProgDurationWeeks());
                    }
                    if (partialUpdate.getProgMaxApplicants() != null) {
                        program.setProgMaxApplicants(partialUpdate.getProgMaxApplicants());
                    }
                    if (partialUpdate.getProgStatus() != null) {
                        program.setProgStatus(partialUpdate.getProgStatus());
                    }
                    program.setUpdatedAt(LocalDateTime.now());
                    InternshipProgram saved = repository.save(program);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // DELETE program
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
