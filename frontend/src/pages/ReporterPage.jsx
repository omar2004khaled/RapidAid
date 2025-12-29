import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LocationPickerMap from '../Components/LocationPickerMap';
import "../css/ReporterCss.css";

function ReporterPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emergencyType: '',
        location: '',
        latitude: 30.0444,
        longitude: 31.2357,
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [showLocationPicker, setShowLocationPicker] = useState(false);

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
            let serviceType = formData.emergencyType.toUpperCase();
            
            const incidentData = {
                incidentType: serviceType,
                address: {
                    street: formData.location,
                    city: "Cairo",
                    neighborhood: "Unknown",
                    buildingNo: "N/A",
                    apartmentNo: "N/A",
                    latitude: formData.latitude,
                    longitude: formData.longitude
                },
                description: formData.description,
                reporterName: formData.name,
                reporterPhone: formData.phone,
                severityLevel: 3, // Default medium severity
                lifeCycleStatus: "REPORTED"
            };
            
            const response = await fetch('http://localhost:8080/api/public/incident/report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(incidentData)
            });
            
            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to report emergency');
            }
            
            setSuccess(true);
            alert('Emergency reported successfully! Our team will respond shortly.');
            setFormData({
                name: '',
                phone: '',
                emergencyType: '',
                location: '',
                latitude: '',
                longitude: '',
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
                            <option value="Police">Police</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="location">Address</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Enter the emergency address"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Emergency Location</label>
                        <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={() => setShowLocationPicker(true)}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Pick Location on Map
                            </button>
                            <span className="text-sm text-gray-600">
                                Lat: {formData.latitude.toFixed(4)}, Lng: {formData.longitude.toFixed(4)}
                            </span>
                        </div>
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
            
            {/* Location Picker Modal */}
            {showLocationPicker && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-4/5 h-4/5 max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Pick Emergency Location</h3>
                            <button
                                onClick={() => setShowLocationPicker(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="h-96 mb-4">
                            <LocationPickerMap
                                initialPosition={[formData.latitude, formData.longitude]}
                                onLocationSelect={(lat, lng) => {
                                    setFormData({...formData, latitude: lat, longitude: lng});
                                    setShowLocationPicker(false);
                                }}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowLocationPicker(false)}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default ReporterPage;