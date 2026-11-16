package com.ameniedge.assignments.dto;

public class TruckTelemetryUpdate {
    private Double latitude;
    private Double longitude;
    private Double progress;
    private Boolean arrived;

    public TruckTelemetryUpdate() {}

    public TruckTelemetryUpdate(Double latitude, Double longitude, Double progress, Boolean arrived) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.progress = progress;
        this.arrived = arrived;
    }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }
    public Boolean getArrived() { return arrived; }
    public void setArrived(Boolean arrived) { this.arrived = arrived; }
}

