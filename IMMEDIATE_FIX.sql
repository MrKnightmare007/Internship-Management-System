-- IMMEDIATE FIX: Run this SQL script on your database to add missing columns
-- This will fix the 500 error you're getting

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS resume_path VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS cover_letter_path VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS academic_transcript_path VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS additional_documents_path TEXT NULL;

-- If the above doesn't work (older MySQL versions), use this instead:
-- ALTER TABLE internship_application_master ADD COLUMN resume_path VARCHAR(500) NULL;
-- ALTER TABLE internship_application_master ADD COLUMN cover_letter_path VARCHAR(500) NULL;
-- ALTER TABLE internship_application_master ADD COLUMN academic_transcript_path VARCHAR(500) NULL;
-- ALTER TABLE internship_application_master ADD COLUMN additional_documents_path TEXT NULL;

-- Verify columns were added
SHOW COLUMNS FROM internship_application_master;