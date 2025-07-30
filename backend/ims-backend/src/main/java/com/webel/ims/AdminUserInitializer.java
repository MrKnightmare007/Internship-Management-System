package com.webel.ims;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminUserInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // --- DEFINE YOUR SUPER ADMIN CREDENTIALS HERE ---
        String adminEmail = "admin@webel.com";
        String adminUsername = "superadmin";
        String adminPassword = "password123"; // Choose a strong password

        // Check if the admin user already exists
        if (userRepository.findByUserEmail(adminEmail).isEmpty()) {
            System.out.println(">>> CREATING SUPER ADMIN USER <<<");

            User adminUser = new User();
            adminUser.setUsername(adminUsername);
            adminUser.setUserEmail(adminEmail);
            adminUser.setUserPassword(passwordEncoder.encode(adminPassword)); // Encrypt the password
            adminUser.setUserType("SUPER_ADMIN");
            adminUser.setUserStatus("ACTIVE");

            userRepository.save(adminUser);

            System.out.println(">>> SUPER ADMIN CREATED SUCCESSFULLY <<<");
        } else {
            System.out.println(">>> Super admin user already exists. Skipping creation. <<<");
        }
    }
}