package com.ameniedge.rescuefit.dto;

public class RescueFitCandidate {
    private String teamId;
    private String teamName;
    private double fitScore;
    private int etaMinutes;
    private int distanceMeters;
    private String rationale;
    private boolean isStaleTelemetry;

    public RescueFitCandidate() {}

    public RescueFitCandidate(String teamId, String teamName, double fitScore, int etaMinutes, int distanceMeters, String rationale, boolean isStaleTelemetry) {
        this.teamId = teamId;
        this.teamName = teamName;
        this.fitScore = fitScore;
        this.etaMinutes = etaMinutes;
        this.distanceMeters = distanceMeters;
        this.rationale = rationale;
        this.isStaleTelemetry = isStaleTelemetry;
    }

    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public double getFitScore() { return fitScore; }
    public void setFitScore(double fitScore) { this.fitScore = fitScore; }
    public int getEtaMinutes() { return etaMinutes; }
    public void setEtaMinutes(int etaMinutes) { this.etaMinutes = etaMinutes; }
    public int getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(int distanceMeters) { this.distanceMeters = distanceMeters; }
    public String getRationale() { return rationale; }
    public void setRationale(String rationale) { this.rationale = rationale; }
    public boolean isStaleTelemetry() { return isStaleTelemetry; }
    public void setStaleTelemetry(boolean staleTelemetry) { isStaleTelemetry = staleTelemetry; }
}
