-- V10__Create_Selected_Students_Table.sql
-- Migration to create selected_students table for finally selected students after exam process

-- Create selected_students table to store finally selected students for internship
-- Only create if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'selected_students'
    ) THEN
        CREATE TABLE selected_students (
            selected_id SERIAL PRIMARY KEY,
            accepted_id INTEGER NOT NULL,
            application_id INTEGER NOT NULL,
            program_id INTEGER NOT NULL,
            exam_id INTEGER,
            shift_id INTEGER,
            registration_number VARCHAR(50) NOT NULL,
            final_score DECIMAL(5,2),
            exam_marks DECIMAL(5,2),
            selection_remarks TEXT,
            selected_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            selected_by INTEGER NOT NULL,
            internship_start_date DATE,
            internship_end_date DATE,
            status VARCHAR(20) NOT NULL DEFAULT 'SELECTED',
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    END IF;
END $$;

-- Add foreign key constraints only if they don't exist and referenced tables/columns exist
DO $$ 
BEGIN
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_accepted' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'accepted_students'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_accepted FOREIGN KEY (accepted_id) 
            REFERENCES accepted_students(accepted_id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_application' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table and column exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'internship_application_master'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'internship_application_master' AND column_name = 'id'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_application FOREIGN KEY (application_id) 
            REFERENCES internship_application_master(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_program' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table and column exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'internship_program_master'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'internship_program_master' AND column_name = 'int_prog_id'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_program FOREIGN KEY (program_id) 
            REFERENCES internship_program_master(int_prog_id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_exam' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'exam_details'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_exam FOREIGN KEY (exam_id) 
            REFERENCES exam_details(exam_id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_shift' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table exists
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'exam_shifts'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_shift FOREIGN KEY (shift_id) 
            REFERENCES exam_shifts(shift_id) ON DELETE SET NULL;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_selected_by_user' 
        AND table_name = 'selected_students'
    ) THEN
        -- Check if the referenced table and column exist
        IF EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_master'
        ) AND EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'user_master' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE selected_students 
            ADD CONSTRAINT fk_selected_by_user FOREIGN KEY (selected_by) 
            REFERENCES user_master(user_id) ON DELETE RESTRICT;
        END IF;
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uk_selected_accepted' 
        AND table_name = 'selected_students'
    ) THEN
        ALTER TABLE selected_students 
        ADD CONSTRAINT uk_selected_accepted UNIQUE (accepted_id);
    END IF;
    
    -- Check if the constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'uk_selected_registration' 
        AND table_name = 'selected_students'
    ) THEN
        ALTER TABLE selected_students 
        ADD CONSTRAINT uk_selected_registration UNIQUE (registration_number, program_id);
    END IF;
END $$;

-- Create indexes for better performance (check if they exist first)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'selected_students' AND indexname = 'idx_selected_students_program_id'
    ) THEN
        CREATE INDEX idx_selected_students_program_id ON selected_students(program_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'selected_students' AND indexname = 'idx_selected_students_registration'
    ) THEN
        CREATE INDEX idx_selected_students_registration ON selected_students(registration_number);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'selected_students' AND indexname = 'idx_selected_students_status'
    ) THEN
        CREATE INDEX idx_selected_students_status ON selected_students(status);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'selected_students' AND indexname = 'idx_selected_students_selected_at'
    ) THEN
        CREATE INDEX idx_selected_students_selected_at ON selected_students(selected_at);
    END IF;
END $$;

-- Add comments to the table and columns
COMMENT ON TABLE selected_students IS 'Finally selected students for internship after exam process';
COMMENT ON COLUMN selected_students.selected_id IS 'Primary key for selected students';
COMMENT ON COLUMN selected_students.accepted_id IS 'Reference to accepted student record';
COMMENT ON COLUMN selected_students.final_score IS 'Final selection score/percentage';
COMMENT ON COLUMN selected_students.exam_marks IS 'Marks obtained in examination';
COMMENT ON COLUMN selected_students.selection_remarks IS 'Remarks or notes about selection';
COMMENT ON COLUMN selected_students.status IS 'Selection status: SELECTED, ENROLLED, COMPLETED, DROPPED';