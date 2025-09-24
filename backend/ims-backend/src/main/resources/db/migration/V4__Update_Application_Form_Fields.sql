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

-- Add current_address column if it doesn't exist (this replaces the rename operation)
ALTER TABLE internship_application_master
ADD COLUMN IF NOT EXISTS current_address TEXT;

-- Drop the old, now unused 'academic_transcript_path' column
ALTER TABLE internship_application_master
DROP COLUMN IF EXISTS academic_transcript_path;