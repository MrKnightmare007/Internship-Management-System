import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './BrowsePrograms.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Dialog from './ui/Dialog';

// Updated ApplicationForm with validation and auto-filled duration
const ApplicationForm = ({ onApply, program }) => {
    const [formData, setFormData] = useState({
        name: '',
        collegeNameAddress: '',
        universityName: '',
        universityRegNo: '',
        courseStream: '',
        currentSemester: '',
        email: '',
        mobile: '',
        address: '',
        dob: '',
    });

    const [academicRecords, setAcademicRecords] = useState([
        { exam: '', board: '', subjects: '', year: '', percentage: '' }
    ]);

    // State to track if the form is valid for submission
    const [isFormValid, setIsFormValid] = useState(false);

    // Effect to re-evaluate form validity whenever data changes
    useEffect(() => {
        const validateForm = () => {
            // Check all personal and academic status details
            for (const key in formData) {
                if (formData[key].trim() === '') return false;
            }
            // Check that every field in every academic record is filled
            for (const record of academicRecords) {
                for (const key in record) {
                    if (record[key].trim() === '') return false;
                }
            }
            // If all checks pass, the form is valid
            return true;
        };
        setIsFormValid(validateForm());
    }, [formData, academicRecords]);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value.toUpperCase() })); // In CAPS as per proforma
    };

    const handleAcademicChange = (index, e) => {
        const { name, value } = e.target;
        const records = [...academicRecords];
        records[index][name] = value;
        setAcademicRecords(records);
    };

    const addAcademicRecord = () => {
        setAcademicRecords([...academicRecords, { exam: '', board: '', subjects: '', year: '', percentage: '' }]);
    };
    
    // The 'onApply' prop is now called by the form's own button
    const handleSubmit = (e) => {
        e.preventDefault();
        onApply();
    }

    return (
        <form onSubmit={handleSubmit} className={styles.applicationForm}>
            <fieldset>
                <legend>Personal Details</legend>
                <div className={styles.formGrid}>
                    <input name="name" placeholder="Name (In CAPS)" onChange={handleInputChange} required />
                    <input name="dob" type="text" placeholder="Date of Birth (DD/MM/YYYY)" onFocus={(e) => e.target.type='date'} onBlur={(e) => e.target.type='text'} onChange={handleInputChange} required />
                    <input name="email" type="email" placeholder="Email ID" onChange={handleInputChange} required />
                    <input name="mobile" type="tel" placeholder="Mobile No." onChange={handleInputChange} required />
                    <textarea name="address" placeholder="Address for communication" className={styles.fullWidth} onChange={handleInputChange} required />
                </div>
            </fieldset>

            <fieldset>
                <legend>Current Academic Status</legend>
                <div className={styles.formGrid}>
                    <input name="collegeNameAddress" placeholder="Name & Address of College/Institute" className={styles.fullWidth} onChange={handleInputChange} required />
                    <input name="universityName" placeholder="Affiliating University Name" onChange={handleInputChange} required />
                    <input name="universityRegNo" placeholder="University Registration No." onChange={handleInputChange} required />
                    <input name="courseStream" placeholder="Course Name with Stream" onChange={handleInputChange} required />
                    <input name="currentSemester" placeholder="Current Semester" onChange={handleInputChange} required />
                    <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                        <label>Internship Duration (Auto-filled)</label>
                        {/* This is now a disabled input showing the program's duration */}
                        <input type="text" value={`${program.progDurationWeeks} weeks`} disabled />
                    </div>
                </div>
            </fieldset>

            <fieldset>
                <legend>Past Academic Details</legend>
                {academicRecords.map((record, index) => (
                    <div key={index} className={styles.academicRecord}>
                        <input name="exam" placeholder="Name of Examination" value={record.exam} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="board" placeholder="School/College/University" value={record.board} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="subjects" placeholder="Subjects" value={record.subjects} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="year" placeholder="Year of Passing" value={record.year} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="percentage" placeholder="Percentage of Marks" value={record.percentage} onChange={e => handleAcademicChange(index, e)} required/>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addAcademicRecord}>+ Add Record</Button>
            </fieldset>

            <fieldset>
                <legend>Document Uploads</legend>
                <p className={styles.uploadInstructions}>Please attach University Registration, Class X & XII Marksheets, and a valid age proof.</p>
                <div className={styles.formGrid}>
                    {/* For validation, you would also need state to track if files are selected */}
                    <div className={styles.inputGroup}><label>University Registration Certificate</label><input type="file" required/></div>
                    <div className={styles.inputGroup}><label>Class X Marksheet/Certificate</label><input type="file" required/></div>
                    <div className={styles.inputGroup}><label>Class XII Marksheet/Certificate</label><input type="file" required/></div>
                    <div className={styles.inputGroup}><label>Valid Age Proof</label><input type="file" required/></div>
                </div>
            </fieldset>
            
            <div className={styles.formActions}>
                {/* The button is now disabled based on isFormValid state */}
                <Button type="submit" variant="primary" disabled={!isFormValid}>
                    Submit Application
                </Button>
            </div>
        </form>
    );
};


// Main BrowsePrograms component
const BrowsePrograms = () => {
    // State and effects remain the same
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);

    useEffect(() => {
        setIsLoading(true);
        api.get('/programs/public-list')
            .then(res => setPrograms(res.data))
            .catch(err => setError("Could not load internship programs."))
            .finally(() => setIsLoading(false));
    }, []);

    const handleApplyClick = (program) => {
        setSelectedProgram(program);
        setIsApplyDialogOpen(true);
    };

    const handleApplyConfirm = () => {
        alert(`Successfully applied for ${selectedProgram.intProgName}!`);
        setIsApplyDialogOpen(false);
    };

    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <h1 className={styles.pageTitle}>Browse Internship Programs</h1>
            <div className={styles.programGrid}>
                {programs.map(prog => (
                    <Card key={prog.intProgId} className={styles.programCard}>
                        <div className={styles.cardHeader}>
                            <h3>{prog.intProgName}</h3>
                            <span className={`${styles.statusBadge} ${prog.programEntry === 'OPEN' ? styles.open : styles.closed}`}>
                                {prog.programEntry}
                            </span>
                        </div>
                        <p className={styles.department}>WEBEL - Centre of Excellence</p>
                        <div className={styles.detailsGrid}>
                            <p><strong>Duration:</strong> {prog.progDurationWeeks} weeks</p>
                            <p><strong>Type:</strong> {prog.programType?.replace(/_/g, ' ')}</p>
                            <p><strong>Mode:</strong> {prog.programMode}</p>
                            <p><strong>Amount:</strong> ₹{prog.internshipAmount}/{prog.programType === 'PAID_BY_APPLICANT' ? 'one-time' : 'month'}</p>
                        </div>
                        <p className={styles.deadline}>
                            Application Deadline: {new Date(prog.programApplicationEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <div className={styles.cardActions}>
                            <Button variant="primary" onClick={() => handleApplyClick(prog)}>Apply Now</Button>
                        </div>
                    </Card>
                ))}
            </div>

            {selectedProgram && (
                // We no longer need the onConfirm prop on the Dialog itself
                <Dialog
                    isOpen={isApplyDialogOpen}
                    onClose={() => setIsApplyDialogOpen(false)}
                    title={`Apply for: ${selectedProgram.intProgName}`}
                >
                    <ApplicationForm onApply={handleApplyConfirm} program={selectedProgram} />
                </Dialog>
            )}
        </div>
    );
};

export default BrowsePrograms;