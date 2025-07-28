package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrganizationRepository extends JpaRepository<OrganizationMaster, Integer> {
    // Custom query to check if org exists by name
    boolean existsByOrgName(String orgName);
}