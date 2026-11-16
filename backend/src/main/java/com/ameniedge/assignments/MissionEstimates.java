package com.ameniedge.assignments;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "mission_estimates")
public class MissionEstimates {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "department_id", nullable = false, length = 64)
    private String departmentId;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "travel_distance_km", nullable = false)
    private Double travelDistanceKm;

    @Column(name = "travel_time_seconds", nullable = false)
    private int travelTimeSeconds;

    @Column(name = "work_time_seconds", nullable = false)
    private int workTimeSeconds;

    @Column(name = "return_time_seconds", nullable = false)
    private int returnTimeSeconds;

    @Column(name = "total_estimated_seconds", nullable = false)
    private int totalEstimatedSeconds;

    @Column(name = "estimated_start_time")
    private Instant estimatedStartTime;

    @Column(name = "based_on_history_count")
    private int basedOnHistoryCount = 0;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public MissionEstimates() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public Double getTravelDistanceKm() { return travelDistanceKm; }
    public void setTravelDistanceKm(Double travelDistanceKm) { this.travelDistanceKm = travelDistanceKm; }
    public int getTravelTimeSeconds() { return travelTimeSeconds; }
    public void setTravelTimeSeconds(int travelTimeSeconds) { this.travelTimeSeconds = travelTimeSeconds; }
    public int getWorkTimeSeconds() { return workTimeSeconds; }
    public void setWorkTimeSeconds(int workTimeSeconds) { this.workTimeSeconds = workTimeSeconds; }
    public int getReturnTimeSeconds() { return returnTimeSeconds; }
    public void setReturnTimeSeconds(int returnTimeSeconds) { this.returnTimeSeconds = returnTimeSeconds; }
    public int getTotalEstimatedSeconds() { return totalEstimatedSeconds; }
    public void setTotalEstimatedSeconds(int totalEstimatedSeconds) { this.totalEstimatedSeconds = totalEstimatedSeconds; }
    public Instant getEstimatedStartTime() { return estimatedStartTime; }
    public void setEstimatedStartTime(Instant estimatedStartTime) { this.estimatedStartTime = estimatedStartTime; }
    public int getBasedOnHistoryCount() { return basedOnHistoryCount; }
    public void setBasedOnHistoryCount(int basedOnHistoryCount) { this.basedOnHistoryCount = basedOnHistoryCount; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

