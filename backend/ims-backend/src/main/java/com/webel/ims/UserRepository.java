package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUserEmail(String userEmail); // Added for validation
    
    // Find all users associated with a specific organization ID
    List<User> findByOrganizationOrgId(Integer orgId); 
}
