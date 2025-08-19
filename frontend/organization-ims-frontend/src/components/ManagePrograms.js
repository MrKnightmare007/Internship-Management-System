import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from './ManagePrograms.module.css';
import Card from './ui/Card';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Dialog from './ui/Dialog';

// Sub-component for the Program Form
const ProgramForm = ({ program, onSave, onCancel, isSaving }) => {
  const [currentProgram, setCurrentProgram] = useState({});
  const [file, setFile] = useState(null);

  useEffect(() => {
    const initialState = {
      intProgId: null, intProgName: '', intProgDescription: '',
      progStartDate: '', progEndDate: '', progDurationWeeks: 0,
      progMaxApplicants: 0, progStatus: 'DRAFT',
      programApplicationStartDate: '', programApplicationEndDate: '',
      programEntry: 'OPEN', programType: 'FREE', programMode: 'ONLINE',
      internshipAmount: 0,
      ...(program || {})
    };
    // Ensure dates are in yyyy-MM-dd format for the input fields
    initialState.progStartDate = initialState.progStartDate?.split('T')[0] || '';
    initialState.progEndDate = initialState.progEndDate?.split('T')[0] || '';
    initialState.programApplicationStartDate = initialState.programApplicationStartDate?.split('T')[0] || '';
    initialState.programApplicationEndDate = initialState.programApplicationEndDate?.split('T')[0] || '';
    
    setCurrentProgram(initialState);
  }, [program]);

  useEffect(() => {
    if (currentProgram.progStartDate && currentProgram.progEndDate) {
      const startDate = new Date(currentProgram.progStartDate);
      const endDate = new Date(currentProgram.progEndDate);
      const durationInWeeks = (endDate > startDate) ? Math.round(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24 * 7)) : 0;
      setCurrentProgram(prev => ({ ...prev, progDurationWeeks: durationInWeeks }));
    }
  }, [currentProgram.progStartDate, currentProgram.progEndDate]);

  useEffect(() => {
    if (currentProgram.programType === 'FREE') {
      setCurrentProgram(prev => ({ ...prev, internshipAmount: 0 }));
    }
  }, [currentProgram.programType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProgram({ ...currentProgram, [name]: value });
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(currentProgram, file);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.programForm}>
        <div className={styles.formGroup}><label>Program Name</label><input name="intProgName" value={currentProgram.intProgName} onChange={handleInputChange} required /></div>
        <div className={styles.formGroup}><label>Description</label><textarea name="intProgDescription" value={currentProgram.intProgDescription} onChange={handleInputChange} /></div>
        <div className={styles.formGrid}>
            <div><label>Application Start Date</label><input name="programApplicationStartDate" type="date" value={currentProgram.programApplicationStartDate} onChange={handleInputChange} /></div>
            <div><label>Application End Date</label><input name="programApplicationEndDate" type="date" value={currentProgram.programApplicationEndDate} onChange={handleInputChange} /></div>
            <div><label>Program Start Date</label><input name="progStartDate" type="date" value={currentProgram.progStartDate} onChange={handleInputChange} /></div>
            <div><label>Program End Date</label><input name="progEndDate" type="date" value={currentProgram.progEndDate} onChange={handleInputChange} /></div>
            <div><label>Program Mode</label><select name="programMode" value={currentProgram.programMode} onChange={handleInputChange}><option value="ONLINE">Online</option><option value="OFFLINE">Offline</option><option value="HYBRID">Hybrid</option></select></div>
            <div><label>Program Type</label><select name="programType" value={currentProgram.programType} onChange={handleInputChange}><option value="FREE">Free</option><option value="PAID_BY_ORGANIZATION">Paid by Organization</option><option value="PAID_BY_APPLICANT">Paid by Applicant</option></select></div>
            <div><label>Internship Amount (₹)</label><input name="internshipAmount" type="number" value={currentProgram.internshipAmount} onChange={handleInputChange} disabled={currentProgram.programType === 'FREE'} /></div>
            <div><label>No. of Internships Available</label><input name="progMaxApplicants" type="number" value={currentProgram.progMaxApplicants} onChange={handleInputChange} /></div>
            <div><label>Program Status</label><select name="progStatus" value={currentProgram.progStatus} onChange={handleInputChange}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="CLOSED">Closed</option></select></div>
            <div><label>Calculated Duration</label><input type="text" value={`${currentProgram.progDurationWeeks} weeks`} disabled /></div>
            <div><label>Program Document</label><input type="file" onChange={handleFileChange} /></div>
        </div>
        <div className={styles.formActions}>
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Program'}</Button>
        </div>
    </form>
  );
};

// Main Page Component
const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programToDelete, setProgramToDelete] = useState(null);

  const fetchPrograms = () => {
    setIsLoading(true);
    api.get('/programs/my-organization')
      .then(response => setPrograms(response.data))
      .catch(err => setError('Could not fetch programs. Please try again.'))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchPrograms(); }, []);

  const handleCreateNew = () => {
    setEditingProgram(null);
    setIsFormOpen(true);
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (program) => {
    setProgramToDelete(program);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!programToDelete) return;
    api.delete(`/programs/${programToDelete.intProgId}`).then(() => {
        setIsDeleteDialogOpen(false);
        setProgramToDelete(null);
        fetchPrograms();
    }).catch(err => {
        alert('Failed to delete program.');
        setIsDeleteDialogOpen(false);
    });
  };

  const handleSaveProgram = (programData, file) => {
    setIsSaving(true);
    const apiCall = programData.intProgId
      ? api.put(`/programs/${programData.intProgId}`, programData)
      : api.post('/programs', programData);

    apiCall.then(response => {
      const savedProgram = response.data;
      if (file) {
        const fileFormData = new FormData();
        fileFormData.append('file', file);
        return api.post(`/programs/${savedProgram.intProgId}/upload-document`, fileFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      return Promise.resolve();
    }).then(() => {
      setIsFormOpen(false);
      setIsSaving(false);
      fetchPrograms();
    }).catch(err => {
      console.error('Submission failed:', err.response);
      alert('Failed to save program.');
      setIsSaving(false);
    });
  };

  if (isLoading) return <Loader />;
  if (error) return <p className={styles.errorText}>{error}</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Manage Internship Programs</h1>
        <Button onClick={handleCreateNew} variant="primary">+ Create Internship Program</Button>
      </div>
      <Card>
        <div className={styles.tableContainer}>
          <table className={styles.programTable}>
            <thead>
              <tr>
                <th>Program Name</th><th>Status</th><th>Mode</th><th>Type</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(prog => (
                <tr key={prog.intProgId}>
                  <td>{prog.intProgName}</td>
                  <td><span className={`${styles.status} ${styles[prog.progStatus?.toLowerCase()]}`}>{prog.progStatus}</span></td>
                  <td>{prog.programMode}</td>
                  <td>{prog.programType?.replace(/_/g, ' ')}</td>
                  <td className={styles.actionsCell}>
                    <Button onClick={() => handleEdit(prog)}>Edit</Button>
                    <Button onClick={() => openDeleteDialog(prog)} variant="danger">Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {programs.length === 0 && <p className={styles.noProgramsText}>No internship programs have been created yet.</p>}
        </div>
      </Card>

      {isFormOpen && (
        <div className={styles.formDialog}>
          <div className={styles.formDialogContent}>
            <div className={styles.formHeader}>
                <h2>{editingProgram ? 'Edit Program' : 'Create New Program'}</h2>
                <button onClick={() => setIsFormOpen(false)} className={styles.closeButton}>&times;</button>
            </div>
            <ProgramForm 
              program={editingProgram}
              onSave={handleSaveProgram}
              onCancel={() => setIsFormOpen(false)}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete the program "{programToDelete?.intProgName}"?</p>
      </Dialog>
    </div>
  );
};

export default ManagePrograms;