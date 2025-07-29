// frontend/ims-frontend/src/components/ApplicationForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// The component now accepts 'program' and 'onClose' as props
function ApplicationForm({ program, onClose }) {
    const navigate = useNavigate();

    // State for Personal Details
    const [personalDetails, setPersonalDetails] = useState({
        fullName: '',
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

    // State for the dynamic Academic Details table
    const [academicRecords, setAcademicRecords] = useState([
        { exam: '', school: '', subjects: '', year: '', percentage: '' }
    ]);

    const handlePersonalChange = (e) => {
        const { name, value } = e.target;
        setPersonalDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleAcademicChange = (index, e) => {
        const { name, value } = e.target;
        const updatedRecords = [...academicRecords];
        updatedRecords[index][name] = value;
        setAcademicRecords(updatedRecords);
    };

    const addAcademicRecord = () => {
        setAcademicRecords([...academicRecords, { exam: '', school: '', subjects: '', year: '', percentage: '' }]);
    };

    const removeAcademicRecord = (index) => {
        if (academicRecords.length > 1) {
            setAcademicRecords(academicRecords.filter((_, i) => i !== index));
        }
    };

    // The submit handler now shows an alert and calls the onClose function.
    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Application Submitted!');
        onClose(); // Close the modal
        navigate('/applicant-dashboard'); // Stay on the dashboard
    };

    return (
        // Modal container with a backdrop
        <div style={styles.modalBackdrop}>
            <div style={styles.modalContent}>
                <h2 style={{ textAlign: 'center', marginTop: 0 }}>Internship Application Form</h2>
                <h3 style={{ textAlign: 'center', color: '#333' }}>Applying for: {program.intProgName}</h3>
                
                <form onSubmit={handleSubmit}>
                    <fieldset style={styles.fieldset}>
                        <legend>A. Personal Details</legend>
                        <label>Name (In CAPS)</label>
                        <input type="text" name="fullName" value={personalDetails.fullName} onChange={handlePersonalChange} required />
                        <label>Name and Address of College/Institute/University</label>
                        <textarea name="collegeNameAddress" value={personalDetails.collegeNameAddress} onChange={handlePersonalChange} required />
                        <label>Affiliating University Name</label>
                        <input type="text" name="universityName" value={personalDetails.universityName} onChange={handlePersonalChange} required />
                        <label>University Registration No.</label>
                        <input type="text" name="universityRegNo" value={personalDetails.universityRegNo} onChange={handlePersonalChange} required />
                        <label>Currently Enrolled In (Course Name with Stream)</label>
                        <input type="text" name="courseStream" value={personalDetails.courseStream} onChange={handlePersonalChange} required />
                        <label>Current Semester</label>
                        <input type="number" name="currentSemester" value={personalDetails.currentSemester} onChange={handlePersonalChange} required />
                        <label>Internship Duration Applied For</label>
                        <input type="text" value={`${program.progDurationWeeks} weeks`} disabled />
                        <label>Email ID</label>
                        <input type="email" name="email" value={personalDetails.email} onChange={handlePersonalChange} required />
                        <label>Mobile No.</label>
                        <input type="tel" name="mobile" value={personalDetails.mobile} onChange={handlePersonalChange} required />
                        <label>Address for Communication</label>
                        <textarea name="address" value={personalDetails.address} onChange={handlePersonalChange} required />
                        <label>Date of Birth</label>
                        <input type="date" name="dob" value={personalDetails.dob} onChange={handlePersonalChange} required />
                    </fieldset>

                    <fieldset style={styles.fieldset}>
                        <legend>B. Academic Details</legend>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th>Examination</th>
                                    <th>School/College</th>
                                    <th>Subjects</th>
                                    <th>Year</th>
                                    <th>% of Marks</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {academicRecords.map((record, index) => (
                                    <tr key={index}>
                                        <td><input type="text" name="exam" value={record.exam} onChange={e => handleAcademicChange(index, e)} required /></td>
                                        <td><input type="text" name="school" value={record.school} onChange={e => handleAcademicChange(index, e)} required /></td>
                                        <td><input type="text" name="subjects" value={record.subjects} onChange={e => handleAcademicChange(index, e)} required /></td>
                                        <td><input type="number" name="year" placeholder="YYYY" value={record.year} onChange={e => handleAcademicChange(index, e)} required /></td>
                                        <td><input type="number" name="percentage" step="0.01" value={record.percentage} onChange={e => handleAcademicChange(index, e)} required /></td>
                                        <td><button type="button" onClick={() => removeAcademicRecord(index)} disabled={academicRecords.length === 1}>Remove</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button type="button" onClick={addAcademicRecord} style={{ marginTop: '10px' }}>Add Qualification</button>
                    </fieldset>
                    
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Submit Application</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Styles for the modal and form
const styles = {
    modalBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflowY: 'auto'
    },
    fieldset: {
        marginBottom: '20px',
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '4px'
    }
};

export default ApplicationForm;