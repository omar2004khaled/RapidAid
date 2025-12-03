package com.example.auth.dto;

public class UnitUpdateRequest {
    private String type;
    private Integer count;
    private String status;
    private String location;

    public UnitUpdateRequest() {}

    public UnitUpdateRequest(String type, Integer count, String status, String location) {
        this.type = type;
        this.count = count;
        this.status = status;
        this.location = location;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getCount() {
        return count;
    }

    public void setCount(Integer count) {
        this.count = count;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}