-- V5: Synchronize Application Schema with Frontend Form Fields
-- Date: 2025-09-22
-- Description: Update internship_application_master table to align with frontend form fields

-- Remove old aadhar_card_path column (replaced by government_id_path in V4)
ALTER TABLE internship_application_master 
DROP COLUMN IF EXISTS aadhar_card_path;

-- Ensure government_id_path exists (should be from V4 but let's be safe)
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS government_id_path VARCHAR(500);

-- Check if current_course exists and rename it to course_stream to match frontend
DO $$
BEGIN
    -- Check if current_course exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'current_course') THEN
        -- Add the new column if it doesn't exist
        ALTER TABLE internship_application_master 
        ADD COLUMN IF NOT EXISTS course_stream VARCHAR(255);
        
        -- Copy data from old column to new column
        UPDATE internship_application_master 
        SET course_stream = current_course 
        WHERE current_course IS NOT NULL;
        
        -- Drop the old column
        ALTER TABLE internship_application_master 
        DROP COLUMN IF EXISTS current_course;
    END IF;
END $$;

-- Add university_roll_no if it doesn't exist (should be from earlier migration)
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS university_roll_no VARCHAR(100);

-- Update comments for documentation
COMMENT ON COLUMN internship_application_master.course_stream IS 'Course name with stream as provided by student';
COMMENT ON COLUMN internship_application_master.government_id_path IS 'File path for uploaded government ID document (Aadhar, PAN, etc.)';
COMMENT ON COLUMN internship_application_master.university_roll_no IS 'University roll number of the student';