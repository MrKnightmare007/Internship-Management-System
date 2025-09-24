-- V8__Create_Exam_Details_And_Accepted_Students.sql
-- Migration to create exam details and accepted students tables for admit card functionality

-- Create exam_details table to store examination configuration for each internship program
CREATE TABLE exam_details (
    exam_id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL,
    examination_location VARCHAR(500) NOT NULL,
    examination_centre_no VARCHAR(50) NOT NULL,
    examination_date DATE NOT NULL,
    number_of_shifts INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_exam_program FOREIGN KEY (program_id) 
        REFERENCES internship_program_master(int_prog_id) ON DELETE CASCADE
);

-- Create exam_shifts table to store shift timings and capacity
CREATE TABLE exam_shifts (
    shift_id SERIAL PRIMARY KEY,
    exam_id INTEGER NOT NULL,
    shift_name VARCHAR(100) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_applicants INTEGER NOT NULL DEFAULT 50,
    current_applicants INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_shift_exam FOREIGN KEY (exam_id) 
        REFERENCES exam_details(exam_id) ON DELETE CASCADE
);

-- Create accepted_students table to track accepted applications with admit card details
CREATE TABLE accepted_students (
    accepted_id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL UNIQUE,
    program_id INTEGER NOT NULL,
    exam_id INTEGER,
    shift_id INTEGER,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    barcode_data VARCHAR(255),
    admit_card_generated BOOLEAN DEFAULT FALSE,
    admit_card_sent BOOLEAN DEFAULT FALSE,
    accepted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    admit_card_generated_at TIMESTAMP,
    admit_card_sent_at TIMESTAMP,
    
    CONSTRAINT fk_accepted_application FOREIGN KEY (application_id) 
        REFERENCES internship_applications(id) ON DELETE CASCADE,
    CONSTRAINT fk_accepted_program FOREIGN KEY (program_id) 
        REFERENCES internship_program_master(int_prog_id) ON DELETE CASCADE,
    CONSTRAINT fk_accepted_exam FOREIGN KEY (exam_id) 
        REFERENCES exam_details(exam_id) ON DELETE SET NULL,
    CONSTRAINT fk_accepted_shift FOREIGN KEY (shift_id) 
        REFERENCES exam_shifts(shift_id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_exam_details_program ON exam_details(program_id);
CREATE INDEX idx_exam_shifts_exam ON exam_shifts(exam_id);
CREATE INDEX idx_accepted_students_application ON accepted_students(application_id);
CREATE INDEX idx_accepted_students_program ON accepted_students(program_id);
CREATE INDEX idx_accepted_students_exam ON accepted_students(exam_id);
CREATE INDEX idx_accepted_students_shift ON accepted_students(shift_id);
CREATE INDEX idx_accepted_students_registration ON accepted_students(registration_number);

-- Add trigger to update exam_shifts current_applicants count
CREATE OR REPLACE FUNCTION update_shift_applicant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.shift_id IS NOT NULL THEN
        UPDATE exam_shifts 
        SET current_applicants = current_applicants + 1 
        WHERE shift_id = NEW.shift_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- If shift changed, update both old and new shift counts
        IF OLD.shift_id IS DISTINCT FROM NEW.shift_id THEN
            IF OLD.shift_id IS NOT NULL THEN
                UPDATE exam_shifts 
                SET current_applicants = current_applicants - 1 
                WHERE shift_id = OLD.shift_id;
            END IF;
            IF NEW.shift_id IS NOT NULL THEN
                UPDATE exam_shifts 
                SET current_applicants = current_applicants + 1 
                WHERE shift_id = NEW.shift_id;
            END IF;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.shift_id IS NOT NULL THEN
        UPDATE exam_shifts 
        SET current_applicants = current_applicants - 1 
        WHERE shift_id = OLD.shift_id;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for accepted_students table
CREATE TRIGGER trigger_update_shift_count
    AFTER INSERT OR UPDATE OR DELETE ON accepted_students
    FOR EACH ROW
    EXECUTE FUNCTION update_shift_applicant_count();

-- Add comments for documentation
COMMENT ON TABLE exam_details IS 'Stores examination configuration for internship programs';
COMMENT ON TABLE exam_shifts IS 'Stores shift timings and capacity for examinations';
COMMENT ON TABLE accepted_students IS 'Tracks accepted applications with admit card details';

COMMENT ON COLUMN exam_details.examination_location IS 'Full address of examination venue';
COMMENT ON COLUMN exam_details.examination_centre_no IS 'Unique identifier for examination centre';
COMMENT ON COLUMN exam_shifts.shift_name IS 'Name/identifier for the shift (e.g., Morning, Afternoon)';
COMMENT ON COLUMN exam_shifts.max_applicants IS 'Maximum number of students allowed in this shift';
COMMENT ON COLUMN exam_shifts.current_applicants IS 'Current number of students assigned to this shift';
COMMENT ON COLUMN accepted_students.registration_number IS 'Auto-generated unique registration number for exam';
COMMENT ON COLUMN accepted_students.barcode_data IS 'Barcode data for admit card verification';