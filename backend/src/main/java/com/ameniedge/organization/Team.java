package com.ameniedge.organization;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "teams")
public class Team {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "department")
    private String department;

    @Column(name = "station_id", nullable = false, length = 64)
    private String stationId;

    @Column(name = "leader_id", length = 64)
    private String leaderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private TeamStatus status = TeamStatus.AVAILABLE;

    @Column(columnDefinition = "TEXT")
    private String capabilities; // Comma-delimited: SWIFT_WATER_RESCUE, BOAT_OPERATION, etc.

    @Column(columnDefinition = "TEXT")
    private String equipment; // Comma-delimited: INFLATABLE_ZODIAC_BOAT, LIFE_JACKETS, etc.

    @Column(name = "current_latitude")
    private Double currentLatitude;

    @Column(name = "current_longitude")
    private Double currentLongitude;

    @Column(name = "active_incident_count")
    private int activeIncidentCount = 0;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Team() {}

    public Team(String id, String name, String stationId, String leaderId, TeamStatus status, String capabilities, String equipment, Double currentLatitude, Double currentLongitude) {
        this.id = id;
        this.name = name;
        this.stationId = stationId;
        this.leaderId = leaderId;
        this.status = status != null ? status : TeamStatus.AVAILABLE;
        this.capabilities = capabilities;
        this.equipment = equipment;
        this.currentLatitude = currentLatitude;
        this.currentLongitude = currentLongitude;
        this.activeIncidentCount = 0;
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) {
        this.name = name;
        if (this.department == null) this.department = name;
    }
    public String getDepartment() { return department != null ? department : name; }
    public void setDepartment(String department) { this.department = department; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public String getLeaderId() { return leaderId; }
    public void setLeaderId(String leaderId) { this.leaderId = leaderId; }
    public TeamStatus getStatus() { return status; }
    public void setStatus(TeamStatus status) { this.status = status; }
    public String getCapabilities() { return capabilities; }
    public void setCapabilities(String capabilities) { this.capabilities = capabilities; }
    public String getEquipment() { return equipment; }
    public void setEquipment(String equipment) { this.equipment = equipment; }
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    public int getActiveIncidentCount() { return activeIncidentCount; }
    public void setActiveIncidentCount(int activeIncidentCount) { this.activeIncidentCount = activeIncidentCount; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

