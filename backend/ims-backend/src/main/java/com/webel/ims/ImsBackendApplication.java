// backend/ims-backend/src/main/java/com/webel/ims/ImsBackendApplication.java
package com.webel.ims;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.MultipartConfigFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.util.unit.DataSize;

import jakarta.servlet.MultipartConfigElement;

@SpringBootApplication
public class ImsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(ImsBackendApplication.class, args);
    }

    // --- NEW BEAN TO FIX MULTIPART PARSING ISSUE ---
    @Bean
    public MultipartConfigElement multipartConfigElement() {
        MultipartConfigFactory factory = new MultipartConfigFactory();
        // Set the maximum file size (e.g., 10MB)
        factory.setMaxFileSize(DataSize.ofMegabytes(10));
        // Set the total request size (e.g., 10MB)
        factory.setMaxRequestSize(DataSize.ofMegabytes(10));
        return factory.createMultipartConfig();
    }
}