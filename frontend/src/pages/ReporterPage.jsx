import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/ReporterCss.css";
import incidentAPI from '../services/incidentAPI';

function ReporterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emergencyType: '',
        location: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            // Map form data to backend expected format
            // Convert emergency type to match backend enum (MEDICAL, FIRE, POLICE)
            let serviceType = formData.emergencyType.toUpperCase();
            if (serviceType === 'CRIME') serviceType = 'POLICE';
            if (serviceType === 'ACCIDENT') serviceType = 'MEDICAL';
            if (serviceType === 'OTHER') serviceType = 'MEDICAL';
            
            const incidentData = {
                incidentType: serviceType,
                reportedByUserId: null, // Public report - no user ID
                address: {
                    street: formData.location,
                    city: "Unknown",
                    neighborhood: "Unknown",
                    buildingNo: "N/A",
                    apartmentNo: "N/A",
                    latitude: null,
                    longitude: null
                },
                severityLevel: 3, // Default medium severity
                lifeCycleStatus: "REPORTED"
            };
            
            await incidentAPI.createIncident(incidentData);
            
            setSuccess(true);
            alert('Emergency reported successfully! Our team will respond shortly.');
            setFormData({
                name: '',
                phone: '',
                emergencyType: '',
                location: '',
                description: ''
            });
            
            // Reset success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Error reporting emergency:', err);
            setError(err.message || 'Failed to report emergency. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="report-container">
            <div className="report-head">
                <div className="header-content">
                    <h2>Report an Emergency</h2>
                    <button 
                        onClick={() => navigate('/login')}
                        className="login-btn"
                    >
                        Login
                    </button>
                </div>
            </div>
            <div className="report-body">
                {error && (
                    <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="p-4 mb-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">Emergency reported successfully!</p>
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phone">Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="emergencyType">Emergency Type</label>
                        <select
                            id="emergencyType"
                            name="emergencyType"
                            value={formData.emergencyType}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select emergency type</option>
                            <option value="Medical">Medical</option>
                            <option value="Fire">Fire</option>
                            <option value="Crime">Crime</option>
                            <option value="Accident">Accident</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter the emergency location"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe the emergency situation"
                            rows="4"
                            required
                        ></textarea>
                    </div>
                    <button 
                        type="submit" 
                        className="submit-btn" 
                        disabled={loading}
                        style={{ opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}
export default ReporterPage;