-- Script to verify that your internship_application_master table has the correct structure
-- Run this to check if the document columns exist

-- For MySQL:
SHOW COLUMNS FROM internship_application_master;

-- Alternative for MySQL to see specific columns:
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'internship_application_master' 
AND COLUMN_NAME IN ('resume_path', 'cover_letter_path', 'academic_transcript_path', 'additional_documents_path');

-- For PostgreSQL:
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'internship_application_master' 
-- AND column_name IN ('resume_path', 'cover_letter_path', 'academic_transcript_path', 'additional_documents_path');

-- Expected output should show these columns:
-- resume_path (VARCHAR(500), nullable)
-- cover_letter_path (VARCHAR(500), nullable) 
-- academic_transcript_path (VARCHAR(500), nullable)
-- additional_documents_path (TEXT, nullable)