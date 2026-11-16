package com.ameniedge.incidents.dto;

import com.ameniedge.incidents.IncidentCategory;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateIncidentRequest {
    private String clientReferenceId;
    private String stationId;
    private String region;

    @NotNull
    private IncidentCategory category;

    @Min(0)
    private int affectedPeople = 1;

    private Double latitude;
    private Double longitude;
    private String locationLandmark;
    private String details;
    private String contactName;
    private String contactPhone;
    private boolean hasImmediateDanger = false;
    private java.time.Instant savedAt;

    public CreateIncidentRequest() {}

    public String getClientReferenceId() { return clientReferenceId; }
    public void setClientReferenceId(String clientReferenceId) { this.clientReferenceId = clientReferenceId; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public IncidentCategory getCategory() { return category; }
    public void setCategory(IncidentCategory category) { this.category = category; }
    public int getAffectedPeople() { return affectedPeople; }
    public void setAffectedPeople(int affectedPeople) { this.affectedPeople = affectedPeople; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getLocationLandmark() { return locationLandmark; }
    public void setLocationLandmark(String locationLandmark) { this.locationLandmark = locationLandmark; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getContactName() { return contactName; }
    public void setContactName(String contactName) { this.contactName = contactName; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public boolean isHasImmediateDanger() { return hasImmediateDanger; }
    public void setHasImmediateDanger(boolean hasImmediateDanger) { this.hasImmediateDanger = hasImmediateDanger; }
    public java.time.Instant getSavedAt() { return savedAt; }
    public void setSavedAt(java.time.Instant savedAt) { this.savedAt = savedAt; }
}

