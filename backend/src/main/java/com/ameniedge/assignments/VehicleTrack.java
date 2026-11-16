package com.ameniedge.assignments;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vehicle_tracks")
public class VehicleTrack {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "assignment_id", nullable = false, length = 64)
    private String assignmentId;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "team_id", nullable = false, length = 64)
    private String teamId;

    @Column(name = "route_polyline", nullable = false, columnDefinition = "TEXT")
    private String routePolyline;

    @Column(name = "start_latitude", nullable = false)
    private Double startLatitude;

    @Column(name = "start_longitude", nullable = false)
    private Double startLongitude;

    @Column(name = "target_latitude", nullable = false)
    private Double targetLatitude;

    @Column(name = "target_longitude", nullable = false)
    private Double targetLongitude;

    @Column(name = "current_latitude", nullable = false)
    private Double currentLatitude;

    @Column(name = "current_longitude", nullable = false)
    private Double currentLongitude;

    @Column(name = "departure_time", nullable = false)
    private Instant departureTime;

    @Column(name = "estimated_arrival_time", nullable = false)
    private Instant estimatedArrivalTime;

    @Column(name = "actual_arrival_time")
    private Instant actualArrivalTime;

    @Column(name = "speed_kmh", nullable = false)
    private Double speedKmh = 40.0;

    @Column(name = "total_distance_km", nullable = false)
    private Double totalDistanceKm = 2.5;

    @Column(name = "eta_seconds", nullable = false)
    private int etaSeconds = 225;

    @Column(name = "demo_speed_multiplier", nullable = false)
    private Double demoSpeedMultiplier = 1.0;

    @Column(nullable = false, length = 32)
    private String status = "EN_ROUTE";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public VehicleTrack() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getRoutePolyline() { return routePolyline; }
    public void setRoutePolyline(String routePolyline) { this.routePolyline = routePolyline; }
    public Double getStartLatitude() { return startLatitude; }
    public void setStartLatitude(Double startLatitude) { this.startLatitude = startLatitude; }
    public Double getStartLongitude() { return startLongitude; }
    public void setStartLongitude(Double startLongitude) { this.startLongitude = startLongitude; }
    public Double getTargetLatitude() { return targetLatitude; }
    public void setTargetLatitude(Double targetLatitude) { this.targetLatitude = targetLatitude; }
    public Double getTargetLongitude() { return targetLongitude; }
    public void setTargetLongitude(Double targetLongitude) { this.targetLongitude = targetLongitude; }
    public Double getCurrentLatitude() { return currentLatitude; }
    public void setCurrentLatitude(Double currentLatitude) { this.currentLatitude = currentLatitude; }
    public Double getCurrentLongitude() { return currentLongitude; }
    public void setCurrentLongitude(Double currentLongitude) { this.currentLongitude = currentLongitude; }
    public Instant getDepartureTime() { return departureTime; }
    public void setDepartureTime(Instant departureTime) { this.departureTime = departureTime; }
    public Instant getEstimatedArrivalTime() { return estimatedArrivalTime; }
    public void setEstimatedArrivalTime(Instant estimatedArrivalTime) { this.estimatedArrivalTime = estimatedArrivalTime; }
    public Instant getActualArrivalTime() { return actualArrivalTime; }
    public void setActualArrivalTime(Instant actualArrivalTime) { this.actualArrivalTime = actualArrivalTime; }
    public Double getSpeedKmh() { return speedKmh; }
    public void setSpeedKmh(Double speedKmh) { this.speedKmh = speedKmh; }
    public Double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(Double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }
    public int getEtaSeconds() { return etaSeconds; }
    public void setEtaSeconds(int etaSeconds) { this.etaSeconds = etaSeconds; }
    public Double getDemoSpeedMultiplier() { return demoSpeedMultiplier != null ? demoSpeedMultiplier : 1.0; }
    public void setDemoSpeedMultiplier(Double demoSpeedMultiplier) { this.demoSpeedMultiplier = demoSpeedMultiplier; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

