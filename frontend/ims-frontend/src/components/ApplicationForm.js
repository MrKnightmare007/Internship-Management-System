// frontend/ims-frontend/src/components/ApplicationForm.js
import React, { useState } from 'react';
import api from '../api';
import styles from './ApplicationForm.module.css';

const ApplicationForm = ({ programId }) => {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    applicantPhone: '',
    communicationAddress: '',
    universityRollNo: '',
    dob: '',
    collegeNameAddress: '',
    universityName: '',
    currentCourse: '',
    currentSemester: '',
    cityOfDomicile: '',
    stateOfDomicile: '',
    governmentIdType: 'AADHAR_CARD',
    academicDetails: JSON.stringify([]),
  });
  const [files, setFiles] = useState({
    aadharCard: null,
    classXMarksheet: null,
    classXIIMarksheet: null,
    coverLetter: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles({ ...files, [name]: selectedFiles[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate required fields
    if (!formData.applicantName) {
      setError('Applicant Name is required');
      return;
    }
    if (!formData.applicantEmail) {
      setError('Applicant Email is required');
      return;
    }
    if (!formData.applicantPhone) {
      setError('Applicant Phone is required');
      return;
    }
    if (!formData.communicationAddress) {
      setError('Communication Address is required');
      return;
    }
    if (!formData.universityRollNo) {
      setError('University Roll Number is required');
      return;
    }
    if (!formData.dob) {
      setError('Date of Birth is required');
      return;
    }
    if (!formData.collegeNameAddress) {
      setError('College Name and Address is required');
      return;
    }
    if (!formData.universityName) {
      setError('University Name is required');
      return;
    }
    if (!formData.currentCourse) {
      setError('Current Course is required');
      return;
    }
    if (!formData.currentSemester) {
      setError('Current Semester is required');
      return;
    }
    if (!formData.cityOfDomicile) {
      setError('City of Domicile is required');
      return;
    }
    if (!formData.stateOfDomicile) {
      setError('State of Domicile is required');
      return;
    }
    if (!files.aadharCard) {
      setError('Aadhar Card is required');
      return;
    }
    if (!files.classXMarksheet) {
      setError('Class X Marksheet is required');
      return;
    }
    if (!files.classXIIMarksheet) {
      setError('Class XII Marksheet is required');
      return;
    }

    const data = new FormData();
    data.append('applicantName', formData.applicantName);
    data.append('applicantEmail', formData.applicantEmail);
    data.append('applicantPhone', formData.applicantPhone);
    data.append('currentAddress', formData.communicationAddress);
    data.append('universityRollNo', formData.universityRollNo);
    data.append('dob', formData.dob);
    data.append('collegeNameAddress', formData.collegeNameAddress);
    data.append('universityName', formData.universityName);
    data.append('currentCourse', formData.currentCourse);
    data.append('currentSemester', formData.currentSemester);
    data.append('cityOfDomicile', formData.cityOfDomicile);
    data.append('stateOfDomicile', formData.stateOfDomicile);
    data.append('governmentIdType', formData.governmentIdType);
    data.append('academicDetails', formData.academicDetails);
    data.append('progId', programId);
    data.append('aadharCard', files.aadharCard);
    data.append('classXMarksheet', files.classXMarksheet);
    data.append('classXIIMarksheet', files.classXIIMarksheet);
    if (files.coverLetter) {
      data.append('coverLetter', files.coverLetter);
    }

    // Log FormData for debugging
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }

    try {
      const response = await api.post('/api/applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSuccess('Application submitted successfully!');
      setFormData({
        applicantName: '',
        applicantEmail: '',
        applicantPhone: '',
        communicationAddress: '',
        universityRollNo: '',
        dob: '',
        collegeNameAddress: '',
        universityName: '',
        currentCourse: '',
        currentSemester: '',
        cityOfDomicile: '',
        stateOfDomicile: '',
        governmentIdType: 'AADHAR_CARD',
        academicDetails: JSON.stringify([]),
      });
      setFiles({
        aadharCard: null,
        classXMarksheet: null,
        classXIIMarksheet: null,
        coverLetter: null,
      });
    } catch (err) {
      console.error('Submission error:', err);
      setError(`Failed to submit application: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Apply for Internship Program</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Applicant Name <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="applicantName"
            value={formData.applicantName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Applicant Email <span className={styles.required}>*</span></label>
          <input
            type="email"
            name="applicantEmail"
            value={formData.applicantEmail}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Applicant Phone <span className={styles.required}>*</span></label>
          <input
            type="tel"
            name="applicantPhone"
            value={formData.applicantPhone}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Communication Address <span className={styles.required}>*</span></label>
          <textarea
            name="communicationAddress"
            value={formData.communicationAddress}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>University Roll Number <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="universityRollNo"
            value={formData.universityRollNo}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Date of Birth <span className={styles.required}>*</span></label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>College Name and Address <span className={styles.required}>*</span></label>
          <textarea
            name="collegeNameAddress"
            value={formData.collegeNameAddress}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>University Name <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="universityName"
            value={formData.universityName}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Current Course <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="currentCourse"
            value={formData.currentCourse}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Current Semester <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="currentSemester"
            value={formData.currentSemester}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>City of Domicile <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="cityOfDomicile"
            value={formData.cityOfDomicile}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>State of Domicile <span className={styles.required}>*</span></label>
          <input
            type="text"
            name="stateOfDomicile"
            value={formData.stateOfDomicile}
            onChange={handleInputChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Government ID Type <span className={styles.required}>*</span></label>
          <select
            name="governmentIdType"
            value={formData.governmentIdType}
            onChange={handleInputChange}
            required
          >
            <option value="AADHAR_CARD">Aadhar Card</option>
            <option value="PAN_CARD">PAN Card</option>
            <option value="VOTER_ID">Voter ID</option>
          </select>
        </div>
        <div className={styles.inputGroup}>
          <label>Aadhar Card <span className={styles.required}>*</span></label>
          <input
            type="file"
            name="aadharCard"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Class X Marksheet <span className={styles.required}>*</span></label>
          <input
            type="file"
            name="classXMarksheet"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Class XII Marksheet <span className={styles.required}>*</span></label>
          <input
            type="file"
            name="classXIIMarksheet"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Cover Letter (Optional)</label>
          <input
            type="file"
            name="coverLetter"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
        <button type="submit" className={styles.submitButton}>Submit Application</button>
      </form>
    </div>
  );
};

export default ApplicationForm;