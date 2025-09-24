// frontend/ims-frontend/src/components/BrowsePrograms.js
import React, { useState, useEffect } from 'react';
import api from '../api';
import ApplicationForm from './ApplicationForm';
import styles from './BrowsePrograms.module.css';

const BrowsePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await api.get('/programs/public-list');
        setPrograms(response.data);
      } catch (err) {
        setError('Failed to fetch programs');
        console.error('Error fetching programs:', err);
      }
    };

    fetchPrograms();
  }, []);

  const handleApply = (programId) => {
    setSelectedProgramId(programId);
  };

  const handleCloseForm = () => {
    setSelectedProgramId(null);
  };

  return (
    <div className={styles.browseProgramsContainer}>
      <h2>Browse Internship Programs</h2>
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.programsGrid}>
        {programs.map(program => (
          <div key={program.intProgId} className={styles.programCard}>
            <h3>{program.intProgName}</h3>
            <p><strong>Organization:</strong> {program.organizationName}</p>
            <p><strong>Duration:</strong> {program.progDurationWeeks} weeks</p>
            <p><strong>Stipend:</strong> ₹{program.stipendAmount}/month</p>
            <p><strong>Last Date to Apply:</strong> {new Date(program.programApplicationEndDate).toLocaleDateString()}</p>
            <p><strong>Location:</strong> {program.progLocation}</p>
            <p><strong>Description:</strong> {program.progDescription}</p>
            <button 
              className={styles.applyButton}
              onClick={() => handleApply(program.intProgId)}
              disabled={new Date() > new Date(program.programApplicationEndDate)}
            >
              {new Date() > new Date(program.programApplicationEndDate) ? 'Application Closed' : 'Apply Now'}
            </button>
          </div>
        ))}
      </div>

      {selectedProgramId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeButton} onClick={handleCloseForm}>×</button>
            <ApplicationForm programId={selectedProgramId} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsePrograms;
