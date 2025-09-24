-- V12__Fix_Communication_Address.sql
-- Fix the default value for current_address column in internship_application_master table

-- Only update if the column exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'internship_application_master' 
        AND column_name = 'current_address'
    ) THEN
        ALTER TABLE internship_application_master
        ALTER COLUMN current_address SET DEFAULT '';
        
        UPDATE internship_application_master
        SET current_address = ''
        WHERE current_address IS NULL;
    END IF;
END $$;