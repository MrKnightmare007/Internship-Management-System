-- V5: Synchronize Application Schema with Frontend Form Fields
-- Date: 2025-09-22
-- Description: Update internship_application_master table to align with frontend form fields

-- Remove old aadhar_card_path column (replaced by government_id_path in V4)
ALTER TABLE internship_application_master 
DROP COLUMN IF EXISTS aadhar_card_path;

-- Ensure government_id_path exists (should be from V4 but let's be safe)
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS government_id_path VARCHAR(500);

-- Rename current_course to course_stream to match frontend
ALTER TABLE internship_application_master 
CHANGE COLUMN current_course course_stream VARCHAR(255);

-- Add university_roll_no if it doesn't exist (should be from earlier migration)
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS university_roll_no VARCHAR(100);

-- Update comments for documentation
COMMENT ON COLUMN internship_application_master.course_stream IS 'Course name with stream as provided by student';
COMMENT ON COLUMN internship_application_master.government_id_path IS 'File path for uploaded government ID document (Aadhar, PAN, etc.)';
COMMENT ON COLUMN internship_application_master.university_roll_no IS 'University roll number of the student';