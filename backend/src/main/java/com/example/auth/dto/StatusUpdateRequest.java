package com.example.auth.dto;

import com.example.auth.enums.IncidentStatus;

public class StatusUpdateRequest {
    private IncidentStatus status;

    public StatusUpdateRequest() {}

    public StatusUpdateRequest(IncidentStatus status) {
        this.status = status;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }
}