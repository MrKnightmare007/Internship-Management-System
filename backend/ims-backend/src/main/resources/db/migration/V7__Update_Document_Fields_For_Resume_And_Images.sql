-- Migration to update document fields in application table
-- Replace cover_letter_path with resume_path (mandatory)
-- Add passport_photo_path and signature_path fields

-- First, rename the existing cover_letter_path column to resume_path
ALTER TABLE internship_application_master 
RENAME COLUMN cover_letter_path TO resume_path;

-- Add new columns for passport photo and signature
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS passport_photo_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS signature_path VARCHAR(500);

-- Add comments for clarity
COMMENT ON COLUMN internship_application_master.resume_path IS 'File path for mandatory uploaded resume/CV document';
COMMENT ON COLUMN internship_application_master.passport_photo_path IS 'File path for uploaded passport size photo';
COMMENT ON COLUMN internship_application_master.signature_path IS 'File path for uploaded signature image';

-- Update any existing cover letter references to resume references
-- This is safe since we're just renaming the purpose of the field
UPDATE internship_application_master 
SET resume_path = resume_path 
WHERE resume_path IS NOT NULL;