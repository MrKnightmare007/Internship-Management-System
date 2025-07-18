package com.webel.ims;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/programs")
public class InternshipProgramController {

    // Static in-memory list for testing
    private List<InternshipProgram> programs = new ArrayList<>();

    // Initialize with sample data (simulates DB records)
    public InternshipProgramController() {
        programs.add(new InternshipProgram(1, "Sample Program 1", "Description 1", 1, 1, 
            LocalDate.parse("2025-08-01"), LocalDate.parse("2025-11-01"), 12, 50, "ACTIVE", 
            LocalDate.now(), LocalDate.now()));
        programs.add(new InternshipProgram(2, "Sample Program 2", "Description 2", 2, 2, 
            LocalDate.parse("2025-09-01"), LocalDate.parse("2025-12-01"), 13, 30, "DRAFT", 
            LocalDate.now(), LocalDate.now()));
    }

    // GET all programs
    @GetMapping
    public List<InternshipProgram> getAll() {
        return programs;
    }

    // GET by ID
    @GetMapping("/{id}")
    public ResponseEntity<InternshipProgram> getById(@PathVariable Integer id) {
        Optional<InternshipProgram> program = programs.stream()
            .filter(p -> p.getIntProgId().equals(id))
            .findFirst();
        return program.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // POST create new program
    @PostMapping
    public ResponseEntity<InternshipProgram> create(@RequestBody InternshipProgram newProgram) {
        // Simulate auto-increment ID
        newProgram.setIntProgId(programs.size() + 1);
        programs.add(newProgram);
        return ResponseEntity.status(HttpStatus.CREATED).body(newProgram);
    }

    // PUT update existing program
    @PutMapping("/{id}")
    public ResponseEntity<InternshipProgram> update(@PathVariable Integer id, @RequestBody InternshipProgram updatedProgram) {
        for (int i = 0; i < programs.size(); i++) {
            if (programs.get(i).getIntProgId().equals(id)) {
                updatedProgram.setIntProgId(id);
                programs.set(i, updatedProgram);
                return ResponseEntity.ok(updatedProgram);
            }
        }
        return ResponseEntity.notFound().build();
    }

    // DELETE program
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (programs.removeIf(p -> p.getIntProgId().equals(id))) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
