package com.ameniedge.incidents;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "incidents")
public class Incident {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "client_reference_id", unique = true, length = 64)
    private String clientReferenceId;

    @Column(name = "station_id", nullable = false, length = 64)
    private String stationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 64)
    private IncidentCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IncidentPriority priority = IncidentPriority.P2_URGENT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private IncidentStatus status = IncidentStatus.RECEIVED;

    @Column(name = "affected_people")
    private int affectedPeople = 1;

    private Double latitude;
    private Double longitude;

    @Column(name = "location_landmark", columnDefinition = "TEXT")
    private String locationLandmark;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "contact_name")
    private String contactName;

    @Column(name = "contact_phone", length = 64)
    private String contactPhone;

    @Column(name = "has_immediate_danger")
    private boolean hasImmediateDanger = false;

    @Column(name = "assigned_team_id", length = 64)
    private String assignedTeamId;

    @Column(name = "conflict_detected")
    private boolean conflictDetected = false;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Incident() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getClientReferenceId() { return clientReferenceId; }
    public void setClientReferenceId(String clientReferenceId) { this.clientReferenceId = clientReferenceId; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public IncidentCategory getCategory() { return category; }
    public void setCategory(IncidentCategory category) { this.category = category; }
    public IncidentPriority getPriority() { return priority; }
    public void setPriority(IncidentPriority priority) { this.priority = priority; }
    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
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
    public String getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(String assignedTeamId) { this.assignedTeamId = assignedTeamId; }
    public boolean isConflictDetected() { return conflictDetected; }
    public void setConflictDetected(boolean conflictDetected) { this.conflictDetected = conflictDetected; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
