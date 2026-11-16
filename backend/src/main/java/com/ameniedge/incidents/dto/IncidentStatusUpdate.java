package com.ameniedge.incidents.dto;

import com.ameniedge.incidents.IncidentStatus;
import jakarta.validation.constraints.NotNull;

public class IncidentStatusUpdate {
    @NotNull
    private IncidentStatus status;
    private String note;

    public IncidentStatusUpdate() {}

    public IncidentStatusUpdate(IncidentStatus status, String note) {
        this.status = status;
        this.note = note;
    }

    public IncidentStatus getStatus() { return status; }
    public void setStatus(IncidentStatus status) { this.status = status; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}

