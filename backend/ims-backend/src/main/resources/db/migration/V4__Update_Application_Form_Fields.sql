-- V4: Update Internship Application Table with new fields for Government ID, Domicile, and Addresses

-- Add new columns for City, State, and Permanent Address
ALTER TABLE internship_application_master
ADD COLUMN IF NOT EXISTS city_of_domicile VARCHAR(255),
ADD COLUMN IF NOT EXISTS state_of_domicile VARCHAR(255),
ADD COLUMN IF NOT EXISTS permanent_address TEXT;

-- Add new columns for Government ID proof
ALTER TABLE internship_application_master
ADD COLUMN IF NOT EXISTS government_id_type VARCHAR(100),
ADD COLUMN IF NOT EXISTS government_id_path VARCHAR(512);

-- Rename 'communication_address' to 'current_address' for clarity
ALTER TABLE internship_application_master
RENAME COLUMN communication_address TO current_address;

-- Drop the old, now unused 'academic_transcript_path' column
ALTER TABLE internship_application_master
DROP COLUMN IF EXISTS academic_transcript_path;
