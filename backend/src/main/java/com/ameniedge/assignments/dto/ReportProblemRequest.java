package com.ameniedge.assignments.dto;

import jakarta.validation.constraints.NotBlank;

public class ReportProblemRequest {
    @NotBlank(message = "A specific reason is required to report a problem from the field")
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}

