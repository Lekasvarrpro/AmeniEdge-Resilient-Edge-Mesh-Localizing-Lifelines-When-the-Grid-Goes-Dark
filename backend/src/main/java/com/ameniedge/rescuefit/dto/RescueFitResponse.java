package com.ameniedge.rescuefit.dto;

import java.util.List;

public class RescueFitResponse {
    private String incidentId;
    private String incidentCategory;
    private int affectedPeople;
    private List<RescueFitCandidate> eligibleTeams;
    private List<RescueFitExclusion> excludedTeams;
    private String stationNotice;

    public RescueFitResponse() {}

    public RescueFitResponse(String incidentId, String incidentCategory, int affectedPeople, List<RescueFitCandidate> eligibleTeams, List<RescueFitExclusion> excludedTeams, String stationNotice) {
        this.incidentId = incidentId;
        this.incidentCategory = incidentCategory;
        this.affectedPeople = affectedPeople;
        this.eligibleTeams = eligibleTeams;
        this.excludedTeams = excludedTeams;
        this.stationNotice = stationNotice;
    }

    public String getIncidentId() { return incidentId; }
    public void setIncidentId(String incidentId) { this.incidentId = incidentId; }
    public String getIncidentCategory() { return incidentCategory; }
    public void setIncidentCategory(String incidentCategory) { this.incidentCategory = incidentCategory; }
    public int getAffectedPeople() { return affectedPeople; }
    public void setAffectedPeople(int affectedPeople) { this.affectedPeople = affectedPeople; }
    public List<RescueFitCandidate> getEligibleTeams() { return eligibleTeams; }
    public void setEligibleTeams(List<RescueFitCandidate> eligibleTeams) { this.eligibleTeams = eligibleTeams; }
    public List<RescueFitExclusion> getExcludedTeams() { return excludedTeams; }
    public void setExcludedTeams(List<RescueFitExclusion> excludedTeams) { this.excludedTeams = excludedTeams; }
    public String getStationNotice() { return stationNotice; }
    public void setStationNotice(String stationNotice) { this.stationNotice = stationNotice; }
}
