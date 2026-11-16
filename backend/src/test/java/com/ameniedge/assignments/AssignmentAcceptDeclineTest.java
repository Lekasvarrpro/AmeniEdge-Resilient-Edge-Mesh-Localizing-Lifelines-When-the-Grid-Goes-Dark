package com.ameniedge.assignments;

import com.ameniedge.incidents.*;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.users.Role;
import com.ameniedge.users.User;
import com.ameniedge.users.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AssignmentAcceptDeclineTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository eventRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    private com.ameniedge.rescuefit.RescueFitEngine rescueFitEngine;
    private IncidentService incidentService;
    private AssignmentService assignmentService;

    private Assignment sampleAssignment;
    private Incident sampleIncident;
    private Team sampleTeam;

    @BeforeEach
    void setUp() {
        rescueFitEngine = new com.ameniedge.rescuefit.RescueFitEngine(teamRepository);
        incidentService = new IncidentService(incidentRepository, eventRepository, assignmentRepository, teamRepository, rescueFitEngine, "STA-CHN-N-001");

        assignmentService = new AssignmentService(
                assignmentRepository,
                incidentRepository,
                incidentService,
                teamRepository,
                userRepository
        );

        sampleIncident = new Incident();
        sampleIncident.setId("INC-1004");
        sampleIncident.setStatus(IncidentStatus.ASSIGNED);
        sampleIncident.setAssignedTeamId("TEAM-CHN-N-001");
        sampleIncident.setStationId("STA-CHN-N-001");

        sampleTeam = new Team();
        sampleTeam.setId("TEAM-CHN-N-001");
        sampleTeam.setName("Swift Water Alpha");
        sampleTeam.setLeaderId("USR-RSC-001");
        sampleTeam.setStationId("STA-CHN-N-001");
        sampleTeam.setStatus(TeamStatus.BUSY);
        sampleTeam.setActiveIncidentCount(1);

        sampleAssignment = new Assignment();
        sampleAssignment.setId("ASN-1004");
        sampleAssignment.setIncidentId("INC-1004");
        sampleAssignment.setTeamId("TEAM-CHN-N-001");
        sampleAssignment.setStationId("STA-CHN-N-001");
        sampleAssignment.setStatus(AssignmentStatus.PENDING_ACK);
    }

    @Test
    @DisplayName("Accept assignment transitions assignment and incident to ACCEPTED")
    void testAcceptAssignmentSuccess() {
        when(assignmentRepository.findById("ASN-1004")).thenReturn(Optional.of(sampleAssignment));
        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(i -> i.getArgument(0));
        when(incidentRepository.findById("INC-1004")).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));
        when(teamRepository.findById("TEAM-CHN-N-001")).thenReturn(Optional.of(sampleTeam));

        Assignment accepted = assignmentService.acceptAssignment("ASN-1004", "USR-RSC-001", "RESCUE_MEMBER");

        assertThat(accepted.getStatus()).isEqualTo(AssignmentStatus.ACCEPTED);
        assertThat(sampleIncident.getStatus()).isEqualTo(IncidentStatus.ACCEPTED);
    }

    @Test
    @DisplayName("Decline assignment with valid reason transitions to DECLINED and returns incident to TRIAGED")
    void testDeclineAssignmentWithReasonSuccess() {
        when(assignmentRepository.findById("ASN-1004")).thenReturn(Optional.of(sampleAssignment));
        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(i -> i.getArgument(0));
        when(incidentRepository.findById("INC-1004")).thenReturn(Optional.of(sampleIncident));
        when(incidentRepository.save(any(Incident.class))).thenAnswer(i -> i.getArgument(0));
        when(teamRepository.findById("TEAM-CHN-N-001")).thenReturn(Optional.of(sampleTeam));

        Assignment declined = assignmentService.declineAssignment("ASN-1004", "Too far: bridge impassable", "USR-RSC-001", "RESCUE_MEMBER");

        assertThat(declined.getStatus()).isEqualTo(AssignmentStatus.DECLINED);
        assertThat(declined.getDeclineReason()).isEqualTo("Too far: bridge impassable");
        assertThat(sampleIncident.getStatus()).isEqualTo(IncidentStatus.TRIAGED);
        assertThat(sampleIncident.getAssignedTeamId()).isNull();
    }

    @Test
    @DisplayName("Decline assignment without reason throws IllegalArgumentException")
    void testDeclineAssignmentWithoutReasonThrowsException() {
        assertThatThrownBy(() -> assignmentService.declineAssignment("ASN-1004", "   ", "USR-RSC-001", "RESCUE_MEMBER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason is required");

        assertThatThrownBy(() -> assignmentService.declineAssignment("ASN-1004", null, "USR-RSC-001", "RESCUE_MEMBER"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reason is required");
    }

    @Test
    @DisplayName("Decline assignment by non-member throws AccessDeniedException (403)")
    void testDeclineAssignmentByNonMemberThrowsForbidden() {
        when(assignmentRepository.findById("ASN-1004")).thenReturn(Optional.of(sampleAssignment));
        when(teamRepository.findById("TEAM-CHN-N-001")).thenReturn(Optional.of(sampleTeam));
        User nonMember = new User("USR-STRANGER-999", "stranger", "hash", "Unknown Person", Role.CITIZEN, null);
        when(userRepository.findById("USR-STRANGER-999")).thenReturn(Optional.of(nonMember));

        assertThatThrownBy(() -> assignmentService.declineAssignment("ASN-1004", "Unsafe conditions", "USR-STRANGER-999", "CITIZEN"))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("not authorized");
    }

    @Test
    @DisplayName("Repeated decline on an already-declined assignment is idempotent and succeeds")
    void testRepeatedDeclineIsIdempotent() {
        sampleAssignment.setStatus(AssignmentStatus.DECLINED);
        sampleAssignment.setDeclineReason("Previous decline note");

        when(assignmentRepository.findById("ASN-1004")).thenReturn(Optional.of(sampleAssignment));
        when(teamRepository.findById("TEAM-CHN-N-001")).thenReturn(Optional.of(sampleTeam));

        Assignment result = assignmentService.declineAssignment("ASN-1004", "Repeated decline", "USR-RSC-001", "RESCUE_MEMBER");

        assertThat(result.getStatus()).isEqualTo(AssignmentStatus.DECLINED);
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Repeated accept on an already-accepted assignment is idempotent and succeeds")
    void testRepeatedAcceptIsIdempotent() {
        sampleAssignment.setStatus(AssignmentStatus.ACCEPTED);

        when(assignmentRepository.findById("ASN-1004")).thenReturn(Optional.of(sampleAssignment));
        when(teamRepository.findById("TEAM-CHN-N-001")).thenReturn(Optional.of(sampleTeam));

        Assignment result = assignmentService.acceptAssignment("ASN-1004", "USR-RSC-001", "RESCUE_MEMBER");

        assertThat(result.getStatus()).isEqualTo(AssignmentStatus.ACCEPTED);
        verify(assignmentRepository, never()).save(any());
    }
}

