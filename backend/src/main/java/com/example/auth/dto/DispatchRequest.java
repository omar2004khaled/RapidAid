package com.example.auth.dto;

public class DispatchRequest {
    private String notes;
    private Integer priority;
    private String estimatedArrival;

    public DispatchRequest() {}

    public DispatchRequest(String notes, Integer priority, String estimatedArrival) {
        this.notes = notes;
        this.priority = priority;
        this.estimatedArrival = estimatedArrival;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public String getEstimatedArrival() {
        return estimatedArrival;
    }

    public void setEstimatedArrival(String estimatedArrival) {
        this.estimatedArrival = estimatedArrival;
    }
}