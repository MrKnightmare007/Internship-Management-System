import React, { useState } from 'react';
import api from '../api';
import styles from './ExamSetupForm.module.css';
import Card from './ui/Card';
import Button from './ui/Button';

const ExamSetupForm = ({ programId, programName, onSetupComplete, onCancel }) => {
    const [formData, setFormData] = useState({
        examinationCentres: [
            {
                examinationLocation: '',
                examinationCentreNo: ''
            }
        ],
        examinationDate: '',
        numberOfShifts: 1,
        shifts: [
            {
                shiftName: 'Morning Shift',
                startTime: '09:00',
                endTime: '12:00',
                maxApplicants: 50
            }
        ],
        organizerSignature: null
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!validTypes.includes(file.type)) {
                setError('Please upload a valid image file (JPEG, JPG, or PNG)');
                return;
            }
            
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setError('File size should be less than 2MB');
                return;
            }
            
            setFormData({
                ...formData,
                organizerSignature: file
            });
            setError('');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'numberOfShifts') {
            const newShiftsCount = parseInt(value);
            const currentShifts = [...formData.shifts];
            
            if (newShiftsCount > currentShifts.length) {
                // Add new shifts
                for (let i = currentShifts.length; i < newShiftsCount; i++) {
                    currentShifts.push({
                        shiftName: `Shift ${i + 1}`,
                        startTime: '09:00',
                        endTime: '12:00',
                        maxApplicants: 50
                    });
                }
            } else if (newShiftsCount < currentShifts.length) {
                // Remove excess shifts
                currentShifts.splice(newShiftsCount);
            }
            
            setFormData({
                ...formData,
                [name]: newShiftsCount,
                shifts: currentShifts
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
    };

    const handleCentreChange = (index, field, value) => {
        const newCentres = [...formData.examinationCentres];
        newCentres[index] = {
            ...newCentres[index],
            [field]: value
        };
        setFormData({
            ...formData,
            examinationCentres: newCentres
        });
    };

    const addExaminationCentre = () => {
        setFormData({
            ...formData,
            examinationCentres: [
                ...formData.examinationCentres,
                {
                    examinationLocation: '',
                    examinationCentreNo: ''
                }
            ]
        });
    };

    const removeExaminationCentre = (index) => {
        if (formData.examinationCentres.length > 1) {
            const newCentres = formData.examinationCentres.filter((_, i) => i !== index);
            setFormData({
                ...formData,
                examinationCentres: newCentres
            });
        }
    };

    const handleShiftChange = (index, field, value) => {
        const newShifts = [...formData.shifts];
        newShifts[index] = {
            ...newShifts[index],
            [field]: value
        };
        setFormData({
            ...formData,
            shifts: newShifts
        });
    };

    const validateForm = () => {
        // Validate examination centres
        for (let i = 0; i < formData.examinationCentres.length; i++) {
            const centre = formData.examinationCentres[i];
            if (!centre.examinationLocation.trim()) {
                setError(`Examination centre ${i + 1} location is required`);
                return false;
            }
            if (!centre.examinationCentreNo.trim()) {
                setError(`Examination centre ${i + 1} number is required`);
                return false;
            }
        }
        
        // Check for duplicate centre numbers
        const centreNumbers = formData.examinationCentres.map(c => c.examinationCentreNo.trim());
        const uniqueCentreNumbers = [...new Set(centreNumbers)];
        if (centreNumbers.length !== uniqueCentreNumbers.length) {
            setError('Examination centre numbers must be unique');
            return false;
        }
        
        if (!formData.examinationDate) {
            setError('Examination date is required');
            return false;
        }
        
        // Validate each shift
        for (let i = 0; i < formData.shifts.length; i++) {
            const shift = formData.shifts[i];
            if (!shift.shiftName.trim()) {
                setError(`Shift ${i + 1} name is required`);
                return false;
            }
            if (!shift.startTime || !shift.endTime) {
                setError(`Shift ${i + 1} timings are required`);
                return false;
            }
            if (shift.startTime >= shift.endTime) {
                setError(`Shift ${i + 1} end time must be after start time`);
                return false;
            }
            if (!shift.maxApplicants || shift.maxApplicants <= 0) {
                setError(`Shift ${i + 1} must have at least 1 applicant capacity`);
                return false;
            }
        }
        
        // Check for overlapping shifts
        for (let i = 0; i < formData.shifts.length; i++) {
            for (let j = i + 1; j < formData.shifts.length; j++) {
                const shift1 = formData.shifts[i];
                const shift2 = formData.shifts[j];
                if (shift1.startTime < shift2.endTime && shift2.startTime < shift1.endTime) {
                    setError(`Shifts "${shift1.shiftName}" and "${shift2.shiftName}" have overlapping times`);
                    return false;
                }
            }
        }
        
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            let organizerSignaturePath = null;
            
            // Upload organizer signature if provided
            if (formData.organizerSignature) {
                const signatureFormData = new FormData();
                signatureFormData.append('file', formData.organizerSignature);
                
                try {
                    const uploadResponse = await api.post('/upload', signatureFormData, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    
                    if (uploadResponse.data && uploadResponse.data.filePath) {
                        organizerSignaturePath = uploadResponse.data.filePath;
                    }
                } catch (uploadError) {
                    console.error('Error uploading signature:', uploadError);
                    let uploadErrorMessage = 'Failed to upload organizer signature';
                    
                    if (uploadError.response?.data) {
                        if (typeof uploadError.response.data === 'string') {
                            uploadErrorMessage = uploadError.response.data;
                        } else if (uploadError.response.data.message) {
                            uploadErrorMessage = uploadError.response.data.message;
                        }
                    }
                    
                    setError(uploadErrorMessage);
                    return;
                }
            }
            
            const requestData = {
                programId: programId,
                examinationCentres: formData.examinationCentres,
                examinationDate: formData.examinationDate,
                numberOfShifts: formData.numberOfShifts,
                shifts: formData.shifts,
                organizerSignaturePath: organizerSignaturePath
            };

            const response = await api.post('/exam/setup', requestData);
            
            if (response.data) {
                onSetupComplete(response.data);
            }
        } catch (error) {
            console.error('Error setting up examination:', error);
            let errorMessage = 'Failed to setup examination. Please try again.';
            
            if (error.response?.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                } else {
                    errorMessage = 'Server error occurred';
                }
            }
            
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTotalCapacity = () => {
        return formData.shifts.reduce((total, shift) => total + (parseInt(shift.maxApplicants) || 0), 0);
    };

    return (
        <div className={styles.modalOverlay}>
            <Card className={styles.examSetupForm}>
                <div className={styles.formHeader}>
                    <h2>Setup Examination</h2>
                    <p>Program: <strong>{programName}</strong></p>
                    <Button 
                        onClick={onCancel}
                        className={styles.closeButton}
                        variant="ghost"
                    >
                        ×
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}

                    <div className={styles.formSection}>
                        <h3>Examination Centers</h3>
                        
                        {formData.examinationCentres.map((centre, index) => (
                            <div key={index} className={styles.centreCard}>
                                <div className={styles.centreHeader}>
                                    <h4>Examination Center {index + 1}</h4>
                                    {formData.examinationCentres.length > 1 && (
                                        <Button
                                            type="button"
                                            onClick={() => removeExaminationCentre(index)}
                                            className={styles.removeButton}
                                            size="small"
                                            variant="danger"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Examination Location *</label>
                                        <textarea
                                            value={centre.examinationLocation}
                                            onChange={(e) => handleCentreChange(index, 'examinationLocation', e.target.value)}
                                            placeholder="Full address of examination venue"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Examination Centre No *</label>
                                        <input
                                            type="text"
                                            value={centre.examinationCentreNo}
                                            onChange={(e) => handleCentreChange(index, 'examinationCentreNo', e.target.value)}
                                            placeholder="e.g., 6522"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className={styles.addCentreSection}>
                            <Button
                                type="button"
                                onClick={addExaminationCentre}
                                className={styles.addButton}
                                variant="secondary"
                            >
                                + Add Another Examination Center
                            </Button>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Examination Date</h3>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="examinationDate">Examination Date *</label>
                                <input
                                    type="date"
                                    id="examinationDate"
                                    name="examinationDate"
                                    value={formData.examinationDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            
                            <div className={styles.formGroup}>
                                <label htmlFor="numberOfShifts">Number of Shifts *</label>
                                <select
                                    id="numberOfShifts"
                                    name="numberOfShifts"
                                    value={formData.numberOfShifts}
                                    onChange={handleInputChange}
                                    required
                                >
                                    {[1, 2, 3, 4].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div className={styles.formSection}>
                        <h3>Organizer's Signature</h3>
                        
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label htmlFor="organizerSignature">Upload Organizer's Signature *</label>
                                <input
                                    type="file"
                                    id="organizerSignature"
                                    accept="image/jpeg,image/jpg,image/png"
                                    onChange={handleFileChange}
                                    className={styles.fileInput}
                                />
                                <small className={styles.fileHelp}>
                                    Upload a clear signature image (JPEG, JPG, or PNG format, max 2MB)
                                </small>
                                {formData.organizerSignature && (
                                    <div className={styles.fileSelected}>
                                        ✓ Selected: {formData.organizerSignature.name}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.formSection}>
                        <h3>Shift Details</h3>
                        
                        {formData.shifts.map((shift, index) => (
                            <div key={index} className={styles.shiftCard}>
                                <h4>Shift {index + 1}</h4>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Shift Name *</label>
                                        <input
                                            type="text"
                                            value={shift.shiftName}
                                            onChange={(e) => handleShiftChange(index, 'shiftName', e.target.value)}
                                            placeholder="e.g., Morning Shift"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label>Start Time *</label>
                                        <input
                                            type="time"
                                            value={shift.startTime}
                                            onChange={(e) => handleShiftChange(index, 'startTime', e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label>End Time *</label>
                                        <input
                                            type="time"
                                            value={shift.endTime}
                                            onChange={(e) => handleShiftChange(index, 'endTime', e.target.value)}
                                            required
                                        />
                                    </div>
                                    
                                    <div className={styles.formGroup}>
                                        <label>Max Applicants *</label>
                                        <input
                                            type="number"
                                            value={shift.maxApplicants}
                                            onChange={(e) => handleShiftChange(index, 'maxApplicants', parseInt(e.target.value) || 0)}
                                            min="1"
                                            max="200"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <div className={styles.capacityInfo}>
                            <strong>Total Capacity: {getTotalCapacity()} applicants</strong>
                        </div>
                    </div>

                    <div className={styles.formActions}>
                        <Button
                            type="button"
                            onClick={onCancel}
                            variant="secondary"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Setting up...' : 'Setup Examination'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ExamSetupForm;