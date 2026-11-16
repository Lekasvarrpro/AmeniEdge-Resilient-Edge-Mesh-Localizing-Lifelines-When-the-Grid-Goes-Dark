package com.ameniedge.assignments.dto;

public class AcceptAssignmentRequest {
    private Double demoSpeedMultiplier = 1.0;
    private Boolean fieldConfirmationRequired = false;

    public Double getDemoSpeedMultiplier() {
        return demoSpeedMultiplier != null ? demoSpeedMultiplier : 1.0;
    }

    public void setDemoSpeedMultiplier(Double demoSpeedMultiplier) {
        this.demoSpeedMultiplier = demoSpeedMultiplier;
    }

    public Boolean getFieldConfirmationRequired() {
        return fieldConfirmationRequired != null ? fieldConfirmationRequired : false;
    }

    public void setFieldConfirmationRequired(Boolean fieldConfirmationRequired) {
        this.fieldConfirmationRequired = fieldConfirmationRequired;
    }
}

