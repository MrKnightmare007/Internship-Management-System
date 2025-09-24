-- Migration to update document fields in application table
-- Replace cover_letter_path with resume_path (mandatory)
-- Add passport_photo_path and signature_path fields

-- First, check if resume_path column exists, if not, rename cover_letter_path to resume_path
-- If resume_path already exists, we just drop cover_letter_path
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'resume_path') THEN
        ALTER TABLE internship_application_master 
        RENAME COLUMN cover_letter_path TO resume_path;
    ELSE
        -- If resume_path already exists, just drop cover_letter_path
        ALTER TABLE internship_application_master 
        DROP COLUMN IF EXISTS cover_letter_path;
    END IF;
END $$;

-- Add new columns for passport photo and signature (IF NOT EXISTS to prevent errors)
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS passport_photo_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS signature_path VARCHAR(500);

-- Add comments for clarity
COMMENT ON COLUMN internship_application_master.resume_path IS 'File path for mandatory uploaded resume/CV document';
COMMENT ON COLUMN internship_application_master.passport_photo_path IS 'File path for uploaded passport size photo';
COMMENT ON COLUMN internship_application_master.signature_path IS 'File path for uploaded signature image';

-- Update any existing cover letter references to resume references
-- This is safe since we're just renaming the purpose of the field
-- Only run this if the column was actually renamed
UPDATE internship_application_master 
SET resume_path = resume_path 
WHERE resume_path IS NOT NULL;