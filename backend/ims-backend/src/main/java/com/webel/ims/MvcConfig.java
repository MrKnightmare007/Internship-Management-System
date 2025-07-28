package com.webel.ims;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Get the absolute path to the 'uploads' directory
        String uploadDir = Paths.get("./uploads/").toFile().getAbsolutePath();

        // This line maps web requests for '/uploads/**' to the physical 'uploads'
        // directory on your server.
        // For example, a request to 'http://localhost:8080/uploads/my-image.png'
        // will serve the file from '[your-project-path]/uploads/my-image.png'.
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:/" + uploadDir + "/");
    }
}
