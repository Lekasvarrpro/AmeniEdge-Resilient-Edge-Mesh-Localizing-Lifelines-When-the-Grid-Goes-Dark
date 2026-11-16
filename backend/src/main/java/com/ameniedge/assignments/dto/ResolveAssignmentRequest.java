package com.ameniedge.assignments.dto;

import jakarta.validation.constraints.NotBlank;

public class ResolveAssignmentRequest {
    @NotBlank(message = "An outcome note is mandatory to close and resolve an emergency incident")
    private String outcomeNote;

    public ResolveAssignmentRequest() {}

    public ResolveAssignmentRequest(String outcomeNote) {
        this.outcomeNote = outcomeNote;
    }

    public String getOutcomeNote() { return outcomeNote; }
    public void setOutcomeNote(String outcomeNote) { this.outcomeNote = outcomeNote; }
}

