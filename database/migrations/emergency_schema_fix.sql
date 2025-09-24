-- EMERGENCY SCHEMA FIX for PostgreSQL Database
-- This script resolves the communication_address constraint issue
-- Run this script directly in your PostgreSQL client (pgAdmin, DBeaver, etc.)

-- Connect to: postgresql://postgres:postgres@localhost:5432/ims_db

-- Step 1: Check current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'internship_application_master' 
ORDER BY ordinal_position;

-- Step 2: Check if communication_address column exists
SELECT CASE 
    WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'internship_application_master' 
        AND column_name = 'communication_address'
    ) THEN 'communication_address column EXISTS - NEEDS FIXING'
    ELSE 'communication_address column does NOT exist - OK'
END as column_status;

-- Step 3: Fix the schema issues
DO $$
BEGIN
    -- Check if communication_address exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'communication_address') THEN
        
        RAISE NOTICE 'Found communication_address column, fixing...';
        
        -- If current_address doesn't exist, rename communication_address to current_address
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                       WHERE table_name = 'internship_application_master' 
                       AND column_name = 'current_address') THEN
            RAISE NOTICE 'Renaming communication_address to current_address';
            ALTER TABLE internship_application_master 
            RENAME COLUMN communication_address TO current_address;
        ELSE
            -- Both columns exist, copy data and drop old one
            RAISE NOTICE 'Both columns exist, copying data and dropping communication_address';
            UPDATE internship_application_master 
            SET current_address = COALESCE(current_address, communication_address);
            
            ALTER TABLE internship_application_master 
            DROP COLUMN communication_address;
        END IF;
    ELSE
        RAISE NOTICE 'communication_address column does not exist - schema is correct';
    END IF;
    
    -- Ensure current_address column exists and has proper type
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'current_address') THEN
        RAISE NOTICE 'Adding current_address column';
        ALTER TABLE internship_application_master 
        ADD COLUMN current_address TEXT;
    END IF;
    
    -- Remove NOT NULL constraint from current_address if it exists
    ALTER TABLE internship_application_master 
    ALTER COLUMN current_address DROP NOT NULL;
    
    -- Ensure other required columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'permanent_address') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN permanent_address TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'city_of_domicile') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN city_of_domicile VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'state_of_domicile') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN state_of_domicile VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'government_id_type') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN government_id_type VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'government_id_path') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN government_id_path VARCHAR(512);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'course_stream') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN course_stream VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'internship_application_master' 
                   AND column_name = 'university_roll_no') THEN
        ALTER TABLE internship_application_master 
        ADD COLUMN university_roll_no VARCHAR(100);
    END IF;
    
    -- Drop current_course column if it exists (old column)
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'internship_application_master' 
               AND column_name = 'current_course') THEN
        RAISE NOTICE 'Dropping old current_course column';
        ALTER TABLE internship_application_master 
        DROP COLUMN current_course;
    END IF;
    
    RAISE NOTICE 'Schema fix completed successfully!';
END $$;

-- Step 4: Verify the final schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'internship_application_master' 
AND column_name IN ('current_address', 'permanent_address', 'course_stream', 'university_roll_no', 'communication_address')
ORDER BY column_name;

-- Step 5: Show any remaining NOT NULL constraints that might cause issues
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'internship_application_master' 
AND is_nullable = 'NO'
AND column_default IS NULL
ORDER BY column_name;