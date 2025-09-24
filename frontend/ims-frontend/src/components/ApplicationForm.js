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
        coverLetter: null
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Error submitting application. Please try again.');
    }
  };

  return (
    <div className={styles.applicationFormContainer}>
      <h2>Internship Application Form</h2>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}
      
      <form onSubmit={handleSubmit} className={styles.applicationForm}>
        <div className={styles.formSection}>
          <h3>Personal Information</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="applicantName">Full Name *</label>
              <input
                type="text"
                id="applicantName"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="dob">Date of Birth *</label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="applicantEmail">Email *</label>
              <input
                type="email"
                id="applicantEmail"
                name="applicantEmail"
                value={formData.applicantEmail}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="applicantPhone">Phone *</label>
              <input
                type="tel"
                id="applicantPhone"
                name="applicantPhone"
                value={formData.applicantPhone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="communicationAddress">Communication Address *</label>
            <textarea
              id="communicationAddress"
              name="communicationAddress"
              value={formData.communicationAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="cityOfDomicile">City of Domicile *</label>
              <input
                type="text"
                id="cityOfDomicile"
                name="cityOfDomicile"
                value={formData.cityOfDomicile}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="stateOfDomicile">State of Domicile *</label>
              <input
                type="text"
                id="stateOfDomicile"
                name="stateOfDomicile"
                value={formData.stateOfDomicile}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        <div className={styles.formSection}>
          <h3>Academic Information</h3>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="universityRollNo">University Roll No. *</label>
              <input
                type="text"
                id="universityRollNo"
                name="universityRollNo"
                value={formData.universityRollNo}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="collegeNameAddress">College Name & Address *</label>
              <input
                type="text"
                id="collegeNameAddress"
                name="collegeNameAddress"
                value={formData.collegeNameAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="universityName">University Name *</label>
              <input
                type="text"
                id="universityName"
                name="universityName"
                value={formData.universityName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="currentCourse">Current Course *</label>
              <input
                type="text"
                id="currentCourse"
                name="currentCourse"
                value={formData.currentCourse}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="currentSemester">Current Semester *</label>
              <input
                type="text"
                id="currentSemester"
                name="currentSemester"
                value={formData.currentSemester}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="governmentIdType">Government ID Type *</label>
              <select
                id="governmentIdType"
                name="governmentIdType"
                value={formData.governmentIdType}
                onChange={handleInputChange}
                required
              >
                <option value="AADHAR_CARD">Aadhar Card</option>
                <option value="PAN_CARD">PAN Card</option>
                <option value="VOTER_ID_CARD">Voter ID Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="OTHERS">Others</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className={styles.formSection}>
          <h3>Document Uploads</h3>
          <div className={styles.documentUploads}>
            <div className={styles.documentUpload}>
              <label htmlFor="aadharCard">Aadhar Card *</label>
              <input
                type="file"
                id="aadharCard"
                name="aadharCard"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
            
            <div className={styles.documentUpload}>
              <label htmlFor="classXMarksheet">Class X Marksheet *</label>
              <input
                type="file"
                id="classXMarksheet"
                name="classXMarksheet"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
            
            <div className={styles.documentUpload}>
              <label htmlFor="classXIIMarksheet">Class XII Marksheet *</label>
              <input
                type="file"
                id="classXIIMarksheet"
                name="classXIIMarksheet"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                required
              />
            </div>
            
            <div className={styles.documentUpload}>
              <label htmlFor="coverLetter">Cover Letter (Optional)</label>
              <input
                type="file"
                id="coverLetter"
                name="coverLetter"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>
        </div>
        
        <div className={styles.formActions}>
          <button type="submit" className={styles.submitButton}>
            Submit Application
          </button>
        </div>
      </form>
    </div>
  );
};

export default ApplicationForm;