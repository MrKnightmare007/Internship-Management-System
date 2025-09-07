-- Verify that all document columns exist in the database
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'internship_application_master' 
AND COLUMN_NAME IN ('resume_path', 'cover_letter_path', 'academic_transcript_path', 'additional_documents_path')
ORDER BY COLUMN_NAME;

-- This should show 4 rows with the document columns