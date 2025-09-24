-- V10__Create_Selected_Students_Table.sql
-- Migration to create selected_students table for finally selected students after exam process

-- Create selected_students table to store finally selected students for internship
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
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_selected_accepted FOREIGN KEY (accepted_id) 
        REFERENCES accepted_students(accepted_id) ON DELETE CASCADE,
    CONSTRAINT fk_selected_application FOREIGN KEY (application_id) 
        REFERENCES internship_applications(application_id) ON DELETE CASCADE,
    CONSTRAINT fk_selected_program FOREIGN KEY (program_id) 
        REFERENCES internship_program_master(int_prog_id) ON DELETE CASCADE,
    CONSTRAINT fk_selected_exam FOREIGN KEY (exam_id) 
        REFERENCES exam_details(exam_id) ON DELETE SET NULL,
    CONSTRAINT fk_selected_shift FOREIGN KEY (shift_id) 
        REFERENCES exam_shifts(shift_id) ON DELETE SET NULL,
    CONSTRAINT fk_selected_by_user FOREIGN KEY (selected_by) 
        REFERENCES user_master(user_id) ON DELETE RESTRICT,
        
    -- Unique constraints
    CONSTRAINT uk_selected_accepted UNIQUE (accepted_id),
    CONSTRAINT uk_selected_registration UNIQUE (registration_number, program_id)
);

-- Create indexes for better performance
CREATE INDEX idx_selected_students_program_id ON selected_students(program_id);
CREATE INDEX idx_selected_students_registration ON selected_students(registration_number);
CREATE INDEX idx_selected_students_status ON selected_students(status);
CREATE INDEX idx_selected_students_selected_at ON selected_students(selected_at);

-- Add comments to the table and columns
COMMENT ON TABLE selected_students IS 'Finally selected students for internship after exam process';
COMMENT ON COLUMN selected_students.selected_id IS 'Primary key for selected students';
COMMENT ON COLUMN selected_students.accepted_id IS 'Reference to accepted student record';
COMMENT ON COLUMN selected_students.final_score IS 'Final selection score/percentage';
COMMENT ON COLUMN selected_students.exam_marks IS 'Marks obtained in examination';
COMMENT ON COLUMN selected_students.selection_remarks IS 'Remarks or notes about selection';
COMMENT ON COLUMN selected_students.status IS 'Selection status: SELECTED, ENROLLED, COMPLETED, DROPPED';