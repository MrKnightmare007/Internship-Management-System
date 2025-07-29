import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Dialog from './ui/Dialog';
import styles from './ApplicantDashboard.module.css';

function ApplicantDashboard() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    api.get('/programs/public-list')
      .then(res => {
        setPrograms(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch programs", err);
        setError("Could not load internship programs. Please try again later.");
        setIsLoading(false);
      });
  }, []);

  const handleApplyClick = (program) => {
    setSelectedProgram(program);
    setIsDialogOpen(true);
  };
  
  const handleApplyConfirm = () => {
    // TODO: Implement the actual application submission logic here.
    // This will likely involve another multi-step form in a new dialog/page.
    alert(`Application submitted for ${selectedProgram.intProgName}!`);
    setIsDialogOpen(false);
    setSelectedProgram(null);
  }

  const renderProgramGrid = () => {
    if (isLoading) return <Loader />;
    if (error) return <p className={styles.errorText}>{error}</p>;
    if (programs.length === 0) return <p>No active internship programs found at the moment.</p>;

    return (
      <div className={styles.programGrid}>
        {programs.map(prog => (
          <Card key={prog.intProgId} className={styles.programCard}>
            <div className={styles.cardHeader}>
              <span className={`${styles.badge} ${styles[prog.programMode?.toLowerCase()]}`}>{prog.programMode}</span>
              <span className={`${styles.badge} ${styles[prog.programType?.toLowerCase()]}`}>{prog.programType?.replace(/_/g, ' ')}</span>
            </div>
            <h3 className={styles.programTitle}>{prog.intProgName}</h3>
            <p className={styles.programDescription}>{prog.intProgDescription}</p>
            <div className={styles.programDetails}>
              <p><strong>Duration:</strong> {prog.progDurationWeeks} weeks</p>
              <p><strong>Fee:</strong> {prog.programType === 'FREE' ? 'Free' : `₹${prog.internshipAmount}`}</p>
            </div>
            <Button onClick={() => handleApplyClick(prog)} className={styles.applyButton}>View & Apply</Button>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.page}>
      <Navbar title="Applicant Dashboard" logoutPath="/login" />
      <main className={styles.mainContent}>
        <section>
          <h2>My Applications</h2>
          <Card>
            {/* TODO: This section will show the applicant's submitted applications. */}
            {/* This requires backend logic to track applications per user. */}
            <p>You have not applied to any internships yet.</p>
          </Card>
        </section>

        <section>
          <h2>Available Internships</h2>
          {renderProgramGrid()}
        </section>
      </main>
      
      {selectedProgram && (
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title={selectedProgram.intProgName}
          onConfirm={handleApplyConfirm}
        >
          <p>{selectedProgram.intProgDescription}</p>
          <hr/>
          <p><strong>Mode:</strong> {selectedProgram.programMode}</p>
          <p><strong>Duration:</strong> {selectedProgram.progDurationWeeks} weeks</p>
          <p><strong>Application Period:</strong> {new Date(selectedProgram.programApplicationStartDate).toLocaleDateString()} to {new Date(selectedProgram.programApplicationEndDate).toLocaleDateString()}</p>
          <p><strong>Fee:</strong> {selectedProgram.programType === 'FREE' ? 'This is a free program.' : `An application fee of ₹${selectedProgram.internshipAmount} is required.`}</p>
          <hr/>
          <p>Confirm to proceed with your application.</p>
        </Dialog>
      )}

      <Footer />
    </div>
  );
}

export default ApplicantDashboard;