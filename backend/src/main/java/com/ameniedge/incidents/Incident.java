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
    private Integer affectedPeople = 1;

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
    private Boolean hasImmediateDanger = false;

    @Column(name = "assigned_team_id", length = 64)
    private String assignedTeamId;

    @Column(name = "conflict_detected")
    private Boolean conflictDetected = false;

    @Column(name = "priority_score")
    private Double priorityScore = 50.0;

    @Column(name = "score_explanation", columnDefinition = "TEXT")
    private String scoreExplanation;

    @Column(name = "vulnerable_present")
    private Boolean vulnerablePresent = false;

    @Column(name = "in_hazard_zone")
    private Boolean inHazardZone = false;

    @Column(name = "required_personnel")
    private Integer requiredPersonnel = 8;

    @Column(name = "work_time_seconds")
    private Integer workTimeSeconds = 180;

    @Column(name = "work_started_at")
    private Instant workStartedAt;

    @Column(name = "work_completed_at")
    private Instant workCompletedAt;

    @Column(name = "queue_status", length = 32)
    private String queueStatus = "PENDING";

    @Enumerated(EnumType.STRING)
    @Column(name = "delivery_state", length = 32)
    private DeliveryState deliveryState = DeliveryState.RECEIVED_BY_STATION;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_state", length = 32)
    private AssignmentState assignmentState = AssignmentState.NONE;

    @Enumerated(EnumType.STRING)
    @Column(name = "mission_state", length = 32)
    private MissionState missionState = MissionState.WAITING;

    @Enumerated(EnumType.STRING)
    @Column(name = "sync_state", length = 32)
    private SyncState syncState = SyncState.SYNCED;

    @Column(name = "saved_at")
    private Instant savedAt;

    @Column(name = "received_at")
    private Instant receivedAt = Instant.now();

    @Column(name = "offered_at")
    private Instant offeredAt;

    @Column(name = "accepted_at")
    private Instant acceptedAt;

    @Column(name = "dispatched_at")
    private Instant dispatchedAt;

    @Column(name = "arrived_at")
    private Instant arrivedAt;

    @Column(name = "resolved_at")
    private Instant resolvedAt;

    @Column(name = "department_name")
    private String departmentName;

    @Column(name = "region", length = 32)
    private String region;

    @Column(name = "decline_reason", columnDefinition = "TEXT")
    private String declineReason;

    @Transient
    private String assignedTeamName;

    @Transient
    private String stationName;

    @Column(name = "routing_notice", columnDefinition = "TEXT")
    private String routingNotice;

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
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public IncidentCategory getCategory() { return category; }
    public void setCategory(IncidentCategory category) { this.category = category; }
    public IncidentPriority getPriority() { return priority; }
    public void setPriority(IncidentPriority priority) { this.priority = priority; }
    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
    public int getAffectedPeople() { return affectedPeople != null ? affectedPeople : 1; }
    public void setAffectedPeople(Integer affectedPeople) { this.affectedPeople = affectedPeople != null ? affectedPeople : 1; }
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
    public boolean isHasImmediateDanger() { return Boolean.TRUE.equals(hasImmediateDanger); }
    public void setHasImmediateDanger(Boolean hasImmediateDanger) { this.hasImmediateDanger = hasImmediateDanger != null ? hasImmediateDanger : false; }
    public String getAssignedTeamId() { return assignedTeamId; }
    public void setAssignedTeamId(String assignedTeamId) { this.assignedTeamId = assignedTeamId; }
    public boolean isConflictDetected() { return Boolean.TRUE.equals(conflictDetected); }
    public void setConflictDetected(Boolean conflictDetected) { this.conflictDetected = conflictDetected != null ? conflictDetected : false; }
    public Double getPriorityScore() { return priorityScore != null ? priorityScore : 50.0; }
    public void setPriorityScore(Double priorityScore) { this.priorityScore = priorityScore; }
    public String getScoreExplanation() { return scoreExplanation; }
    public void setScoreExplanation(String scoreExplanation) { this.scoreExplanation = scoreExplanation; }
    public boolean isVulnerablePresent() { return Boolean.TRUE.equals(vulnerablePresent); }
    public void setVulnerablePresent(Boolean vulnerablePresent) { this.vulnerablePresent = vulnerablePresent != null ? vulnerablePresent : false; }
    public boolean isInHazardZone() { return Boolean.TRUE.equals(inHazardZone); }
    public void setInHazardZone(Boolean inHazardZone) { this.inHazardZone = inHazardZone != null ? inHazardZone : false; }
    public int getRequiredPersonnel() { return requiredPersonnel != null ? requiredPersonnel : 8; }
    public void setRequiredPersonnel(Integer requiredPersonnel) { this.requiredPersonnel = requiredPersonnel != null ? requiredPersonnel : 8; }
    public int getWorkTimeSeconds() { return workTimeSeconds != null ? workTimeSeconds : 180; }
    public void setWorkTimeSeconds(Integer workTimeSeconds) { this.workTimeSeconds = workTimeSeconds != null ? workTimeSeconds : 180; }
    public Instant getWorkStartedAt() { return workStartedAt; }
    public void setWorkStartedAt(Instant workStartedAt) { this.workStartedAt = workStartedAt; }
    public Instant getWorkCompletedAt() { return workCompletedAt; }
    public void setWorkCompletedAt(Instant workCompletedAt) { this.workCompletedAt = workCompletedAt; }
    public String getQueueStatus() { return queueStatus; }
    public void setQueueStatus(String queueStatus) { this.queueStatus = queueStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    public String getAssignedTeamName() { return assignedTeamName; }
    public void setAssignedTeamName(String assignedTeamName) { this.assignedTeamName = assignedTeamName; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public String getRoutingNotice() { return routingNotice; }
    public void setRoutingNotice(String routingNotice) { this.routingNotice = routingNotice; }
    public DeliveryState getDeliveryState() { return deliveryState; }
    public void setDeliveryState(DeliveryState deliveryState) { this.deliveryState = deliveryState; }
    public AssignmentState getAssignmentState() { return assignmentState; }
    public void setAssignmentState(AssignmentState assignmentState) { this.assignmentState = assignmentState; }
    public MissionState getMissionState() { return missionState; }
    public void setMissionState(MissionState missionState) { this.missionState = missionState; }
    public SyncState getSyncState() { return syncState; }
    public void setSyncState(SyncState syncState) { this.syncState = syncState; }
    public Instant getSavedAt() { return savedAt; }
    public void setSavedAt(Instant savedAt) { this.savedAt = savedAt; }
    public Instant getReceivedAt() { return receivedAt; }
    public void setReceivedAt(Instant receivedAt) { this.receivedAt = receivedAt; }
    public Instant getOfferedAt() { return offeredAt; }
    public void setOfferedAt(Instant offeredAt) { this.offeredAt = offeredAt; }
    public Instant getAcceptedAt() { return acceptedAt; }
    public void setAcceptedAt(Instant acceptedAt) { this.acceptedAt = acceptedAt; }
    public Instant getDispatchedAt() { return dispatchedAt; }
    public void setDispatchedAt(Instant dispatchedAt) { this.dispatchedAt = dispatchedAt; }
    public Instant getArrivedAt() { return arrivedAt; }
    public void setArrivedAt(Instant arrivedAt) { this.arrivedAt = arrivedAt; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }
}

