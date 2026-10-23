package com.ameniedge.assignments;

import com.ameniedge.auth.UserPrincipal;
import com.ameniedge.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final AssignmentRepository assignmentRepository;

    public AssignmentController(AssignmentService assignmentService, AssignmentRepository assignmentRepository) {
        this.assignmentService = assignmentService;
        this.assignmentRepository = assignmentRepository;
    }

    @PostMapping("/incidents/{id}/assignments")
    @PreAuthorize("hasAnyRole('STATION_LEADER', 'REGIONAL_SUPERVISOR', 'ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Assignment>> assignTeam(
            @PathVariable String id,
            @RequestBody AssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "LEADER";
        String actorRole = principal != null ? principal.getRole().name() : "STATION_LEADER";

        Assignment assignment = assignmentService.createAssignment(id, request.getTeamId(), request.getNotes(), actorId, actorRole);
        return new ResponseEntity<>(ApiResponse.ok("Team assigned to incident", assignment), HttpStatus.CREATED);
    }

    @PostMapping("/assignments/{id}/accept")
    public ResponseEntity<ApiResponse<Assignment>> acceptAssignment(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "RESCUER";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";

        Assignment accepted = assignmentService.acceptAssignment(id, actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Mission accepted", accepted));
    }

    @PostMapping("/assignments/{id}/decline")
    public ResponseEntity<ApiResponse<Assignment>> declineAssignment(
            @PathVariable String id,
            @RequestBody DeclineRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "RESCUER";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";

        Assignment declined = assignmentService.declineAssignment(id, request.getReason(), actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Mission declined and returned to triage", declined));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<Assignment>> getAssignment(@PathVariable String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found with ID: " + id));
        return ResponseEntity.ok(ApiResponse.ok(assignment));
    }

    public static class AssignmentRequest {
        private String teamId;
        private String notes;

        public String getTeamId() { return teamId; }
        public void setTeamId(String teamId) { this.teamId = teamId; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class DeclineRequest {
        private String reason;
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
