-- V9__Add_Organizer_Signature_To_Exam_Details.sql
-- Migration to add organizer signature path column to exam_details table

-- Add organizer signature path column to exam_details table
ALTER TABLE exam_details 
ADD COLUMN organizer_signature_path VARCHAR(500);

-- Add comment to the column
COMMENT ON COLUMN exam_details.organizer_signature_path IS 'File path to the uploaded organizer signature image';