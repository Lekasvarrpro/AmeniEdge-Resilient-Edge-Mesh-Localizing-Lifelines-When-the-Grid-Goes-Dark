package com.ameniedge.rescuefit.dto;

public class RescueFitExclusion {
    private String teamId;
    private String teamName;
    private String exclusionReason;
    private String potentialSupportRole;

    public RescueFitExclusion() {}

    public RescueFitExclusion(String teamId, String teamName, String exclusionReason, String potentialSupportRole) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.exclusionReason = exclusionReason;
        this.potentialSupportRole = potentialSupportRole;
    }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public String getExclusionReason() { return exclusionReason; }
    public void setExclusionReason(String exclusionReason) { this.exclusionReason = exclusionReason; }
    public String getPotentialSupportRole() { return potentialSupportRole; }
    public void setPotentialSupportRole(String potentialSupportRole) { this.potentialSupportRole = potentialSupportRole; }
}

