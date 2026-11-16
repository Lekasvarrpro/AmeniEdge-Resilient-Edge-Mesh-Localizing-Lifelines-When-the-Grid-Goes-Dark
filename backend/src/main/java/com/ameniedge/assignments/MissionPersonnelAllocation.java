package com.ameniedge.assignments;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "mission_personnel_allocations")
public class MissionPersonnelAllocation {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "assignment_id", nullable = false, length = 64)
    private String assignmentId;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "team_id", nullable = false, length = 64)
    private String teamId;

    @Column(name = "allocated_count", nullable = false)
    private int allocatedCount;

    @Column(nullable = false, length = 32)
    private String status = "DEPLOYED";

    @Column(name = "departure_time", nullable = false)
    private Instant departureTime;

    @Column(name = "return_start_time")
    private Instant returnStartTime;

    @Column(name = "return_complete_time")
    private Instant returnCompleteTime;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public MissionPersonnelAllocation() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getAssignmentId() { return assignmentId; }
    public void setAssignmentId(String assignmentId) { this.assignmentId = assignmentId; }
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public int getAllocatedCount() { return allocatedCount; }
    public void setAllocatedCount(int allocatedCount) { this.allocatedCount = allocatedCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getDepartureTime() { return departureTime; }
    public void setDepartureTime(Instant departureTime) { this.departureTime = departureTime; }
    public Instant getReturnStartTime() { return returnStartTime; }
    public void setReturnStartTime(Instant returnStartTime) { this.returnStartTime = returnStartTime; }
    public Instant getReturnCompleteTime() { return returnCompleteTime; }
    public void setReturnCompleteTime(Instant returnCompleteTime) { this.returnCompleteTime = returnCompleteTime; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

