import React, { useState, useEffect } from 'react';
import api from '../api';

function ApplicantDashboard() {
    const [programs, setPrograms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/programs/public-list')
            .then(res => {
                setPrograms(res.data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch programs", err);
                setIsLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Applicant Dashboard</h1>
                <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }}>Logout</button>
            </div>
            <h2>Available Internship Programs</h2>
            {isLoading ? <p>Loading programs...</p> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {programs.map(prog => (
                        <div key={prog.intProgId} style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '15px' }}>
                            <h3>{prog.intProgName}</h3>
                            <p>{prog.intProgDescription}</p>
                            <p><strong>Duration:</strong> {prog.progDurationWeeks} weeks</p>
                            <p><strong>Max Applicants:</strong> {prog.progMaxApplicants}</p>
                            <button>Apply Now</button> {/* Apply functionality to be added later */}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ApplicantDashboard;
