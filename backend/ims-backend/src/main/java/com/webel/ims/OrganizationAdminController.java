package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/organization-admins")
public class OrganizationAdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/create")
    public ResponseEntity<?> createOrganizationAdmin(@RequestBody Map<String, String> payload) {
        try {
            String username = payload.get("username");
            String email = payload.get("email");
            Integer orgId = Integer.parseInt(payload.get("orgId"));

            if (userRepository.findByUsername(username).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Username is already taken."));
            }
            if (userRepository.findByUserEmail(email).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "Error: Email is already in use."));
            }

            Optional<OrganizationMaster> organization = organizationRepository.findById(orgId);
            if (organization.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Error: Organization not found."));
            }

            User newUser = new User();
            newUser.setUsername(username);
            newUser.setUserEmail(email);
            newUser.setUserPassword(passwordEncoder.encode("org_admin"));
            newUser.setUserType("ORGANIZATION_MASTER");
            newUser.setUserStatus("ACTIVE");
            newUser.setOrganization(organization.get());

            userRepository.save(newUser);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("message", "Organization Master created successfully."));

        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "A user with this username or email already exists."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "An unexpected server error occurred."));
        }
    }
    
    // **FIXED**: This endpoint now returns a list of UserDto objects instead of User entities.
    @GetMapping("/by-org/{orgId}")
    public ResponseEntity<List<UserDto>> getAdminsByOrg(@PathVariable Integer orgId) {
        List<User> users = userRepository.findByOrganizationOrgId(orgId);
        
        // Convert the list of User entities to a list of safe UserDto objects
        List<UserDto> userDtos = users.stream()
                                      .map(UserDto::new) // Uses the constructor UserDto(User user)
                                      .collect(Collectors.toList());
                                      
        return ResponseEntity.ok(userDtos);
    }
}
