-- Check if the document columns exist and add them if they don't
-- Run this script on your MySQL database

-- Check current table structure
DESCRIBE internship_application_master;

-- Add columns if they don't exist (MySQL 5.7+ syntax)
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'internship_application_master' 
     AND column_name = 'resume_path') > 0,
    'SELECT "resume_path column already exists" as message;',
    'ALTER TABLE internship_application_master ADD COLUMN resume_path VARCHAR(500) NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'internship_application_master' 
     AND column_name = 'cover_letter_path') > 0,
    'SELECT "cover_letter_path column already exists" as message;',
    'ALTER TABLE internship_application_master ADD COLUMN cover_letter_path VARCHAR(500) NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'internship_application_master' 
     AND column_name = 'academic_transcript_path') > 0,
    'SELECT "academic_transcript_path column already exists" as message;',
    'ALTER TABLE internship_application_master ADD COLUMN academic_transcript_path VARCHAR(500) NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE table_name = 'internship_application_master' 
     AND column_name = 'additional_documents_path') > 0,
    'SELECT "additional_documents_path column already exists" as message;',
    'ALTER TABLE internship_application_master ADD COLUMN additional_documents_path TEXT NULL;'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Final check - show the table structure
DESCRIBE internship_application_master;