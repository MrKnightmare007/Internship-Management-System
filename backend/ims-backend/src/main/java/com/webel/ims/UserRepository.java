package com.webel.ims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUserEmail(String userEmail); // Added for validation
    
    // Find all users associated with a specific organization ID
    List<User> findByOrganizationOrgId(Integer orgId);
    
    // Find user with organization eagerly loaded
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.organization WHERE u.username = :username")
    Optional<User> findByUsernameWithOrganization(@Param("username") String username);
}