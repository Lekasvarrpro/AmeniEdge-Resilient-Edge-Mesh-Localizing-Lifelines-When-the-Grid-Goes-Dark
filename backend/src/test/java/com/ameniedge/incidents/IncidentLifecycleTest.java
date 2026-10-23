package com.ameniedge.incidents;

import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IncidentLifecycleTest {

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository eventRepository;

    private IncidentService incidentService;

    @BeforeEach
    void setUp() {
        incidentService = new IncidentService(incidentRepository, eventRepository, "STA-CHN-N-001");
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
}
