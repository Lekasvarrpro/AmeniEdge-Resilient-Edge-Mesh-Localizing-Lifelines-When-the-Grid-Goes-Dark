package com.ameniedge.assignments.dto;

public class ExtendTimeRequest {
    private int additionalSeconds = 60;

    public int getAdditionalSeconds() {
        return additionalSeconds > 0 ? additionalSeconds : 60;
    }

    public void setAdditionalSeconds(int additionalSeconds) {
        this.additionalSeconds = additionalSeconds;
    }
}

