import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './BrowsePrograms.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Dialog from './ui/Dialog';

// --- Sub-component for the detailed application form ---
const ApplicationForm = ({ onApply, program, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // State for all form data, including new fields
    const [formData, setFormData] = useState({
        fullName: '',
        collegeNameAddress: '',
        universityName: '',
        universityRegNo: '',
        courseStream: '',
        currentSemester: '',
        email: '',
        mobile: '',
        currentAddress: '',
        permanentAddress: '',
        isAddressSame: false,
        cityOfDomicile: '',
        stateOfDomicile: '',
        dob: '',
        governmentIdType: 'AADHAR_CARD',
    });
    
    const [academicRecords, setAcademicRecords] = useState([
        { exam: '', board: '', subjects: '', year: '', percentage: '' }
    ]);

    // State for the document uploads
    const [files, setFiles] = useState({
        governmentIdFile: null,
        coverLetter: null,
        classXMarksheet: null,
        classXIIMarksheet: null
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                isAddressSame: checked,
                // If checked, copy current address to permanent address
                permanentAddress: checked ? prev.currentAddress : ''
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFiles(prev => ({ ...prev, [name]: files[0] }));
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Pass all state up to the parent component for API submission
        onApply(formData, academicRecords, files)
            .catch(() => { /* Error is handled in parent */ })
            .finally(() => setIsSubmitting(false));
    }

    return (
        <form onSubmit={handleSubmit} className={styles.applicationForm}>
            <fieldset>
                <legend>Personal Details</legend>
                <div className={styles.formGrid}>
                    <input name="fullName" placeholder="Name (In CAPS) *" value={formData.fullName} onChange={handleInputChange} required />
                    <input name="dob" type="text" placeholder="Date of Birth (DD/MM/YYYY) *" value={formData.dob} onFocus={(e) => e.target.type = 'date'} onBlur={(e) => e.target.type = 'text'} onChange={handleInputChange} required />
                    <input name="email" type="email" placeholder="Email ID *" value={formData.email} onChange={handleInputChange} required />
                    <input name="mobile" type="tel" placeholder="Mobile No. *" value={formData.mobile} onChange={handleInputChange} required />
                    <input name="cityOfDomicile" placeholder="City of Domicile *" value={formData.cityOfDomicile} onChange={handleInputChange} required/>
                    <input name="stateOfDomicile" placeholder="State of Domicile *" value={formData.stateOfDomicile} onChange={handleInputChange} required/>
                    <textarea name="currentAddress" placeholder="Current Address *" className={styles.fullWidth} value={formData.currentAddress} onChange={handleInputChange} required />
                    <div className={`${styles.fullWidth} ${styles.checkboxContainer}`}>
                        <input type="checkbox" id="isAddressSame" name="isAddressSame" checked={formData.isAddressSame} onChange={handleInputChange} />
                        <label htmlFor="isAddressSame">Permanent Address is the same as Current Address</label>
                    </div>
                    {!formData.isAddressSame && (
                        <textarea name="permanentAddress" placeholder="Permanent Address *" className={styles.fullWidth} value={formData.permanentAddress} onChange={handleInputChange} required />
                    )}
                </div>
            </fieldset>

            <fieldset>
                <legend>Current Academic Status</legend>
                 <div className={styles.formGrid}>
                    <input name="collegeNameAddress" placeholder="Name & Address of College/Institute *" className={styles.fullWidth} value={formData.collegeNameAddress} onChange={handleInputChange} required />
                    <input name="universityName" placeholder="Affiliating University Name *" value={formData.universityName} onChange={handleInputChange} required />
                    <input name="universityRegNo" placeholder="University Registration No. *" value={formData.universityRegNo} onChange={handleInputChange} required />
                    <input name="courseStream" placeholder="Course Name with Stream *" value={formData.courseStream} onChange={handleInputChange} required />
                    <input name="currentSemester" placeholder="Current Semester *" value={formData.currentSemester} onChange={handleInputChange} required />
                </div>
            </fieldset>

             <fieldset>
                <legend>Past Academic Details</legend>
                {academicRecords.map((record, index) => (
                    <div key={index} className={styles.academicRecord}>
                        <input name="exam" placeholder="Name of Examination *" value={record.exam} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="board" placeholder="School/College/University *" value={record.board} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="subjects" placeholder="Subjects *" value={record.subjects} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="year" placeholder="Year of Passing *" value={record.year} onChange={e => handleAcademicChange(index, e)} required/>
                        <input name="percentage" placeholder="Percentage of Marks *" value={record.percentage} onChange={e => handleAcademicChange(index, e)} required/>
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addAcademicRecord}>+ Add Record</Button>
            </fieldset>

            <fieldset>
                <legend>Document Uploads</legend>
                <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                        <label>Government ID Type *</label>
                        <select name="governmentIdType" value={formData.governmentIdType} onChange={handleInputChange} required>
                            <option value="AADHAR_CARD">Aadhar Card</option>
                            <option value="PAN_CARD">PAN Card</option>
                            <option value="VOTER_ID_CARD">Voter ID Card</option>
                            <option value="PASSPORT">Passport</option>
                            <option value="OTHERS">Others</option>
                        </select>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Government ID Proof Document *</label>
                        <input type="file" name="governmentIdFile" onChange={handleFileChange} required/>
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Cover Letter (Optional)</label>
                        <input type="file" name="coverLetter" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Class X Marksheet/Certificate</label>
                        <input type="file" name="classXMarksheet" onChange={handleFileChange} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Class XII Marksheet/Certificate</label>
                        <input type="file" name="classXIIMarksheet" onChange={handleFileChange} />
                    </div>
                </div>
            </fieldset>
            
            <div className={styles.formActions}>
                <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
            </div>
        </form>
    );
};


// --- Main BrowsePrograms Component ---
const BrowsePrograms = () => {
    const [programs, setPrograms] = useState([]);
    const [filteredPrograms, setFilteredPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [appliedProgramIds, setAppliedProgramIds] = useState(new Set());
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const [filters, setFilters] = useState({
        search: '', status: 'all', type: 'all', mode: 'all', duration: 'all'
    });

    const isApplicationClosed = (program) => {
        const currentDate = new Date();
        const applicationEndDate = new Date(program.applicationEndDate);
        return program.progStatus !== 'ACTIVE' || applicationEndDate < currentDate;
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [programsRes, myApplicationsRes] = await Promise.all([
                api.get('/programs/public-list'),
                api.get('/applications/my-applications')
            ]);
            
            setPrograms(programsRes.data);
            const appliedIds = new Set(myApplicationsRes.data.map(app => 
                programsRes.data.find(p => p.intProgName === app.programName)?.intProgId
            ));
            setAppliedProgramIds(appliedIds);

            const programId = searchParams.get('programId');
            if (programId) {
                const targetProgram = programsRes.data.find(p => p.intProgId === parseInt(programId));
                if (targetProgram && !appliedIds.has(targetProgram.intProgId) && !isApplicationClosed(targetProgram)) {
                    setSelectedProgram(targetProgram);
                    setIsApplyDialogOpen(true);
                    setSearchParams({});
                }
            }
        } catch (err) {
            setError("Could not load internship programs.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...programs];
        if (filters.search) {
            filtered = filtered.filter(p => p.intProgName.toLowerCase().includes(filters.search.toLowerCase()));
        }
        if (filters.status !== 'all') {
            filtered = filtered.filter(p => (filters.status === 'open' ? !isApplicationClosed(p) : isApplicationClosed(p)));
        }
        if (filters.type !== 'all') {
            filtered = filtered.filter(p => p.internshipType === filters.type);
        }
        if (filters.mode !== 'all') {
            filtered = filtered.filter(p => p.internshipMode === filters.mode);
        }
        setFilteredPrograms(filtered);
    }, [programs, filters]);

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };
    
    const handleApplyClick = (program) => {
        if (isApplicationClosed(program)) {
            alert('Applications for this program are closed.');
            return;
        }
        setSelectedProgram(program);
        setIsApplyDialogOpen(true);
    };

    const handleApplyConfirm = (formData, academicRecords, files) => {
        const formDataToSend = new FormData();
        formDataToSend.append('programId', selectedProgram.intProgId);
        
        const applicationData = { ...formData, academicRecords };
        formDataToSend.append('formData', JSON.stringify(applicationData));
        
        // Append all files
        if (files.governmentIdFile) formDataToSend.append('governmentIdFile', files.governmentIdFile);
        if (files.coverLetter) formDataToSend.append('coverLetter', files.coverLetter);
        if (files.classXMarksheet) formDataToSend.append('classXMarksheet', files.classXMarksheet);
        if (files.classXIIMarksheet) formDataToSend.append('classXIIMarksheet', files.classXIIMarksheet);

        return api.post('/applications', formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }).then(() => {
            alert('Application submitted successfully!');
            setIsApplyDialogOpen(false);
            fetchData();
        }).catch(err => {
            alert('Failed to submit application. Please check the console for details.');
            console.error(err.response?.data);
            // Re-throw error to be caught in the form's submit handler
            throw err; 
        });
    };

    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;

    return (
        <div>
            <h1 className={styles.pageTitle}>Browse Internship Programs</h1>
            
            {/* Filter UI remains the same */}

            <div className={styles.programGrid}>
                {filteredPrograms.map(prog => (
                    <Card key={prog.intProgId} className={styles.programCard}>
                        <div className={styles.cardHeader}>
                            <h3>{prog.intProgName}</h3>
                            <span className={`${styles.statusBadge} ${isApplicationClosed(prog) ? styles.closed : styles.open}`}>
                                {isApplicationClosed(prog) ? 'Closed' : 'Open'}
                            </span>
                        </div>
                        <p className={styles.department}>{prog.organizationName}</p>
                        <p className={styles.description}>{prog.intProgDescription}</p>
                        <div className={styles.detailsGrid}>
                            <p><strong>Duration:</strong> {prog.progDurationWeeks} weeks</p>
                            <p><strong>Type:</strong> {prog.internshipType?.replace(/_/g, ' ')}</p>
                            <p><strong>Mode:</strong> {prog.internshipMode}</p>
                            <p><strong>Amount:</strong> ₹{prog.internshipAmount || 0}</p>
                        </div>
                        {prog.attachmentPath && (
                            <a 
                                href={`http://localhost:8080/uploads/${prog.attachmentPath.split(/[\\/]/).pop()}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.attachmentLink}
                            >
                                📄 View Program Details
                            </a>
                        )}
                        <p className={styles.deadline}>
                            Application Deadline: {new Date(prog.applicationEndDate).toLocaleDateString()}
                        </p>
                        <div className={styles.cardActions}>
                            {appliedProgramIds.has(prog.intProgId) ? (
                                <Button variant="secondary" disabled>Already Applied</Button>
                            ) : (
                                <Button 
                                    variant="primary" 
                                    onClick={() => handleApplyClick(prog)}
                                    disabled={isApplicationClosed(prog)}
                                >
                                    {isApplicationClosed(prog) ? 'Applications Closed' : 'Apply Now'}
                                </Button>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {selectedProgram && (
                <Dialog
                    isOpen={isApplyDialogOpen}
                    onClose={() => setIsApplyDialogOpen(false)}
                    title={`Apply for: ${selectedProgram.intProgName}`}
                    hideActions={true}
                >
                    <ApplicationForm 
                        onApply={handleApplyConfirm} 
                        program={selectedProgram} 
                        onClose={() => setIsApplyDialogOpen(false)} 
                    />
                </Dialog>
            )}
        </div>
    );
};

export default BrowsePrograms;
