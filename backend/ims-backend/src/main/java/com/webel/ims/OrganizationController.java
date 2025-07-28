package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/organizations")
public class OrganizationController {

    @Autowired
    private OrganizationRepository repository;

    @GetMapping
    public List<OrganizationMaster> getAll() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationMaster> getById(@PathVariable Integer id) {
        Optional<OrganizationMaster> org = repository.findById(id);
        return org.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<OrganizationMaster> create(@RequestBody OrganizationMaster newOrg) {
        if (repository.existsByOrgName(newOrg.getOrgName())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        OrganizationMaster saved = repository.save(newOrg);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationMaster> update(@PathVariable Integer id, @RequestBody OrganizationMaster updatedOrg) {
        return repository.findById(id)
                .map(org -> {
                    updatedOrg.setOrgId(id);
                    updatedOrg.setCreatedAt(org.getCreatedAt());
                    updatedOrg.setUpdatedAt(LocalDateTime.now());
                    OrganizationMaster saved = repository.save(updatedOrg);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<OrganizationMaster> partialUpdate(@PathVariable Integer id, @RequestBody OrganizationMaster partialUpdate) {
        return repository.findById(id)
                .map(org -> {
                    if (partialUpdate.getOrgName() != null) {
                        org.setOrgName(partialUpdate.getOrgName());
                    }
                    if (partialUpdate.getOrgAddress() != null) {
                        org.setOrgAddress(partialUpdate.getOrgAddress());
                    }
                    if (partialUpdate.getOrgContactEmail() != null) {
                        org.setOrgContactEmail(partialUpdate.getOrgContactEmail());
                    }
                    if (partialUpdate.getOrgContactPhone() != null) {
                        org.setOrgContactPhone(partialUpdate.getOrgContactPhone());
                    }
                    if (partialUpdate.getOrgWebsite() != null) {
                        org.setOrgWebsite(partialUpdate.getOrgWebsite());
                    }
                    if (partialUpdate.getOrgStatus() != null) {
                        org.setOrgStatus(partialUpdate.getOrgStatus());
                    }
                    org.setUpdatedAt(LocalDateTime.now());
                    OrganizationMaster saved = repository.save(org);
                    return ResponseEntity.ok(saved);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}