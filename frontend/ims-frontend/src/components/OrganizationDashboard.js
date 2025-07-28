// frontend/ims-frontend/src/components/OrganizationDashboard.js
import React, { useState, useEffect } from 'react';
import api from '../api';

// --- Child Component for Program Management ---
function ProgramManager() {
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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
        fetchPrograms();
    }, []);

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

    const fetchPrograms = () => {
        setIsLoading(true);
        api.get('/programs/my-organization').then(response => {
            setPrograms(response.data);
            setIsLoading(false);
        }).catch(err => {
            setError('Could not fetch programs.');
            setIsLoading(false);
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCurrentProgram({ ...currentProgram, [name]: value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCreate = () => {
        setIsEditing(false);
        setCurrentProgram(initialProgramState);
        setFile(null);
        setShowForm(true);
    };

    const handleEdit = (program) => {
        setIsEditing(true);
        setCurrentProgram({
            ...initialProgramState,
            ...program,
            progStartDate: program.progStartDate || '',
            progEndDate: program.progEndDate || '',
            programApplicationStartDate: program.programApplicationStartDate || '',
            programApplicationEndDate: program.programApplicationEndDate || ''
        });
        setFile(null);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this program?')) {
            api.delete(`/programs/${id}`).then(() => {
                fetchPrograms();
            }).catch(err => {
                alert('Failed to delete program.');
            });
        }
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...currentProgram };

        const dataApiCall = isEditing
            ? api.put(`/programs/${currentProgram.intProgId}`, payload)
            : api.post('/programs', payload);

        dataApiCall.then(response => {
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
            setShowForm(false);
            setFile(null);
            fetchPrograms();
        }).catch(err => {
            console.error('Submission failed:', err.response);
            alert(`Failed to ${isEditing ? 'update' : 'create'} program. Check console for details.`);
        });
    };

    if (isLoading) return <p>Loading programs...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Your Internship Programs</h3>
                <button onClick={handleCreate}>Create New Program</button>
            </div>

            {showForm && (
                <div style={{ margin: '20px 0', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h4>{isEditing ? 'Edit Program' : 'Create New Program'}</h4>
                    <form onSubmit={handleSubmit}>
                        <input name="intProgName" value={currentProgram.intProgName} onChange={handleInputChange} placeholder="Program Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <textarea name="intProgDescription" value={currentProgram.intProgDescription} onChange={handleInputChange} placeholder="Description" style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }} />
                        
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                            <div>
                                <label>Application Start Date</label>
                                <input name="programApplicationStartDate" type="date" value={currentProgram.programApplicationStartDate} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}/>
                            </div>
                            <div>
                                <label>Application End Date</label>
                                <input name="programApplicationEndDate" type="date" value={currentProgram.programApplicationEndDate} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}/>
                            </div>
                            <div>
                                <label>Program Start Date</label>
                                <input name="progStartDate" type="date" value={currentProgram.progStartDate} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}/>
                            </div>
                            <div>
                                <label>Program End Date</label>
                                <input name="progEndDate" type="date" value={currentProgram.progEndDate} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}/>
                            </div>
                        </div>

                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px'}}>
                            <div>
                                <label>Program Mode</label>
                                <select name="programMode" value={currentProgram.programMode} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                                    <option value="ONLINE">Online</option>
                                    <option value="OFFLINE">Offline</option>
                                    <option value="HYBRID">Hybrid</option>
                                </select>
                            </div>
                             <div>
                                <label>Program Type</label>
                                <select name="programType" value={currentProgram.programType} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                                    <option value="FREE">Free</option>
                                    <option value="PAID_BY_ORGANIZATION">Paid by Organization</option>
                                    <option value="PAID_BY_APPLICANT">Paid by Applicant</option>
                                </select>
                            </div>
                            <div>
                                <label>Program Entry</label>
                                <select name="programEntry" value={currentProgram.programEntry} onChange={handleInputChange} style={{ width: '100%', padding: '8px' }}>
                                    <option value="OPEN">Open</option>
                                    <option value="CLOSED">Closed</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label>Internship Amount</label>
                            <input
                                name="internshipAmount"
                                type="number"
                                value={currentProgram.internshipAmount}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                disabled={currentProgram.programType === 'FREE'}
                                style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
                            />
                        </div>

                        <input name="progMaxApplicants" type="number" value={currentProgram.progMaxApplicants} onChange={handleInputChange} placeholder="Max Applicants" style={{ width: '100%', padding: '8px', marginBottom: '10px' }}/>
                        <p>Calculated Duration: {currentProgram.progDurationWeeks} weeks</p>

                        <div style={{ margin: '10px 0' }}>
                            <label>Program Status: </label>
                            <select name="progStatus" value={currentProgram.progStatus} onChange={handleInputChange}>
                                <option value="DRAFT">Draft</option>
                                <option value="ACTIVE">Active</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                        
                        <div style={{ margin: '10px 0' }}>
                            <label>Program Document: </label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                        
                        <button type="submit">{isEditing ? 'Update Program' : 'Save Program'}</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </form>
                </div>
            )}

            {/* UPDATED TABLE TO SHOW ALL FIELDS */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '0.9em' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Entry</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Mode</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Type</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Amount</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Application Dates</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Program Dates</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Duration</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Slots</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Document</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {programs.map(prog => (
                        <tr key={prog.intProgId}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.intProgName}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.progStatus}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.programEntry}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.programMode}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.programType?.replace(/_/g, ' ')}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {prog.programType === 'FREE' ? 'N/A' : `₹${prog.internshipAmount}`}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {prog.programApplicationStartDate ? new Date(prog.programApplicationStartDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {prog.progStartDate ? new Date(prog.progStartDate).toLocaleDateString() : 'N/A'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.progDurationWeeks} weeks</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.progMaxApplicants}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {prog.attachmentPath ? (
                                    <a href={`http://localhost:8080/uploads/${prog.attachmentPath.split(/[\\/]/).pop()}`} target="_blank" rel="noopener noreferrer">
                                        View
                                    </a>
                                ) : 'None'}
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <button onClick={() => handleEdit(prog)} style={{ marginRight: '5px' }}>Edit</button>
                                <button onClick={() => handleDelete(prog.intProgId)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// --- Main Dashboard Component ---
function OrganizationDashboard() {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/notifications/my-notifications')
          .then(response => {
              if (Array.isArray(response.data)) {
                  setNotifications(response.data);
              } else {
                  setError('Failed to load notifications due to an invalid server response.');
              }
              setIsLoading(false);
          })
          .catch(err => {
              setError('Could not load notifications. Please try again later.');
              setIsLoading(false);
          });
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1400px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                <h1>Organization Master Dashboard</h1>
                <button onClick={() => { localStorage.clear(); window.location.href = '/org-login'; }}>
                    Logout
                </button>
            </div>
            
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
                <ProgramManager />
            </div>

            <div style={{ marginTop: '30px' }}>
                <h2>Your Notifications</h2>
                {isLoading && <p>Loading notifications...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {!isLoading && !error && notifications.length === 0 && (
                    <div><p>You have no new notifications.</p></div>
                )}
                
                <div>
                    {notifications.map(notif => (
                        <div key={notif.notificationId} style={{ borderBottom: '1px solid #eee', marginBottom: '15px', paddingBottom: '15px' }}>
                            <div>
                                <h3 style={{ marginBottom: '5px' }}>{notif.title}</h3>
                                <span style={{ fontSize: '0.8em', color: '#666' }}>{new Date(notif.createdAt).toLocaleString()}</span>
                            </div>
                            <p>{notif.message}</p>
                            {notif.attachmentPath && (
                                <a href={`http://localhost:8080/uploads/${notif.attachmentPath.split(/[\\/]/).pop()}`} target="_blank" rel="noopener noreferrer">
                                    View Attachment
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default OrganizationDashboard;