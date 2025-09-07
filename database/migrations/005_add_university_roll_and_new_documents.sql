-- Migration to add university roll number and update document fields
-- Date: 2025-01-07
-- Description: Add university_roll_no field and replace document fields with specific document types

-- Add university roll number field
ALTER TABLE internship_application_master 
ADD COLUMN university_roll_no VARCHAR(100);

-- Drop old document columns if they exist
ALTER TABLE internship_application_master 
DROP COLUMN IF EXISTS resume_path,
DROP COLUMN IF EXISTS academic_transcript_path,
DROP COLUMN IF EXISTS additional_documents_path;

-- Add new specific document columns
ALTER TABLE internship_application_master 
ADD COLUMN aadhar_card_path VARCHAR(500),
ADD COLUMN class_x_marksheet_path VARCHAR(500),
ADD COLUMN class_xii_marksheet_path VARCHAR(500);

-- Update existing cover_letter_path column if it doesn't exist
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS cover_letter_path VARCHAR(500);

-- Add comments for documentation
COMMENT ON COLUMN internship_application_master.university_roll_no IS 'University roll number of the student';
COMMENT ON COLUMN internship_application_master.aadhar_card_path IS 'File path for uploaded Aadhar card document';
COMMENT ON COLUMN internship_application_master.class_x_marksheet_path IS 'File path for uploaded Class X marksheet';
COMMENT ON COLUMN internship_application_master.class_xii_marksheet_path IS 'File path for uploaded Class XII marksheet';
COMMENT ON COLUMN internship_application_master.cover_letter_path IS 'File path for uploaded cover letter (optional)';