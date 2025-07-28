import React, { useState, useEffect } from 'react';
import api from '../api';

// --- Child Component for Program Management ---
function ProgramManager() {
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProgram, setCurrentProgram] = useState({
        intProgId: null, intProgName: '', intProgDescription: '',
        progStartDate: '', progEndDate: '', progDurationWeeks: 0,
        progMaxApplicants: 0, progStatus: 'DRAFT'
    });
    // NEW: State for the file to be uploaded
    const [file, setFile] = useState(null);

    useEffect(() => {
        fetchPrograms();
    }, []);

    useEffect(() => {
        if (currentProgram.progStartDate && currentProgram.progEndDate) {
            const startDate = new Date(currentProgram.progStartDate);
            const endDate = new Date(currentProgram.progEndDate);
            if (endDate > startDate) {
                const diffTime = Math.abs(endDate - startDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const durationInWeeks = Math.round(diffDays / 7);
                setCurrentProgram(prev => ({ ...prev, progDurationWeeks: durationInWeeks }));
            } else {
                setCurrentProgram(prev => ({ ...prev, progDurationWeeks: 0 }));
            }
        }
    }, [currentProgram.progStartDate, currentProgram.progEndDate]);

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
        setCurrentProgram({
            intProgId: null, intProgName: '', intProgDescription: '',
            progStartDate: '', progEndDate: '', progDurationWeeks: 0,
            progMaxApplicants: 0, progStatus: 'DRAFT'
        });
        setFile(null);
        setShowForm(true);
    };

    const handleEdit = (program) => {
        setIsEditing(true);
        setCurrentProgram({
            ...program,
            progStartDate: program.progStartDate || '',
            progEndDate: program.progEndDate || ''
        });
        setFile(null);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure?')) {
            api.delete(`/programs/${id}`).then(() => fetchPrograms())
               .catch(err => alert('Failed to delete program.'));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        // Append all text fields from the state
        for (const key in currentProgram) {
            if (currentProgram[key] !== null) {
                formData.append(key, currentProgram[key]);
            }
        }
        // Append the file if it exists
        if (file) {
            formData.append('file', file);
        }

        const apiCall = isEditing 
            ? api.put(`/programs/${currentProgram.intProgId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            : api.post('/programs', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        apiCall.then(() => {
            setShowForm(false);
            fetchPrograms();
        }).catch(err => {
            alert(`Failed to ${isEditing ? 'update' : 'create'} program.`);
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
                        {/* ... other inputs ... */}
                        <input name="intProgName" value={currentProgram.intProgName} onChange={handleInputChange} placeholder="Program Name" required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
                        <textarea name="intProgDescription" value={currentProgram.intProgDescription} onChange={handleInputChange} placeholder="Description" style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }} />
                        <input name="progStartDate" type="date" value={currentProgram.progStartDate} onChange={handleInputChange} />
                        <input name="progEndDate" type="date" value={currentProgram.progEndDate} onChange={handleInputChange} />
                        <input name="progDurationWeeks" type="number" value={currentProgram.progDurationWeeks} readOnly />
                        <input name="progMaxApplicants" type="number" value={currentProgram.progMaxApplicants} onChange={handleInputChange} placeholder="Max Applicants" />
                        <select name="progStatus" value={currentProgram.progStatus} onChange={handleInputChange}>
                            <option value="DRAFT">Draft</option>
                            <option value="ACTIVE">Active</option>
                        </select>
                        {/* NEW: File input */}
                        <div style={{ margin: '10px 0' }}>
                            <label>Program Document: </label>
                            <input type="file" onChange={handleFileChange} />
                        </div>
                        <button type="submit">{isEditing ? 'Update Program' : 'Save Program'}</button>
                        <button type="button" onClick={() => setShowForm(false)} style={{ marginLeft: '10px' }}>Cancel</button>
                    </form>
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Duration</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Applicants</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Attachment</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {programs.map(prog => (
                        <tr key={prog.intProgId}>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.intProgName}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{prog.progStatus}</td>
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


// --- Main Dashboard Component (No changes needed here) ---
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
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: 'auto' }}>
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
            <div key={notif.notificationId}>
              <div>
                <h3>{notif.title}</h3>
                <span>{new Date(notif.createdAt).toLocaleString()}</span>
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
