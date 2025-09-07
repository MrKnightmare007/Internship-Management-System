-- Script to add missing document columns to internship_application_master table
-- Run this script to fix the database schema

-- For MySQL - Add columns if they don't exist
SET @sql = '';
SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_name = 'internship_application_master' AND column_name = 'resume_path';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE internship_application_master ADD COLUMN resume_path VARCHAR(500) NULL;', 
    'SELECT "resume_path column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_name = 'internship_application_master' AND column_name = 'cover_letter_path';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE internship_application_master ADD COLUMN cover_letter_path VARCHAR(500) NULL;', 
    'SELECT "cover_letter_path column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_name = 'internship_application_master' AND column_name = 'academic_transcript_path';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE internship_application_master ADD COLUMN academic_transcript_path VARCHAR(500) NULL;', 
    'SELECT "academic_transcript_path column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT COUNT(*) INTO @col_exists FROM information_schema.columns 
WHERE table_name = 'internship_application_master' AND column_name = 'additional_documents_path';

SET @sql = IF(@col_exists = 0, 
    'ALTER TABLE internship_application_master ADD COLUMN additional_documents_path TEXT NULL;', 
    'SELECT "additional_documents_path column already exists";');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify the columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'internship_application_master' 
AND COLUMN_NAME IN ('resume_path', 'cover_letter_path', 'academic_transcript_path', 'additional_documents_path');

-- If the above doesn't work, use this simpler approach:
-- ALTER TABLE internship_application_master 
-- ADD COLUMN IF NOT EXISTS resume_path VARCHAR(500) NULL,
-- ADD COLUMN IF NOT EXISTS cover_letter_path VARCHAR(500) NULL,
-- ADD COLUMN IF NOT EXISTS academic_transcript_path VARCHAR(500) NULL,
-- ADD COLUMN IF NOT EXISTS additional_documents_path TEXT NULL;