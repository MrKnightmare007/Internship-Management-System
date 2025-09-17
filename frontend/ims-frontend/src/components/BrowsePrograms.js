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
        setError('Failed to fetch programs: ' + err.message);
      }
    };
    fetchPrograms();
  }, []);

  const handleApply = (programId) => {
    setSelectedProgramId(programId);
  };

  return (
    <div className={styles.container}>
      <h2>Browse Internship Programs</h2>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.programList}>
        {programs.map((program) => (
          <div key={program.id} className={styles.programCard}>
            <h3>{program.title}</h3>
            <p>{program.description}</p>
            <p><strong>Organization:</strong> {program.organizationName}</p>
            <p><strong>Duration:</strong> {program.duration}</p>
            <p><strong>Location:</strong> {program.location}</p>
            <button
              className={styles.applyButton}
              onClick={() => handleApply(program.id)}
            >
              Apply Now
            </button>
          </div>
        ))}
      </div>
      {selectedProgramId && (
        <div className={styles.formContainer}>
          <h3>Application Form</h3>
          <ApplicationForm programId={selectedProgramId} />
        </div>
      )}
    </div>
  );
};

export default BrowsePrograms;