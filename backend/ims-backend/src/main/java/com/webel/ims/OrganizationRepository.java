package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrganizationRepository extends JpaRepository<OrganizationMaster, Integer> {
    // Custom query to check if org exists by name
    boolean existsByOrgName(String orgName);
    // Find by organization name
    Optional<OrganizationMaster> findByOrgName(String orgName);
    // Find by organization abbreviation
    Optional<OrganizationMaster> findByOrgAbbreviation(String orgAbbreviation);
}