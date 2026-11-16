package com.ameniedge.assignments;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false, length = 64)
    private String incidentId;

    @Column(name = "team_id", nullable = false, length = 64)
    private String teamId;

    @Column(name = "station_id", nullable = false, length = 64)
    private String stationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AssignmentStatus status = AssignmentStatus.PENDING_ACK;

    @Column(name = "decline_reason", columnDefinition = "TEXT")
    private String declineReason;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "truck_latitude")
    private Double truckLatitude;

    @Column(name = "truck_longitude")
    private Double truckLongitude;

    @Column(name = "truck_progress")
    private Double truckProgress = 0.0;

    @Column(name = "truck_arrived")
    private Boolean truckArrived = false;

    @Column(name = "outcome_note", columnDefinition = "TEXT")
    private String outcomeNote;

    @Column(name = "allocated_personnel")
    private Integer allocatedPersonnel = 0;

    @Column(name = "lifecycle_state", length = 32)
    private String lifecycleState = "OFFERED";

    @Column(name = "state", length = 32)
    private String state = "OFFERED";

    @Column(name = "field_confirmation_required")
    private Boolean fieldConfirmationRequired = false;

    @Column(name = "problem_reason", columnDefinition = "TEXT")
    private String problemReason;

    @Column(name = "work_extended_seconds")
    private Integer workExtendedSeconds = 0;

    @Column(name = "forwarded_from")
    private String forwardedFrom;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public Assignment() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public AssignmentStatus getStatus() { return status; }
    public void setStatus(AssignmentStatus status) { this.status = status; }
    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Double getTruckLatitude() { return truckLatitude; }
    public void setTruckLatitude(Double truckLatitude) { this.truckLatitude = truckLatitude; }
    public Double getTruckLongitude() { return truckLongitude; }
    public void setTruckLongitude(Double truckLongitude) { this.truckLongitude = truckLongitude; }
    public Double getTruckProgress() { return truckProgress != null ? truckProgress : 0.0; }
    public void setTruckProgress(Double truckProgress) { this.truckProgress = truckProgress; }
    public Boolean getTruckArrived() { return truckArrived != null ? truckArrived : false; }
    public void setTruckArrived(Boolean truckArrived) { this.truckArrived = truckArrived; }
    public String getOutcomeNote() { return outcomeNote; }
    public void setOutcomeNote(String outcomeNote) { this.outcomeNote = outcomeNote; }
    public int getAllocatedPersonnel() { return allocatedPersonnel != null ? allocatedPersonnel : 0; }
    public void setAllocatedPersonnel(Integer allocatedPersonnel) { this.allocatedPersonnel = allocatedPersonnel != null ? allocatedPersonnel : 0; }
    public String getLifecycleState() { return lifecycleState != null ? lifecycleState : "OFFERED"; }
    public void setLifecycleState(String lifecycleState) {
        this.lifecycleState = lifecycleState;
        this.state = lifecycleState;
    }
    public String getState() { return state != null ? state : (lifecycleState != null ? lifecycleState : "OFFERED"); }
    public void setState(String state) {
        this.state = state;
        this.lifecycleState = state;
    }
    public boolean isFieldConfirmationRequired() { return Boolean.TRUE.equals(fieldConfirmationRequired); }
    public void setFieldConfirmationRequired(Boolean fieldConfirmationRequired) { this.fieldConfirmationRequired = fieldConfirmationRequired != null ? fieldConfirmationRequired : false; }
    public String getProblemReason() { return problemReason; }
    public void setProblemReason(String problemReason) { this.problemReason = problemReason; }
    public int getWorkExtendedSeconds() { return workExtendedSeconds != null ? workExtendedSeconds : 0; }
    public void setWorkExtendedSeconds(Integer workExtendedSeconds) { this.workExtendedSeconds = workExtendedSeconds != null ? workExtendedSeconds : 0; }
    public String getForwardedFrom() { return forwardedFrom; }
    public void setForwardedFrom(String forwardedFrom) { this.forwardedFrom = forwardedFrom; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
