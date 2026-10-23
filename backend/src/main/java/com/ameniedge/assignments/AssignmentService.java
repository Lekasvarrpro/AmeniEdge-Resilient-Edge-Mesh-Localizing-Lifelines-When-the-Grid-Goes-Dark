package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentService;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Random;

@Service
@Transactional
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentService incidentService;
    private final TeamRepository teamRepository;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            IncidentRepository incidentRepository,
            IncidentService incidentService,
            TeamRepository teamRepository) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
        this.incidentService = incidentService;
        this.teamRepository = teamRepository;
    }

    public Assignment createAssignment(String incidentId, String teamId, String notes, String actorId, String actorRole) {
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("Team not found: " + teamId));

        Assignment assignment = new Assignment();
        assignment.setId("ASN-" + (10000 + new Random().nextInt(90000)));
        assignment.setIncidentId(incidentId);
        assignment.setTeamId(teamId);
        assignment.setStationId(incident.getStationId());
        assignment.setStatus(AssignmentStatus.PENDING_ACK);
        assignment.setNotes(notes);

        Assignment saved = assignmentRepository.save(assignment);

        // Update incident status and reference
        incident.setAssignedTeamId(teamId);
        incidentRepository.save(incident);
        incidentService.transitionStatus(incidentId, new IncidentStatusUpdate(IncidentStatus.ASSIGNED, "Assigned to " + team.getName()), actorId, actorRole);

        // Update team status
        team.setStatus(TeamStatus.BUSY);
        team.setActiveIncidentCount(team.getActiveIncidentCount() + 1);
        teamRepository.save(team);

        return saved;
    }

    public Assignment acceptAssignment(String assignmentId, String actorId, String actorRole) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        assignment.setStatus(AssignmentStatus.ACCEPTED);
        Assignment saved = assignmentRepository.save(assignment);

        incidentService.transitionStatus(
                assignment.getIncidentId(),
                new IncidentStatusUpdate(IncidentStatus.ACCEPTED, "Mission accepted by assigned team"),
                actorId,
                actorRole
        );

        return saved;
    }

    public Assignment declineAssignment(String assignmentId, String reason, String actorId, String actorRole) {
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("A specific reason is required to decline an emergency dispatch");
        }

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Assignment not found: " + assignmentId));

        assignment.setStatus(AssignmentStatus.DECLINED);
        assignment.setDeclineReason(reason);
        Assignment saved = assignmentRepository.save(assignment);

        // Return incident to TRIAGED state so leader can reassign
        Incident incident = incidentRepository.findById(assignment.getIncidentId()).orElse(null);
        if (incident != null) {
            incident.setAssignedTeamId(null);
            incidentRepository.save(incident);
        }

        incidentService.transitionStatus(
                assignment.getIncidentId(),
                new IncidentStatusUpdate(IncidentStatus.TRIAGED, "Assignment declined: " + reason + ". Returned to triage queue."),
                actorId,
                actorRole
        );

        // Revert team status if needed
        teamRepository.findById(assignment.getTeamId()).ifPresent(team -> {
            team.setActiveIncidentCount(Math.max(0, team.getActiveIncidentCount() - 1));
            if (team.getActiveIncidentCount() == 0) {
                team.setStatus(TeamStatus.AVAILABLE);
            }
            teamRepository.save(team);
        });

        return saved;
    }
}
