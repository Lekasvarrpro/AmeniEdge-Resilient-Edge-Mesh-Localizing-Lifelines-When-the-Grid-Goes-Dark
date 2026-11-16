package com.ameniedge.incidents.dto;

import com.ameniedge.incidents.AssignmentState;
import com.ameniedge.incidents.DeliveryState;
import com.ameniedge.incidents.MissionState;
import com.ameniedge.incidents.SyncState;

import java.time.Instant;

public class ReportTrackerDto {

    private String incidentId;
    private String clientReferenceId;
    private String category;
    private int affectedPeople;
    private String locationLandmark;
    private Double latitude;
    private Double longitude;

    // Separate state fields
    private DeliveryState deliveryState;
    private AssignmentState assignmentState;
    private MissionState missionState;
    private SyncState syncState;

    // Granular timestamps
    private Instant savedAt;
    private Instant receivedAt;
    private Instant offeredAt;
    private Instant acceptedAt;
    private Instant dispatchedAt;
    private Instant arrivedAt;
    private Instant resolvedAt;

    // Station & team details
    private String stationId;
    private String stationName;
    private String departmentName;
    private String teamId;
    private String teamName;
    private String declineReason;
    private boolean reassigning;

    // Live telemetry (when active)
    private Double distanceKm;
    private Integer etaSeconds;
    private Double truckProgress;
    private Double truckLatitude;
    private Double truckLongitude;
    private Integer workTimeRemainingSeconds;

    public ReportTrackerDto() {}

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getClientReferenceId() { return clientReferenceId; }
    public void setClientReferenceId(String clientReferenceId) { this.clientReferenceId = clientReferenceId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getAffectedPeople() { return affectedPeople; }
    public void setAffectedPeople(int affectedPeople) { this.affectedPeople = affectedPeople; }
    public String getLocationLandmark() { return locationLandmark; }
    public void setLocationLandmark(String locationLandmark) { this.locationLandmark = locationLandmark; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
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
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getDeclineReason() { return declineReason; }
    public void setDeclineReason(String declineReason) { this.declineReason = declineReason; }
    public boolean isReassigning() { return reassigning; }
    public void setReassigning(boolean reassigning) { this.reassigning = reassigning; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public Integer getEtaSeconds() { return etaSeconds; }
    public void setEtaSeconds(Integer etaSeconds) { this.etaSeconds = etaSeconds; }
    public Double getTruckProgress() { return truckProgress; }
    public void setTruckProgress(Double truckProgress) { this.truckProgress = truckProgress; }
    public Double getTruckLatitude() { return truckLatitude; }
    public void setTruckLatitude(Double truckLatitude) { this.truckLatitude = truckLatitude; }
    public Double getTruckLongitude() { return truckLongitude; }
    public void setTruckLongitude(Double truckLongitude) { this.truckLongitude = truckLongitude; }
    public Integer getWorkTimeRemainingSeconds() { return workTimeRemainingSeconds; }
    public void setWorkTimeRemainingSeconds(Integer workTimeRemainingSeconds) { this.workTimeRemainingSeconds = workTimeRemainingSeconds; }
}

