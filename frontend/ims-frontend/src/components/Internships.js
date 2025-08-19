import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Internships.module.css';
import api from '../api';

const Internships = () => {
  const [internships, setInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, open, closed
    type: 'all', // all, FREE, PAID_BY_ORGANIZATION, PAID_BY_APPLICANT
    mode: 'all', // all, ONLINE, OFFLINE, HYBRID
    duration: 'all' // all, short (1-4 weeks), medium (5-12 weeks), long (13+ weeks)
  });

  useEffect(() => {
    fetchInternships();
  }, []);

  // Filter effect
  useEffect(() => {
    let filtered = [...internships];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(internship =>
        internship.intProgName.toLowerCase().includes(filters.search.toLowerCase()) ||
        internship.intProgDescription.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(internship => {
        const isClosed = isApplicationClosed(internship);
        return filters.status === 'open' ? !isClosed : isClosed;
      });
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(internship => internship.programType === filters.type);
    }

    // Mode filter
    if (filters.mode !== 'all') {
      filtered = filtered.filter(internship => internship.programMode === filters.mode);
    }

    // Duration filter
    if (filters.duration !== 'all') {
      filtered = filtered.filter(internship => {
        const weeks = internship.progDurationWeeks || 0;
        switch (filters.duration) {
          case 'short': return weeks >= 1 && weeks <= 4;
          case 'medium': return weeks >= 5 && weeks <= 12;
          case 'long': return weeks >= 13;
          default: return true;
        }
      });
    }

    setFilteredInternships(filtered);
  }, [internships, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      type: 'all',
      mode: 'all',
      duration: 'all'
    });
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const response = await api.get('/programs/public-list');
      setInternships(response.data);
      setFilteredInternships(response.data);
    } catch (err) {
      setError('Failed to fetch internships');
      console.error('Error fetching internships:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = (internship) => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Not logged in, redirect to login
      navigate('/login');
    } else {
      // Logged in, redirect to browse programs with specific internship
      navigate(`/applicant-dashboard/browse?programId=${internship.intProgId}`);
    }
  };

  const isApplicationClosed = (internship) => {
    const currentDate = new Date();
    const applicationEndDate = new Date(internship.programApplicationEndDate);
    
    // Application is closed if the status is not ACTIVE or the deadline has passed
    return internship.progStatus !== 'ACTIVE' || applicationEndDate < currentDate;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (internship) => {
    const currentDate = new Date();
    const applicationEndDate = new Date(internship.programApplicationEndDate);
    
    // Check if application end date has passed
    const isExpired = applicationEndDate < currentDate;
    
    // Show as closed if either the status is not ACTIVE or the application deadline has passed
    const isClosed = internship.progStatus !== 'ACTIVE' || isExpired;
    
    const statusClass = isClosed ? styles.statusClosed : styles.statusOpen;
    const statusText = isClosed ? 'Closed' : 'Open';
    return <span className={`${styles.statusBadge} ${statusClass}`}>{statusText}</span>;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading internships...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Available Internships</h1>
        <p>Explore exciting internship opportunities with WEBEL and partner organizations</p>
      </div>

      {/* Filter Section */}
      <div className={styles.filterSection}>
        <div className={styles.filterRow}>
          <input
            type="text"
            placeholder="Search internships..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Types</option>
            <option value="FREE">Free</option>
            <option value="PAID_BY_ORGANIZATION">Paid by Organization</option>
            <option value="PAID_BY_APPLICANT">Paid by Applicant</option>
          </select>
          
          <select
            value={filters.mode}
            onChange={(e) => handleFilterChange('mode', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Modes</option>
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          
          <select
            value={filters.duration}
            onChange={(e) => handleFilterChange('duration', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Durations</option>
            <option value="short">Short (1-4 weeks)</option>
            <option value="medium">Medium (5-12 weeks)</option>
            <option value="long">Long (13+ weeks)</option>
          </select>
          
          <button onClick={clearFilters} className={styles.clearFiltersBtn}>
            Clear Filters
          </button>
        </div>
        
        <div className={styles.resultsCount}>
          Showing {filteredInternships.length} of {internships.length} internships
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.internshipsTable}>
          <thead>
            <tr>
              <th>Sl.No</th>
              <th>Internship Offering Institution</th>
              <th>Internship Application Start Date</th>
              <th>Internship Application End Date</th>
              <th>Internship Start Date</th>
              <th>Internship Duration (in weeks)</th>
              <th>Download Internship Advertisement</th>
              <th>Internship Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInternships.length === 0 ? (
              <tr>
                <td colSpan="9" className={styles.noData}>
                  {internships.length === 0 ? 'No internships available at the moment' : 'No internships match your filters'}
                </td>
              </tr>
            ) : (
              filteredInternships.map((internship, index) => (
                <tr key={internship.intProgId}>
                  <td>{index + 1}</td>
                  <td className={styles.institutionName}>
                    <div className={styles.programTitle}>{internship.intProgName}</div>
                    <div className={styles.programDescription}>{internship.intProgDescription}</div>
                  </td>
                  <td>{formatDate(internship.programApplicationStartDate)}</td>
                  <td>{formatDate(internship.programApplicationEndDate)}</td>
                  <td>{formatDate(internship.progStartDate)}</td>
                  <td>{internship.progDurationWeeks || 'N/A'}</td>
                  <td>
                    {internship.attachmentPath ? (
                      <a 
                        href={`http://localhost:8080/uploads/${internship.attachmentPath.split(/[\\/]/).pop()}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.downloadLink}
                        download
                      >
                        <i className="fas fa-download"></i> Download
                      </a>
                    ) : (
                      <span className={styles.noDocument}>No document</span>
                    )}
                  </td>
                  <td>{getStatusBadge(internship)}</td>
                  <td>
                    <button 
                      className={`${styles.applyBtn} ${isApplicationClosed(internship) ? styles.disabled : ''}`}
                      onClick={() => handleApplyNow(internship)}
                      disabled={isApplicationClosed(internship)}
                    >
                      {isApplicationClosed(internship) ? 'Closed' : 'Apply Now'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Internships;