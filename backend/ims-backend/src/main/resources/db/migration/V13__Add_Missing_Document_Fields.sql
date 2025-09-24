-- Migration to add missing document fields in internship_application_master table
-- Add passport_photo_path and signature_path fields if they don't exist

-- Add new columns for passport photo and signature
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS passport_photo_path VARCHAR(500),
ADD COLUMN IF NOT EXISTS signature_path VARCHAR(500);

-- Add comments for clarity
COMMENT ON COLUMN internship_application_master.passport_photo_path IS 'File path for uploaded passport size photo';
COMMENT ON COLUMN internship_application_master.signature_path IS 'File path for uploaded signature image';