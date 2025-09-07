-- Simple script to add document columns to internship_application_master table
-- Run this script on your database

ALTER TABLE internship_application_master 
ADD COLUMN resume_path VARCHAR(500) NULL,
ADD COLUMN cover_letter_path VARCHAR(500) NULL,
ADD COLUMN academic_transcript_path VARCHAR(500) NULL,
ADD COLUMN additional_documents_path TEXT NULL;

-- Verify columns were added
DESCRIBE internship_application_master;