package com.example.auth.dto;

public class EmergencyReportRequest {
    private String reporterName;
    private String reporterPhone;
    private String emergencyType;
    private String location;
    private String description;
    private Double latitude;
    private Double longitude;

    public EmergencyReportRequest() {}

    public EmergencyReportRequest(String reporterName, String reporterPhone, String emergencyType, 
                                String location, String description, Double latitude, Double longitude) {
        this.reporterName = reporterName;
        this.reporterPhone = reporterPhone;
        this.emergencyType = emergencyType;
        this.location = location;
        this.description = description;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getReporterName() {
        return reporterName;
    }

    public void setReporterName(String reporterName) {
        this.reporterName = reporterName;
    }

    public String getReporterPhone() {
        return reporterPhone;
    }

    public void setReporterPhone(String reporterPhone) {
        this.reporterPhone = reporterPhone;
    }

    public String getEmergencyType() {
        return emergencyType;
    }

    public void setEmergencyType(String emergencyType) {
        this.emergencyType = emergencyType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}