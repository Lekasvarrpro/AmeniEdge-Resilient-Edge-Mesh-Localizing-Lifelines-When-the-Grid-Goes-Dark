package com.ameniedge.assignments.dto;

import com.ameniedge.assignments.Assignment;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.incidents.IncidentPriority;

import java.time.Instant;

public class AlertResponse {
    private String incidentId;
    private String assignmentId;
    private String stationId;
    private String region;
    private String teamId;
    private IncidentCategory category;
    private IncidentPriority priority;
    private double priorityScore;
    private String scoreExplanation;
    private int affectedPeople;
    private Double latitude;
    private Double longitude;
    private String locationLandmark;
    private String details;
    private String contactName;
    private String contactPhone;
    private boolean vulnerablePresent;
    private boolean inHazardZone;
    private int requiredPersonnel;
    private int workTimeSeconds;
    private String assignmentStatus;
    private String lifecycleState;
    private String queueStatus;
    private Instant createdAt;
    private String declineReason;
    private String outcomeNote;
    private String stationName;
    private String departmentName;
    private Double distanceKm;
    private String forwardedFrom;
    private String routingNotice;

    public static AlertResponse from(Incident inc, Assignment asn) {
        return from(inc, asn, null, null, null);
    }

    public static AlertResponse from(Incident inc, Assignment asn, String stationName, String departmentName, Double distanceKm) {
        AlertResponse res = new AlertResponse();
        res.incidentId = inc.getId();
        res.stationId = inc.getStationId();
        res.region = inc.getRegion();
        res.teamId = inc.getAssignedTeamId();
        res.stationName = stationName;
        res.departmentName = departmentName;
        res.distanceKm = distanceKm;
        res.category = inc.getCategory();
        res.priority = inc.getPriority();
        res.priorityScore = inc.getPriorityScore() != null ? inc.getPriorityScore() : 50.0;
        res.scoreExplanation = inc.getScoreExplanation();
        res.affectedPeople = inc.getAffectedPeople();
        res.latitude = inc.getLatitude();
        res.longitude = inc.getLongitude();
        res.locationLandmark = inc.getLocationLandmark();
        res.details = inc.getDetails();
        res.contactName = inc.getContactName();
        res.contactPhone = inc.getContactPhone();
        res.vulnerablePresent = inc.isVulnerablePresent();
        res.inHazardZone = inc.isInHazardZone();
        res.requiredPersonnel = inc.getRequiredPersonnel();
        res.workTimeSeconds = inc.getWorkTimeSeconds();
        res.queueStatus = inc.getQueueStatus();
        res.createdAt = inc.getCreatedAt();
        res.routingNotice = inc.getRoutingNotice();

        if (asn != null) {
            res.assignmentId = asn.getId();
            res.assignmentStatus = asn.getStatus().name();
            res.lifecycleState = asn.getLifecycleState();
            res.declineReason = asn.getDeclineReason();
            res.outcomeNote = asn.getOutcomeNote();
            res.forwardedFrom = asn.getForwardedFrom();
            if (res.teamId == null) {
                res.teamId = asn.getTeamId();
            }
        } else {
            res.assignmentStatus = "UNASSIGNED";
            res.lifecycleState = "OFFERED";
        }
        return res;
    }

    public String getIncidentId() { return incidentId; }
    public String getAssignmentId() { return assignmentId; }
    public String getStationId() { return stationId; }
    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }
    public String getTeamId() { return teamId; }
    public IncidentCategory getCategory() { return category; }
    public IncidentPriority getPriority() { return priority; }
    public double getPriorityScore() { return priorityScore; }
    public String getScoreExplanation() { return scoreExplanation; }
    public int getAffectedPeople() { return affectedPeople; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getLocationLandmark() { return locationLandmark; }
    public String getDetails() { return details; }
    public String getContactName() { return contactName; }
    public String getContactPhone() { return contactPhone; }
    public boolean isVulnerablePresent() { return vulnerablePresent; }
    public boolean isInHazardZone() { return inHazardZone; }
    public int getRequiredPersonnel() { return requiredPersonnel; }
    public int getWorkTimeSeconds() { return workTimeSeconds; }
    public String getAssignmentStatus() { return assignmentStatus; }
    public String getLifecycleState() { return lifecycleState; }
    public String getQueueStatus() { return queueStatus; }
    public Instant getCreatedAt() { return createdAt; }
    public String getDeclineReason() { return declineReason; }
    public String getOutcomeNote() { return outcomeNote; }
    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }
    public String getForwardedFrom() { return forwardedFrom; }
    public void setForwardedFrom(String forwardedFrom) { this.forwardedFrom = forwardedFrom; }
    public String getRoutingNotice() { return routingNotice; }
    public void setRoutingNotice(String routingNotice) { this.routingNotice = routingNotice; }
}

