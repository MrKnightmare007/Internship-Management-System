-- Manual Database Schema Fix
-- This script will fix the column naming issue in PostgreSQL

-- First, let's see what columns actually exist
-- Run this in your PostgreSQL client to check current schema:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'internship_application_master' ORDER BY column_name;

-- If communication_address exists and current_address doesn't exist, rename it:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'communication_address') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'internship_application_master' 
                    AND column_name = 'current_address') THEN
        ALTER TABLE internship_application_master 
        RENAME COLUMN communication_address TO current_address;
        RAISE NOTICE 'Renamed communication_address to current_address';
    END IF;
END $$;

-- If both columns exist, copy data and drop old one:
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'communication_address') 
    AND EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'internship_application_master' 
                AND column_name = 'current_address') THEN
        UPDATE internship_application_master 
        SET current_address = COALESCE(current_address, communication_address);
        
        ALTER TABLE internship_application_master 
        DROP COLUMN communication_address;
        RAISE NOTICE 'Copied data from communication_address to current_address and dropped old column';
    END IF;
END $$;

-- Ensure the required columns exist with proper data types:
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS current_address TEXT;

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS permanent_address TEXT;

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS city_of_domicile VARCHAR(255);

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS state_of_domicile VARCHAR(255);

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS government_id_type VARCHAR(100);

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS government_id_path VARCHAR(512);

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS course_stream VARCHAR(255);

ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS university_roll_no VARCHAR(100);

-- Drop the old current_course column if it exists:
ALTER TABLE internship_application_master 
DROP COLUMN IF EXISTS current_course;

-- Remove any NOT NULL constraints that might be causing issues
ALTER TABLE internship_application_master 
ALTER COLUMN current_address DROP NOT NULL;

ALTER TABLE internship_application_master 
ALTER COLUMN permanent_address DROP NOT NULL;