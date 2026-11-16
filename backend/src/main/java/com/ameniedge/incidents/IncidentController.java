package com.ameniedge.incidents;

import com.ameniedge.auth.UserPrincipal;
import com.ameniedge.common.ApiResponse;
import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import com.ameniedge.incidents.dto.ReportTrackerDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Incident>> createIncident(
            @Valid @RequestBody CreateIncidentRequest request,
            @RequestHeader(value = "X-Client-Reference-Id", required = false) String headerClientRef,
            @AuthenticationPrincipal UserPrincipal principal) {

        if (request.getClientReferenceId() == null || request.getClientReferenceId().isBlank()) {
            if (headerClientRef != null && !headerClientRef.isBlank()) {
                request.setClientReferenceId(headerClientRef);
            }
        }

        String actorId = principal != null ? principal.getId() : null;
        String actorRole = principal != null ? principal.getRole().name() : "CITIZEN";

        Incident created = incidentService.createIncident(request, actorId, actorRole);
        return new ResponseEntity<>(ApiResponse.ok("Incident registered successfully", created), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Incident>>> listIncidents(
            @RequestParam(required = false) String station_id,
            @RequestParam(required = false) IncidentStatus status) {
        List<Incident> list = incidentService.findAll(station_id, status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Incident>> getIncident(@PathVariable String id) {
        Incident incident = incidentService.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(incident));
    }

    @GetMapping("/{id}/tracker")
    public ResponseEntity<ApiResponse<ReportTrackerDto>> getReportTracker(@PathVariable String id) {
        ReportTrackerDto tracker = incidentService.getReportTracker(id);
        return ResponseEntity.ok(ApiResponse.ok(tracker));
    }

    @GetMapping("/{id}/events")
    public ResponseEntity<ApiResponse<List<IncidentEvent>>> getIncidentEvents(@PathVariable String id) {
        List<IncidentEvent> events = incidentService.getEvents(id);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Incident>> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody IncidentStatusUpdate update,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "ANONYMOUS";
        String actorRole = principal != null ? principal.getRole().name() : "SYSTEM";

        Incident updated = incidentService.transitionStatus(id, update, actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Status transitioned to " + update.getStatus(), updated));
    }
}

