-- Migration to add document upload fields to internship_application_master table
-- This adds the necessary columns for storing document file paths

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS resume_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS cover_letter_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS academic_transcript_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS additional_documents_path TEXT;

-- Add comments for clarity
COMMENT ON COLUMN internship_application_master.resume_path IS 'File path for uploaded resume/CV document';
COMMENT ON COLUMN internship_application_master.cover_letter_path IS 'File path for uploaded cover letter document';
COMMENT ON COLUMN internship_application_master.academic_transcript_path IS 'File path for uploaded academic transcript document';
COMMENT ON COLUMN internship_application_master.additional_documents_path IS 'JSON array of file paths for additional uploaded documents';