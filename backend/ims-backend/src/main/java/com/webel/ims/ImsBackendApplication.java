// backend/ims-backend/src/main/java/com/webel/ims/ImsBackendApplication.java
package com.webel.ims;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.webel.ims")
@EnableJpaRepositories(basePackages = "com.webel.ims")
public class ImsBackendApplication {

    private static final Logger logger = LoggerFactory.getLogger(ImsBackendApplication.class);

    public static void main(String[] args) {
        ApplicationContext context = SpringApplication.run(ImsBackendApplication.class, args);
        logger.info("Application started successfully");
        // Log all bean definitions to debug entity detection
        String[] beanNames = context.getBeanDefinitionNames();
        for (String beanName : beanNames) {
            logger.debug("Bean: {}", beanName);
        }
    }
}