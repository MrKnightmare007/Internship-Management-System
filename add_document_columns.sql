-- Manual SQL script to add document upload columns to internship_application_master table
-- Run this script on your database to add the necessary columns

-- Check if columns exist before adding them (MySQL/PostgreSQL compatible)
-- For MySQL:
ALTER TABLE internship_application_master 
ADD COLUMN resume_path VARCHAR(500) NULL,
ADD COLUMN cover_letter_path VARCHAR(500) NULL,
ADD COLUMN academic_transcript_path VARCHAR(500) NULL,
ADD COLUMN additional_documents_path TEXT NULL;

-- For PostgreSQL (if using PostgreSQL instead):
-- ALTER TABLE internship_application_master 
-- ADD COLUMN IF NOT EXISTS resume_path VARCHAR(500),
-- ADD COLUMN IF NOT EXISTS cover_letter_path VARCHAR(500),
-- ADD COLUMN IF NOT EXISTS academic_transcript_path VARCHAR(500),
-- ADD COLUMN IF NOT EXISTS additional_documents_path TEXT;

-- Verify the columns were added
DESCRIBE internship_application_master;

-- Or for PostgreSQL:
-- \d internship_application_master;