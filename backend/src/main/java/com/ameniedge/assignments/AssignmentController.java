package com.ameniedge.assignments;

import com.ameniedge.assignments.dto.*;
import com.ameniedge.auth.UserPrincipal;
import com.ameniedge.common.ApiResponse;
import com.ameniedge.organization.DepartmentCapacity;
import com.ameniedge.organization.DepartmentCapacityRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final AssignmentRepository assignmentRepository;
    private final VehicleTrackRepository vehicleTrackRepository;
    private final VehicleTrackingService vehicleTrackingService;
    private final DepartmentCapacityRepository capacityRepository;
    private final EstimatesService estimatesService;

    public AssignmentController(
            AssignmentService assignmentService,
            AssignmentRepository assignmentRepository,
            VehicleTrackRepository vehicleTrackRepository,
            VehicleTrackingService vehicleTrackingService,
            DepartmentCapacityRepository capacityRepository,
            EstimatesService estimatesService) {
        this.assignmentService = assignmentService;
        this.assignmentRepository = assignmentRepository;
        this.vehicleTrackRepository = vehicleTrackRepository;
        this.vehicleTrackingService = vehicleTrackingService;
        this.capacityRepository = capacityRepository;
        this.estimatesService = estimatesService;
    }

    @GetMapping("/alerts")
    public ResponseEntity<ApiResponse<List<AlertResponse>>> getRescueAlerts(
            @RequestParam(required = false) String teamId,
            @RequestParam(required = false) String team_id,
            @RequestParam(required = false) String stationId,
            @RequestParam(required = false) String station_id,
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal UserPrincipal principal) {

        String effTeam = teamId != null ? teamId : team_id;
        if (effTeam == null && principal != null && principal.getTeamId() != null) {
            effTeam = principal.getTeamId();
        }

        String effStation = stationId != null ? stationId : station_id;
        if (effStation == null && principal != null && principal.getStationId() != null) {
            effStation = principal.getStationId();
        }

        List<AlertResponse> alerts = assignmentService.getRescueAlerts(effTeam, effStation, status);
        return ResponseEntity.ok(ApiResponse.ok(alerts));
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
            @RequestBody(required = false) AcceptAssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "USR-RSC-N-01";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";

        Double multiplier = request != null ? request.getDemoSpeedMultiplier() : 1.0;
        Boolean fieldConf = request != null ? request.getFieldConfirmationRequired() : false;

        Assignment accepted = assignmentService.acceptAssignment(id, multiplier, fieldConf, actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Mission accepted", accepted));
    }

    @PostMapping("/assignments/{id}/decline")
    public ResponseEntity<ApiResponse<Assignment>> declineAssignment(
            @PathVariable String id,
            @RequestBody(required = false) DeclineRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "USR-RSC-N-01";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";
        String reason = request != null ? request.getReason() : null;

        Assignment declined = assignmentService.declineAssignment(id, reason, actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Mission declined and returned to triage", declined));
    }

    @PostMapping("/assignments/{id}/report-problem")
    public ResponseEntity<ApiResponse<Assignment>> reportProblem(
            @PathVariable String id,
            @Valid @RequestBody ReportProblemRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "USR-RSC-N-01";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";

        Assignment updated = assignmentService.reportProblem(id, request.getReason(), actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Operational problem reported", updated));
    }

    @PostMapping("/assignments/{id}/extend-time")
    public ResponseEntity<ApiResponse<Assignment>> extendTime(
            @PathVariable String id,
            @RequestBody(required = false) ExtendTimeRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "USR-RSC-N-01";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";
        int secs = request != null ? request.getAdditionalSeconds() : 60;

        Assignment updated = assignmentService.extendWorkTime(id, secs, actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Work timer extended by " + secs + "s", updated));
    }

    @GetMapping("/missions/{id}/track")
    public ResponseEntity<ApiResponse<VehicleTrackingService.LiveTelemetry>> getLiveMissionTrack(@PathVariable String id) {
        Optional<VehicleTrack> trackOpt = vehicleTrackRepository.findByAssignmentId(id)
                .or(() -> vehicleTrackRepository.findByIncidentId(id))
                .or(() -> vehicleTrackRepository.findById(id));

        if (trackOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No active vehicle track found for identifier: " + id));
        }

        VehicleTrackingService.LiveTelemetry telemetry = vehicleTrackingService.calculateLiveTelemetry(trackOpt.get());
        return ResponseEntity.ok(ApiResponse.ok(telemetry));
    }

    @GetMapping("/departments/{id}/capacity")
    public ResponseEntity<ApiResponse<DepartmentCapacity>> getDepartmentCapacity(@PathVariable String id) {
        Optional<DepartmentCapacity> capOpt = capacityRepository.findByTeamId(id)
                .or(() -> capacityRepository.findById(id));

        if (capOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Department capacity not found for: " + id));
        }
        return ResponseEntity.ok(ApiResponse.ok(capOpt.get()));
    }

    @GetMapping("/stats/estimates")
    public ResponseEntity<ApiResponse<EstimatesService.DepartmentEstimatesSummary>> getEstimates(
            @RequestParam(defaultValue = "TEAM-CHN-N-001") String departmentId) {
        EstimatesService.DepartmentEstimatesSummary summary = estimatesService.getEstimatesForDepartment(departmentId);
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @PatchMapping("/assignments/{id}/telemetry")
    public ResponseEntity<ApiResponse<Assignment>> updateTelemetry(
            @PathVariable String id,
            @RequestBody TruckTelemetryUpdate update) {

        Assignment updated = assignmentService.updateTelemetry(id, update);
        return ResponseEntity.ok(ApiResponse.ok("Truck telemetry updated", updated));
    }

    @PostMapping("/assignments/{id}/resolve")
    public ResponseEntity<ApiResponse<Assignment>> resolveAssignment(
            @PathVariable String id,
            @Valid @RequestBody ResolveAssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {

        String actorId = principal != null ? principal.getId() : "USR-RSC-N-01";
        String actorRole = principal != null ? principal.getRole().name() : "RESCUE_MEMBER";

        Assignment resolved = assignmentService.resolveAssignment(id, request.getOutcomeNote(), actorId, actorRole);
        return ResponseEntity.ok(ApiResponse.ok("Mission resolved and finalized", resolved));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<Assignment>>> getAssignments(
            @RequestParam(required = false) String teamId,
            @RequestParam(required = false) String team_id,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String incidentId,
            @AuthenticationPrincipal UserPrincipal principal) {

        String effectiveTeamId = teamId != null ? teamId : team_id;
        if (effectiveTeamId == null && principal != null && principal.getTeamId() != null) {
            effectiveTeamId = principal.getTeamId();
        }

        List<Assignment> list = assignmentService.getAssignments(effectiveTeamId, status, incidentId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/assignments/active")
    public ResponseEntity<ApiResponse<Assignment>> getActiveAssignment(
            @RequestParam(required = false) String teamId,
            @RequestParam(required = false) String team_id,
            @AuthenticationPrincipal UserPrincipal principal) {

        String effectiveTeamId = teamId != null ? teamId : team_id;
        if (effectiveTeamId == null && principal != null && principal.getTeamId() != null) {
            effectiveTeamId = principal.getTeamId();
        }

        Assignment active = assignmentService.getActiveAssignmentForTeam(effectiveTeamId);
        return ResponseEntity.ok(ApiResponse.ok(active));
    }

    @GetMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<Assignment>> getAssignment(@PathVariable String id) {
        Assignment assignment = assignmentRepository.findById(id)
                .or(() -> assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(id))
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
