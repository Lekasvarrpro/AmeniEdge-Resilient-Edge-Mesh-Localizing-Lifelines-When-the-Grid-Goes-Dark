package com.ameniedge.incidents;

import com.ameniedge.assignments.AssignmentRepository;
import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.rescuefit.RescueFitEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentLifecycleTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository eventRepository;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private TeamRepository teamRepository;

    private RescueFitEngine rescueFitEngine;
    private IncidentService incidentService;

    @BeforeEach
    void setUp() {
        rescueFitEngine = new RescueFitEngine(teamRepository);
        incidentService = new IncidentService(incidentRepository, eventRepository, assignmentRepository, teamRepository, rescueFitEngine, "STA-CHN-N-001");
    }

    @Test
    @DisplayName("Create incident with clientReferenceId ensures idempotency")
    void createIncidentIdempotency() {
        String clientRef = "uuid-client-12345";
        Incident existing = new Incident();
        existing.setId("INC-EXISTING");
        existing.setClientReferenceId(clientRef);

        when(incidentRepository.findByClientReferenceId(clientRef)).thenReturn(Optional.of(existing));

        CreateIncidentRequest req = new CreateIncidentRequest();
        req.setClientReferenceId(clientRef);
        req.setCategory(IncidentCategory.FLOOD);
        req.setAffectedPeople(3);

        Incident result = incidentService.createIncident(req, "CITIZEN-01", "CITIZEN");
        assertThat(result.getId()).isEqualTo("INC-EXISTING");
    }

    @Test
    @DisplayName("Valid incident lifecycle transitions: RECEIVED -> TRIAGED -> ASSIGNED -> ACCEPTED -> EN_ROUTE -> ON_SITE -> RESOLVED -> CLOSED")
    void validLifecycleTransitions() {
        incidentService.validateTransition(IncidentStatus.RECEIVED, IncidentStatus.TRIAGED);
        incidentService.validateTransition(IncidentStatus.TRIAGED, IncidentStatus.ASSIGNED);
        incidentService.validateTransition(IncidentStatus.ASSIGNED, IncidentStatus.ACCEPTED);
        incidentService.validateTransition(IncidentStatus.ACCEPTED, IncidentStatus.EN_ROUTE);
        incidentService.validateTransition(IncidentStatus.EN_ROUTE, IncidentStatus.ON_SITE);
        incidentService.validateTransition(IncidentStatus.ON_SITE, IncidentStatus.RESOLVED);
        incidentService.validateTransition(IncidentStatus.RESOLVED, IncidentStatus.CLOSED);
    }

    @Test
    @DisplayName("Invalid state skip throws IllegalStateException")
    void invalidLifecycleTransitions() {
        assertThatThrownBy(() -> incidentService.validateTransition(IncidentStatus.RECEIVED, IncidentStatus.ON_SITE))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid incident status transition");

        assertThatThrownBy(() -> incidentService.validateTransition(IncidentStatus.EN_ROUTE, IncidentStatus.CLOSED))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    @DisplayName("getReportTracker returns granular decoupled states without premature acceptance")
    void reportTrackerDecoupledStates() {
        Incident incident = new Incident();
        incident.setId("INC-9999");
        incident.setCategory(IncidentCategory.FLOOD);
        incident.setDeliveryState(DeliveryState.RECEIVED_BY_STATION);
        incident.setAssignmentState(AssignmentState.OFFERED);
        incident.setMissionState(MissionState.WAITING);
        incident.setSyncState(SyncState.SYNCED);
        incident.setStationName("South Station Base");
        incident.setDepartmentName("Flood Rescue Department");

        when(incidentRepository.findById("INC-9999")).thenReturn(Optional.of(incident));

        com.ameniedge.incidents.dto.ReportTrackerDto tracker = incidentService.getReportTracker("INC-9999");
        assertThat(tracker.getDeliveryState()).isEqualTo(DeliveryState.RECEIVED_BY_STATION);
        assertThat(tracker.getAssignmentState()).isEqualTo(AssignmentState.OFFERED);
        assertThat(tracker.getMissionState()).isEqualTo(MissionState.WAITING);
        assertThat(tracker.getSyncState()).isEqualTo(SyncState.SYNCED);
        assertThat(tracker.getAcceptedAt()).isNull();
        assertThat(tracker.getResolvedAt()).isNull();
    }
}
