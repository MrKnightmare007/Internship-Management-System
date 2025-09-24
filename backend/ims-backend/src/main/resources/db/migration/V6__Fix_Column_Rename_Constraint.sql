-- V6: Fix Column Rename and Constraint Issues
-- Date: 2025-09-22
-- Description: Ensure proper column rename and handle constraints for PostgreSQL

-- First, check if the old column exists and rename it properly
DO $$
BEGIN
    -- Check if communication_address exists and current_address doesn't
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'communication_address') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'internship_application_master' 
                    AND column_name = 'current_address') THEN
        -- Rename the column
        ALTER TABLE internship_application_master 
        RENAME COLUMN communication_address TO current_address;
    END IF;
    
    -- If both exist, copy data and drop old column
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'communication_address') 
    AND EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'internship_application_master' 
                AND column_name = 'current_address') THEN
        -- Copy data from old to new column if new column is empty
        UPDATE internship_application_master 
        SET current_address = communication_address 
        WHERE current_address IS NULL AND communication_address IS NOT NULL;
        
        -- Drop the old column
        ALTER TABLE internship_application_master 
        DROP COLUMN communication_address;
    END IF;
END $$;

-- Ensure current_address column exists with proper constraints
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS current_address TEXT;

-- Ensure permanent_address column exists
ALTER TABLE internship_application_master 
ADD COLUMN IF NOT EXISTS permanent_address TEXT;

-- Update any existing records with NULL current_address to empty string to avoid constraints
UPDATE internship_application_master 
SET current_address = '' 
WHERE current_address IS NULL;