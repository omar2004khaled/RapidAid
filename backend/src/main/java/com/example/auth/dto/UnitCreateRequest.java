package com.example.auth.dto;

public class UnitCreateRequest {
    private String type;
    private Integer count;
    private String location;

    public UnitCreateRequest() {}

    public UnitCreateRequest(String type, Integer count, String location) {
        this.type = type;
        this.count = count;
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

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}