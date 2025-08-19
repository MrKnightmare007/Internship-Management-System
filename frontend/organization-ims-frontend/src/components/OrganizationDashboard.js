import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from './ui/Navbar';
import Footer from './ui/Footer';
import Dialog from './ui/Dialog';
import Button from './ui/Button';
import Loader from './ui/Loader';
import Card from './ui/Card';
import styles from './OrganizationDashboard.module.css';

// The Program Form is now its own component to be rendered inside a Dialog
const ProgramForm = ({ program, onSave, onCancel, isSaving }) => {
  const initialProgramState = {
    intProgId: null, intProgName: '', intProgDescription: '',
    progStartDate: '', progEndDate: '', progDurationWeeks: 0,
    progMaxApplicants: 0, progStatus: 'DRAFT',
    programApplicationStartDate: '', programApplicationEndDate: '',
    programEntry: 'OPEN', programType: 'FREE', programMode: 'ONLINE',
    internshipAmount: 0
  };

  const [currentProgram, setCurrentProgram] = useState(initialProgramState);
  const [file, setFile] = useState(null);

  useEffect(() => {
    const initialState = {
      ...initialProgramState,
      ...program,
      progStartDate: program?.progStartDate || '',
      progEndDate: program?.progEndDate || '',
      programApplicationStartDate: program?.programApplicationStartDate || '',
      programApplicationEndDate: program?.programApplicationEndDate || ''
    };
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
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Program Name</label>
          <input name="intProgName" value={currentProgram.intProgName} onChange={handleInputChange} placeholder="e.g., Web Development Internship" required />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea name="intProgDescription" value={currentProgram.intProgDescription} onChange={handleInputChange} placeholder="Describe the program" />
        </div>
      </div>
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


// Main Dashboard Component
function OrganizationDashboard() {
  const [notifications, setNotifications] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [programToDelete, setProgramToDelete] = useState(null);

  const fetchAllData = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/programs/my-organization'),
      api.get('/notifications/my-notifications')
    ]).then(([programsRes, notificationsRes]) => {
      setPrograms(programsRes.data);
      if (Array.isArray(notificationsRes.data)) {
        setNotifications(notificationsRes.data);
      } else {
        console.error('Received invalid format for notifications');
        setNotifications([]);
      }
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setError('Could not load dashboard data. Please try again later.');
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchAllData();
  }, []);

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
      fetchAllData(); // Refresh all data
      setIsDeleteDialogOpen(false);
      setProgramToDelete(null);
    }).catch(err => alert('Failed to delete program.'));
  };

  const handleSaveProgram = (programData, file) => {
    setIsSaving(true);
    const payload = { ...programData };
    const apiCall = programData.intProgId
      ? api.put(`/programs/${programData.intProgId}`, payload)
      : api.post('/programs', payload);

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
      fetchAllData();
    }).catch(err => {
      console.error('Submission failed:', err.response);
      alert(`Failed to save program.`);
      setIsSaving(false);
    });
  };


  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar title="Organization Master Dashboard" logoutPath="/org-login" />
        <Loader />
        <Footer />
      </div>
    );
  }

  if (error) {
    return <div className={styles.page}><p className={styles.errorText}>{error}</p></div>
  }

  return (
    <div className={styles.page}>
      <Navbar title="Organization Master Dashboard" logoutPath="/org-login" />
      <main className={styles.mainContent}>
        <div className={styles.gridContainer}>
          {/* Main Content Area */}
          <div className={styles.programSection}>
            <header className={styles.sectionHeader}>
              <h2>Internship Program Management</h2>
              <Button onClick={handleCreateNew}>Create New Program</Button>
            </header>
            <div className={styles.tableContainer}>
              <table className={styles.programTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Mode</th>
                    <th>Type</th>
                    <th>Actions</th>
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
              {programs.length === 0 && <p>No programs created yet.</p>}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className={styles.notificationSection}>
            <header className={styles.sectionHeader}>
              <h2>Notifications</h2>
            </header>
            <div className={styles.notificationList}>
              {notifications.length > 0 ? notifications.map(notif => (
                <Card key={notif.notificationId} className={styles.notificationCard}>
                  <h4 className={styles.notificationTitle}>{notif.title}</h4>
                  <p className={styles.notificationDate}>{new Date(notif.createdAt).toLocaleString()}</p>
                  <p className={styles.notificationMessage}>{notif.message}</p>
                  {notif.attachmentPath && (
                    <a href={`http://localhost:8080/uploads/${notif.attachmentPath.split(/[\\/]/).pop()}`} target="_blank" rel="noopener noreferrer">
                      View Attachment
                    </a>
                  )}
                </Card>
              )) : <p>You have no new notifications.</p>}
            </div>
          </aside>
        </div>
      </main>

      {/* Program Form Dialog */}
      {isFormOpen && (
        <div className={styles.formDialog}>
          <div className={styles.formDialogContent}>
            <h2>{editingProgram ? 'Edit Program' : 'Create New Program'}</h2>
            <ProgramForm
              program={editingProgram}
              onSave={handleSaveProgram}
              onCancel={() => setIsFormOpen(false)}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        title="Confirm Deletion"
        onConfirm={handleDeleteConfirm}
      >
        <p>Are you sure you want to delete the program "{programToDelete?.intProgName}"?</p>
      </Dialog>

      <Footer />
    </div>
  );
}

export default OrganizationDashboard;