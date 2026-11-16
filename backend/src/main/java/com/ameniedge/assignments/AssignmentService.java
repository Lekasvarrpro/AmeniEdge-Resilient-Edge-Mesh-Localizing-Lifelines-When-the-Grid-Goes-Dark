package com.ameniedge.assignments;

import com.ameniedge.assignments.dto.AlertResponse;
import com.ameniedge.assignments.dto.TruckTelemetryUpdate;
import com.ameniedge.common.ArrivalGateException;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentService;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.incidents.PriorityScoringService;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import com.ameniedge.organization.DepartmentCapacityRepository;
import com.ameniedge.organization.Station;
import com.ameniedge.organization.StationRepository;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.users.Role;
import com.ameniedge.users.User;
import com.ameniedge.users.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentService incidentService;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final HeadcountService headcountService;
    private final VehicleTrackingService vehicleTrackingService;
    private final EstimatesService estimatesService;
    private final PriorityScoringService priorityScoringService;
    private final DepartmentCapacityRepository capacityRepository;

    @Autowired(required = false)
    private StationRepository stationRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public void setMessagingTemplate(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    private void broadcastAlertUpdate(Assignment assignment) {
        if (messagingTemplate != null && assignment != null) {
            try {
                if (assignment.getTeamId() != null) {
                    messagingTemplate.convertAndSend("/topic/alerts/team/" + assignment.getTeamId(), assignment);
                }
                if (assignment.getStationId() != null) {
                    messagingTemplate.convertAndSend("/topic/alerts/station/" + assignment.getStationId(), assignment);
                }
                messagingTemplate.convertAndSend("/topic/alerts/all", assignment);
            } catch (Exception ignored) {}
        }
    }

    public void setStationRepository(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            IncidentRepository incidentRepository,
            IncidentService incidentService,
            TeamRepository teamRepository,
            UserRepository userRepository) {
        this(assignmentRepository, incidentRepository, incidentService, teamRepository, userRepository,
                null, null, null, null, null);
    }

    @Autowired
    public AssignmentService(
            AssignmentRepository assignmentRepository,
            IncidentRepository incidentRepository,
            IncidentService incidentService,
            TeamRepository teamRepository,
            UserRepository userRepository,
            @Autowired(required = false) HeadcountService headcountService,
            @Autowired(required = false) VehicleTrackingService vehicleTrackingService,
            @Autowired(required = false) EstimatesService estimatesService,
            @Autowired(required = false) PriorityScoringService priorityScoringService,
            @Autowired(required = false) DepartmentCapacityRepository capacityRepository) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
        this.incidentService = incidentService;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.headcountService = headcountService;
        this.vehicleTrackingService = vehicleTrackingService;
        this.estimatesService = estimatesService;
        this.priorityScoringService = priorityScoringService;
        this.capacityRepository = capacityRepository;
    }

    public Assignment createAssignment(String incidentId, String teamId, String notes, String actorId, String actorRole) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        // CRITICAL FIX: Incident station MUST follow the assigned team's station
        incident.setStationId(team.getStationId());
        incident.setAssignedTeamId(teamId);
        incident.setStatus(IncidentStatus.ASSIGNED);
        incident.setQueueStatus("PENDING");
        incidentRepository.save(incident);

        Assignment assignment = assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(incidentId).orElse(null);
        if (assignment == null) {
            assignment = new Assignment();
            assignment.setId("ASN-" + (10000 + new Random().nextInt(90000)));
            assignment.setIncidentId(incidentId);
        }
        assignment.setTeamId(teamId);
        assignment.setStationId(team.getStationId());
        assignment.setStatus(AssignmentStatus.PENDING_ACK);
        assignment.setLifecycleState("OFFERED");
        assignment.setNotes(notes);
        assignment.setTruckLatitude(team.getCurrentLatitude());
        assignment.setTruckLongitude(team.getCurrentLongitude());
        assignment.setTruckProgress(0.0);
        assignment.setTruckArrived(false);

        Assignment saved = assignmentRepository.save(assignment);
        broadcastAlertUpdate(saved);

        try {
            incidentService.transitionStatus(incidentId, new IncidentStatusUpdate(IncidentStatus.ASSIGNED, "Assigned to " + team.getName() + (notes != null ? ": " + notes : "")), actorId, actorRole);
        } catch (Exception ignored) {}

        team.setActiveIncidentCount(team.getActiveIncidentCount() + 1);
        teamRepository.save(team);

        broadcastAlertUpdate(saved);
        return saved;
    }

    public Assignment acceptAssignment(String assignmentId, String actorId, String actorRole) {
        return acceptAssignment(assignmentId, 1.0, false, actorId, actorRole);
    }

    public Assignment acceptAssignment(String assignmentId, Double demoSpeedMultiplier, Boolean fieldConfirmationRequired, String actorId, String actorRole) {
        Assignment assignment = resolveAssignment(assignmentId);
        Team team = teamRepository.findById(assignment.getTeamId()).orElse(null);

        // Authorization check
        validateTeamMembership(assignment, actorId, actorRole);

        // Idempotent check
        if (assignment.getStatus() == AssignmentStatus.ACCEPTED || "EN_ROUTE".equalsIgnoreCase(assignment.getLifecycleState())) {
            return assignment;
        }
        if (assignment.getStatus() == AssignmentStatus.DECLINED) {
            throw new IllegalStateException("Cannot accept assignment that has already been declined");
        }

        Incident incident = incidentRepository.findById(assignment.getIncidentId()).orElse(null);

        // Headcount calculation & allocation
        int headcount = 6;
        if (headcountService != null && incident != null) {
            headcount = headcountService.calculateRequiredHeadcount(incident);
            headcountService.allocatePersonnel(assignment.getTeamId(), headcount);
        }

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        assignment.setLifecycleState("EN_ROUTE");
        assignment.setAllocatedPersonnel(headcount);
        assignment.setFieldConfirmationRequired(Boolean.TRUE.equals(fieldConfirmationRequired));
        assignment.setTruckProgress(0.0);
        assignment.setTruckArrived(false);

        if (team != null) {
            assignment.setTruckLatitude(team.getCurrentLatitude());
            assignment.setTruckLongitude(team.getCurrentLongitude());
        }

        Assignment saved = assignmentRepository.save(assignment);
        broadcastAlertUpdate(saved);

        // Initialize Vehicle Track for real-pace navigation
        if (vehicleTrackingService != null && incident != null) {
            VehicleTrack track = vehicleTrackingService.initializeTrack(saved, incident, demoSpeedMultiplier != null ? demoSpeedMultiplier : 1.0);
            if (estimatesService != null) {
                estimatesService.computeAndSaveEstimate(incident, assignment.getTeamId(), track.getTotalDistanceKm());
            }
        }

        // Transition incident status to ACCEPTED
        if (incident != null) {
            incident.setAssignmentState(com.ameniedge.incidents.AssignmentState.ACCEPTED);
            incident.setAcceptedAt(java.time.Instant.now());
            incident.setMissionState(com.ameniedge.incidents.MissionState.EN_ROUTE);
            incident.setDispatchedAt(java.time.Instant.now());
            if (team != null) {
                incident.setAssignedTeamName(team.getName());
                incident.setDepartmentName(team.getName());
            }
            incidentRepository.save(incident);

            if (incident.getStatus() != IncidentStatus.ACCEPTED) {
                incidentService.transitionStatus(
                        assignment.getIncidentId(),
                        new IncidentStatusUpdate(IncidentStatus.ACCEPTED, "Mission accepted by assigned team. Headcount: " + headcount + " personnel deployed."),
                        actorId,
                        actorRole
                );
            }
        }

        return saved;
    }

    public Assignment declineAssignment(String assignmentId, String reason, String actorId, String actorRole) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("A specific reason is required to decline an emergency dispatch");
        }

        Assignment assignment = resolveAssignment(assignmentId);
        Team team = teamRepository.findById(assignment.getTeamId()).orElse(null);

        // Authorization check
        validateTeamMembership(assignment, actorId, actorRole);

        // Idempotent check
        if (assignment.getStatus() == AssignmentStatus.DECLINED) {
            return assignment;
        }
        if (assignment.getStatus() == AssignmentStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot decline an assignment that has already been accepted and is active");
        }

        assignment.setStatus(AssignmentStatus.DECLINED);
        assignment.setLifecycleState("DECLINED");
        assignment.setDeclineReason(reason.trim());
        assignment.setTruckArrived(false);
        assignment.setTruckProgress(0.0);

        if (headcountService != null && assignment.getAllocatedPersonnel() > 0) {
            headcountService.releaseAllocation(assignment.getTeamId(), assignment.getAllocatedPersonnel());
            assignment.setAllocatedPersonnel(0);
        }

        Assignment saved = assignmentRepository.save(assignment);
        broadcastAlertUpdate(saved);

        // Return incident to TRIAGED state so leader or auto-router can reassign
        Incident incident = incidentRepository.findById(assignment.getIncidentId()).orElse(null);
        if (incident != null) {
            incident.setAssignmentState(com.ameniedge.incidents.AssignmentState.DECLINED);
            incident.setDeclineReason(reason.trim());
            incident.setMissionState(com.ameniedge.incidents.MissionState.WAITING);
            incident.setAssignedTeamId(null);
            incident.setAcceptedAt(null);
            incident.setDispatchedAt(null);
            incident.setQueueStatus("PENDING");
            incidentRepository.save(incident);

            incidentService.transitionStatus(
                    assignment.getIncidentId(),
                    new IncidentStatusUpdate(IncidentStatus.TRIAGED, "Assignment declined: " + reason.trim() + ". Returned to triage queue."),
                    actorId,
                    actorRole
            );
        }

        // Revert team status
        if (team != null) {
            team.setActiveIncidentCount(Math.max(0, team.getActiveIncidentCount() - 1));
            if (team.getActiveIncidentCount() == 0) {
                team.setStatus(TeamStatus.AVAILABLE);
            }
            teamRepository.save(team);
        }

        return saved;
    }

    public Assignment reportProblem(String assignmentId, String reason, String actorId, String actorRole) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("A specific reason is required to report an operational problem");
        }
        Assignment assignment = resolveAssignment(assignmentId);
        validateTeamMembership(assignment, actorId, actorRole);

        assignment.setProblemReason(reason.trim());
        Assignment saved = assignmentRepository.save(assignment);
        broadcastAlertUpdate(saved);

        incidentService.transitionStatus(
                assignment.getIncidentId(),
                new IncidentStatusUpdate(IncidentStatus.ON_SITE, "Problem reported by team: " + reason.trim()),
                actorId,
                actorRole
        );

        return saved;
    }

    public Assignment extendWorkTime(String assignmentId, int additionalSeconds, String actorId, String actorRole) {
        Assignment assignment = resolveAssignment(assignmentId);
        validateTeamMembership(assignment, actorId, actorRole);

        assignment.setWorkExtendedSeconds(assignment.getWorkExtendedSeconds() + Math.max(30, additionalSeconds));
        return assignmentRepository.save(assignment);
    }

    public Assignment updateTelemetry(String assignmentId, TruckTelemetryUpdate update) {
        Assignment assignment = resolveAssignment(assignmentId);

        if (update.getLatitude() != null) assignment.setTruckLatitude(update.getLatitude());
        if (update.getLongitude() != null) assignment.setTruckLongitude(update.getLongitude());
        if (update.getProgress() != null) assignment.setTruckProgress(Math.min(1.0, Math.max(0.0, update.getProgress())));

        boolean arrived = Boolean.TRUE.equals(update.getArrived()) || (assignment.getTruckProgress() != null && assignment.getTruckProgress() >= 0.98);
        if (arrived) {
            assignment.setTruckArrived(true);
            assignment.setTruckProgress(1.0);
            assignment.setLifecycleState("ON_SITE");

            Incident incident = incidentRepository.findById(assignment.getIncidentId()).orElse(null);
            if (incident != null && (incident.getStatus() == IncidentStatus.ACCEPTED || incident.getStatus() == IncidentStatus.EN_ROUTE)) {
                try {
                    if (incident.getStatus() == IncidentStatus.ACCEPTED) {
                        incidentService.transitionStatus(incident.getId(), new IncidentStatusUpdate(IncidentStatus.EN_ROUTE, "Truck departed base"), "SYSTEM", "SYSTEM");
                    }
                    incidentService.transitionStatus(incident.getId(), new IncidentStatusUpdate(IncidentStatus.ON_SITE, "Truck arrived at incident location"), "SYSTEM", "SYSTEM");
                    incident.setStatus(IncidentStatus.ON_SITE);
                    incident.setWorkStartedAt(Instant.now());
                    incidentRepository.save(incident);
                } catch (Exception ignored) {}
            }
        }

        return assignmentRepository.save(assignment);
    }

    public Assignment resolveAssignment(String assignmentId, String outcomeNote, String actorId, String actorRole) {
        if (outcomeNote == null || outcomeNote.trim().isEmpty()) {
            throw new IllegalArgumentException("An outcome note is required to finalize and resolve the mission");
        }

        Assignment assignment = resolveAssignment(assignmentId);
        validateTeamMembership(assignment, actorId, actorRole);

        if (!Boolean.TRUE.equals(assignment.getTruckArrived())) {
            throw new ArrivalGateException("Cannot resolve assignment before truck has arrived at the incident location");
        }

        assignment.setStatus(AssignmentStatus.COMPLETED);
        assignment.setLifecycleState("RESOLVED");
        assignment.setOutcomeNote(outcomeNote.trim());
        Assignment saved = assignmentRepository.save(assignment);
        broadcastAlertUpdate(saved);

        if (headcountService != null && assignment.getAllocatedPersonnel() > 0) {
            headcountService.startReturn(assignment.getTeamId(), assignment.getAllocatedPersonnel());
        }

        Incident incident = incidentRepository.findById(assignment.getIncidentId()).orElse(null);
        if (incident != null) {
            incident.setStatus(IncidentStatus.RESOLVED);
            incident.setMissionState(com.ameniedge.incidents.MissionState.RESOLVED);
            incident.setResolvedAt(Instant.now());
            incident.setWorkCompletedAt(Instant.now());
            incident.setQueueStatus("COMPLETED");
            incidentRepository.save(incident);

            incidentService.transitionStatus(
                    assignment.getIncidentId(),
                    new IncidentStatusUpdate(IncidentStatus.RESOLVED, outcomeNote.trim()),
                    actorId,
                    actorRole
            );
        }

        teamRepository.findById(assignment.getTeamId()).ifPresent(team -> {
            team.setActiveIncidentCount(Math.max(0, team.getActiveIncidentCount() - 1));
            if (team.getActiveIncidentCount() == 0) {
                team.setStatus(TeamStatus.AVAILABLE);
            }
            teamRepository.save(team);
        });

        return saved;
    }

    @Transactional(readOnly = true)
    public List<AlertResponse> getRescueAlerts(String teamId, String stationId, String statusFilter) {
        List<Incident> allIncidents = incidentRepository.findAll();
        List<AlertResponse> alerts = new ArrayList<>();

        for (Incident inc : allIncidents) {
            // Apply priority score if not computed
            if (inc.getPriorityScore() == null && priorityScoringService != null) {
                PriorityScoringService.ScoreResult sr = priorityScoringService.calculateScore(inc);
                inc.setPriorityScore(sr.getScore());
                inc.setScoreExplanation(sr.getExplanation());
                inc.setPriority(sr.getPriority());
            }

            // Find matching assignment
            Optional<Assignment> optAsn = assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(inc.getId());
            Assignment asn = optAsn.orElse(null);

            // Filtering logic
            if (teamId != null && !teamId.isBlank()) {
                // If team declined the mission, do not show in active alerts queue unless explicitly querying COMPLETED/DECLINED
                if (asn != null && asn.getStatus() == AssignmentStatus.DECLINED && !"COMPLETED".equalsIgnoreCase(statusFilter) && !"DECLINED".equalsIgnoreCase(statusFilter)) {
                    continue;
                }
                boolean matchesAssigned = inc.getAssignedTeamId() != null && inc.getAssignedTeamId().equalsIgnoreCase(teamId);
                boolean matchesAsn = asn != null && asn.getTeamId() != null && asn.getTeamId().equalsIgnoreCase(teamId);
                if (!matchesAssigned && !matchesAsn) {
                    continue;
                }
            }

            if (stationId != null && !stationId.isBlank()) {
                boolean matchesStation = stationId.equalsIgnoreCase(inc.getStationId()) ||
                        (asn != null && stationId.equalsIgnoreCase(asn.getStationId()));
                if (!matchesStation) {
                    continue;
                }
            }

            if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
                if ("PENDING".equalsIgnoreCase(statusFilter) && asn != null && asn.getStatus() != AssignmentStatus.PENDING_ACK) {
                    continue;
                }
                if ("ACTIVE".equalsIgnoreCase(statusFilter) && (asn == null || (asn.getStatus() != AssignmentStatus.ACCEPTED && !"ON_SITE".equalsIgnoreCase(asn.getLifecycleState())))) {
                    continue;
                }
                if ("COMPLETED".equalsIgnoreCase(statusFilter) && (asn == null || (asn.getStatus() != AssignmentStatus.COMPLETED && asn.getStatus() != AssignmentStatus.DECLINED))) {
                    continue;
                }
            }

            // Resolve station name and distance
            String stationName = "North Station - Anna Nagar";
            Double stLat = 13.0827;
            Double stLng = 80.2707;
            if (stationRepository != null) {
                Optional<Station> stOpt = stationRepository.findById(inc.getStationId());
                if (stOpt.isPresent()) {
                    stationName = stOpt.get().getName();
                    stLat = stOpt.get().getLatitude();
                    stLng = stOpt.get().getLongitude();
                }
            } else if ("STA-CHN-S-002".equalsIgnoreCase(inc.getStationId())) {
                stationName = "South Station - Tambaram";
                stLat = 13.0360;
                stLng = 80.2675;
            }

            String departmentName = "Rescue Team";
            String effTeamId = inc.getAssignedTeamId() != null ? inc.getAssignedTeamId() : (asn != null ? asn.getTeamId() : null);
            if (teamRepository != null && effTeamId != null) {
                departmentName = teamRepository.findById(effTeamId)
                        .map(Team::getName)
                        .orElse(departmentName);
            }

            Double distanceKm = null;
            if (inc.getLatitude() != null && inc.getLongitude() != null && stLat != null && stLng != null) {
                distanceKm = calculateDistanceKm(inc.getLatitude(), inc.getLongitude(), stLat, stLng);
            }

            alerts.add(AlertResponse.from(inc, asn, stationName, departmentName, distanceKm));
        }

        // Sort priority score descending
        alerts.sort((a, b) -> Double.compare(b.getPriorityScore(), a.getPriorityScore()));
        return alerts;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((R * c) * 10.0) / 10.0;
    }

    public List<Assignment> getAssignments(String teamId, String statusStr, String incidentId) {
        if (incidentId != null && !incidentId.isBlank()) {
            return assignmentRepository.findByIncidentId(incidentId);
        }

        if (teamId != null && !teamId.isBlank()) {
            if (statusStr != null && !statusStr.isBlank()) {
                try {
                    AssignmentStatus status = AssignmentStatus.valueOf(statusStr.toUpperCase());
                    return assignmentRepository.findByTeamIdAndStatus(teamId, status);
                } catch (IllegalArgumentException e) {
                    return assignmentRepository.findByTeamId(teamId);
                }
            }
            return assignmentRepository.findByTeamId(teamId);
        }

        if (statusStr != null && !statusStr.isBlank()) {
            try {
                AssignmentStatus status = AssignmentStatus.valueOf(statusStr.toUpperCase());
                return assignmentRepository.findByStatus(status);
            } catch (IllegalArgumentException ignored) {}
        }

        return assignmentRepository.findAll();
    }

    public Assignment getActiveAssignmentForTeam(String teamId) {
        if (teamId == null || teamId.isBlank()) {
            return null;
        }

        List<Assignment> accepted = assignmentRepository.findByTeamIdAndStatus(teamId, AssignmentStatus.ACCEPTED);
        if (!accepted.isEmpty()) return accepted.get(0);

        List<Assignment> pending = assignmentRepository.findByTeamIdAndStatus(teamId, AssignmentStatus.PENDING_ACK);
        if (!pending.isEmpty()) return pending.get(0);

        return null;
    }

    public Assignment resolveAssignment(String identifier) {
        Optional<Assignment> opt = assignmentRepository.findById(identifier);
        if (opt.isPresent()) return opt.get();

        Optional<Assignment> optByInc = assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(identifier);
        if (optByInc.isPresent()) return optByInc.get();

        throw new IllegalArgumentException("Assignment not found for identifier: " + identifier);
    }

    private void validateTeamMembership(Assignment assignment, String actorId, String actorRole) {
        if (actorRole == null) return;
        if (actorRole.contains("ADMIN") || actorRole.contains("SUPERVISOR") || actorRole.contains("LEADER") || "SYSTEM".equalsIgnoreCase(actorRole)) {
            return;
        }

        if (actorId != null && userRepository != null) {
            Optional<User> userOpt = userRepository.findById(actorId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getRole() == Role.STATION_LEADER || user.getRole() == Role.REGIONAL_SUPERVISOR || user.getRole() == Role.ORG_ADMIN) {
                    return;
                }
                if (user.getTeamId() == null || !user.getTeamId().equalsIgnoreCase(assignment.getTeamId())) {
                    throw new AccessDeniedException("User is not authorized to act on behalf of this rescue team");
                }
            }
        }
    }
}
