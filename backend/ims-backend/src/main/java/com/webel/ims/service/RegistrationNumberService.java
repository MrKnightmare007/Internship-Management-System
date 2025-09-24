package com.webel.ims.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Random;

@Service
public class RegistrationNumberService {
    
    public String generateRegistrationNumber() {
        // Format: CS25S26522498
        // CS - Computer Science prefix
        // 25 - Year (2025)
        // S - Session identifier
        // 26 - Current month + day indicator
        // 522498 - Random 6-digit number
        
        LocalDate now = LocalDate.now();
        int year = now.getYear() % 100; // Get last 2 digits of year
        int month = now.getMonthValue();
        int day = now.getDayOfMonth();
        
        // Generate 6-digit random number
        Random random = new Random();
        int randomNumber = 100000 + random.nextInt(900000);
        
        // Combine month and day to create a 2-digit identifier
        int monthDayIndicator = (month + day) % 100;
        
        return String.format("CS%02dS%02d%d", year, monthDayIndicator, randomNumber);
    }
    
    public boolean isValidRegistrationNumber(String regNumber) {
        // Validate format: CS##S######
        return regNumber != null && 
               regNumber.matches("^CS\\d{2}S\\d{2}\\d{6}$") && 
               regNumber.length() == 11;
    }
}