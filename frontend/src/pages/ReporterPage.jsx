import React, { useState } from "react";
import "../css/ReporterCss.css";

function ReporterPage() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        emergencyType: '',
        location: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Report submitted:', formData);
        alert('Emergency reported successfully!');
        setFormData({
            name: '',
            phone: '',
            emergencyType: '',
            location: '',
            description: ''
        });
    };

    return (
        <div className="report-container">
            <div className="report-head">
                <h2>Report an Emergency</h2>
            </div>
            <div className="report-body">
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
                    <button type="submit" className="submit-btn">Submit Report</button>
                </form>
            </div>
        </div>
    );
}
export default ReporterPage;