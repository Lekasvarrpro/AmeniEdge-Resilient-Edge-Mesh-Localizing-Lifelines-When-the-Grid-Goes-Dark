package com.ameniedge.incidents;

import com.ameniedge.assignments.Assignment;
import com.ameniedge.assignments.AssignmentRepository;
import com.ameniedge.assignments.AssignmentService;
import com.ameniedge.assignments.dto.AlertResponse;
import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.organization.Station;
import com.ameniedge.organization.StationRepository;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.rescuefit.RescueFitEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class Problem1DiagnosticTest {

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
    private AssignmentService assignmentService;

    private List<Team> teamsList;
    private List<Incident> incidentsList;
    private List<Assignment> assignmentsList;

    @BeforeEach
    void setUp() {
        teamsList = new ArrayList<>();
        incidentsList = new ArrayList<>();
        assignmentsList = new ArrayList<>();

        // Setup Station North teams
        Team northFlood = new Team("TEAM-CHN-N-001", "Flood Rescue Team", "STA-CHN-N-001", null, TeamStatus.AVAILABLE,
                "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION", "INFLATABLE_ZODIAC_BOAT", 13.0827, 80.2707);
        Team northFire = new Team("TEAM-CHN-N-002", "Fire Response Team", "STA-CHN-N-001", null, TeamStatus.AVAILABLE,
                "FIRE,FIRE_SUPPRESSION", "FIRE_ENGINE", 13.0827, 80.2707);
        Team northMedical = new Team("TEAM-CHN-N-003", "Emergency Medical Team", "STA-CHN-N-001", null, TeamStatus.AVAILABLE,
                "MEDICAL,TRIAGE,TRAUMA_CARE", "AMBULANCE", 13.0827, 80.2707);
        Team northSar = new Team("TEAM-CHN-N-004", "Search & Rescue Team", "STA-CHN-N-001", null, TeamStatus.AVAILABLE,
                "TRAPPED,MISSING,STRUCTURAL_SEARCH", "HYDRAULIC_CUTTERS", 13.0827, 80.2707);

        Team southFlood = new Team("TEAM-CHN-S-001", "Flood Rescue Team", "STA-CHN-S-002", null, TeamStatus.AVAILABLE,
                "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION", "MOTORIZED_DINGHY", 13.0360, 80.2675);
        Team southMedical = new Team("TEAM-CHN-S-002", "Emergency Medical Team", "STA-CHN-S-002", null, TeamStatus.AVAILABLE,
                "MEDICAL,TRIAGE,TRAUMA_CARE", "AMBULANCE", 13.0360, 80.2675);
        Team southFire = new Team("TEAM-CHN-S-003", "Fire Response Team", "STA-CHN-S-002", null, TeamStatus.AVAILABLE,
                "FIRE,FIRE_SUPPRESSION", "FIRE_ENGINE", 13.0360, 80.2675);
        Team southSar = new Team("TEAM-CHN-S-004", "Search & Rescue Team", "STA-CHN-S-002", null, TeamStatus.AVAILABLE,
                "TRAPPED,MISSING,STRUCTURAL_SEARCH", "HYDRAULIC_CUTTERS", 13.0360, 80.2675);

        teamsList.add(northFlood);
        teamsList.add(northFire);
        teamsList.add(northMedical);
        teamsList.add(northSar);
        teamsList.add(southFlood);
        teamsList.add(southMedical);
        teamsList.add(southFire);
        teamsList.add(southSar);

        when(teamRepository.findAll()).thenReturn(teamsList);
        when(teamRepository.findById(anyString())).thenAnswer(inv -> {
            String id = inv.getArgument(0);
            return teamsList.stream().filter(t -> t.getId().equals(id)).findFirst();
        });

        when(incidentRepository.save(any(Incident.class))).thenAnswer(inv -> {
            Incident inc = inv.getArgument(0);
            incidentsList.removeIf(i -> i.getId().equals(inc.getId()));
            incidentsList.add(inc);
            return inc;
        });
        when(incidentRepository.findAll()).thenReturn(incidentsList);
        when(incidentRepository.findById(anyString())).thenAnswer(inv -> {
            String id = inv.getArgument(0);
            return incidentsList.stream().filter(i -> i.getId().equals(id)).findFirst();
        });

        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(inv -> {
            Assignment asn = inv.getArgument(0);
            assignmentsList.removeIf(a -> a.getId().equals(asn.getId()));
            assignmentsList.add(asn);
            return asn;
        });
        when(assignmentRepository.findAll()).thenReturn(assignmentsList);
        when(assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(anyString())).thenAnswer(inv -> {
            String incId = inv.getArgument(0);
            return assignmentsList.stream().filter(a -> a.getIncidentId().equals(incId)).findFirst();
        });

        Station northStation = new Station("STA-CHN-N-001", "North Station - Anna Nagar", "REG-CHN-01", 13.0827, 80.2707, 6000);
        Station southStation = new Station("STA-CHN-S-002", "South Station - Tambaram", "REG-CHN-01", 13.0360, 80.2675, 6000);
        List<Station> stationsList = List.of(northStation, southStation);

        StationRepository mockStationRepo = mock(StationRepository.class);
        when(mockStationRepo.findAll()).thenReturn(stationsList);
        when(mockStationRepo.findById("STA-CHN-N-001")).thenReturn(Optional.of(northStation));
        when(mockStationRepo.findById("STA-CHN-S-002")).thenReturn(Optional.of(southStation));

        rescueFitEngine = new RescueFitEngine(teamRepository);
        incidentService = new IncidentService(incidentRepository, eventRepository, assignmentRepository, teamRepository, rescueFitEngine, "STA-CHN-N-001");
        incidentService.setStationRepository(mockStationRepo);

        assignmentService = new AssignmentService(assignmentRepository, incidentRepository, incidentService, teamRepository, null);
        assignmentService.setStationRepository(mockStationRepo);
    }

    @Test
    @DisplayName("Diagnose Problem 1: Trace citizen Flood submission and routing visibility")
    void testCitizenFloodSubmissionRouting() {
        System.out.println("=== DIAGNOSING PROBLEM 1 ===");

        // Simulate citizen submitting Flood report near South Station (Tambaram/Mylapore: 13.0360, 80.2675)
        CreateIncidentRequest req = new CreateIncidentRequest();
        req.setCategory(IncidentCategory.FLOOD);
        req.setLatitude(13.0360);
        req.setLongitude(80.2675);
        req.setLocationLandmark("Near Tambaram Station");
        req.setContactName("Diagnostic Citizen");
        req.setContactPhone("+91-98400-99999");
        req.setAffectedPeople(3);
        req.setHasImmediateDanger(true);

        Incident created = incidentService.createIncident(req, "CITIZEN_DIAGNOSTIC", "CITIZEN");
        System.out.println("\n[1] Incident Created: ID=" + created.getId() +
                ", Category=" + created.getCategory() +
                ", Status=" + created.getStatus() +
                ", StationId=" + created.getStationId() +
                ", AssignedTeamId=" + created.getAssignedTeamId());

        System.out.println("\n[2] Assignment Rows Found: " + assignmentsList.size());
        for (Assignment a : assignmentsList) {
            System.out.println("ASSIGNMENT: ID=" + a.getId() +
                    ", TeamId=" + a.getTeamId() +
                    ", StationId=" + a.getStationId() +
                    ", Status=" + a.getStatus() +
                    ", Lifecycle=" + a.getLifecycleState() +
                    ", Notes=" + a.getNotes());
        }

        // Check visibility for flood.south (teamId: TEAM-CHN-S-001, stationId: STA-CHN-S-002)
        List<AlertResponse> southAlerts = assignmentService.getRescueAlerts("TEAM-CHN-S-001", "STA-CHN-S-002", null);
        System.out.println("\n[3] Alerts visible to flood.south (TEAM-CHN-S-001 @ STA-CHN-S-002): count=" + southAlerts.size());
        for (AlertResponse r : southAlerts) {
            System.out.println(" - Visible Alert: " + r.getIncidentId() + " (Team: " + r.getTeamId() + ", Station: " + r.getStationId() + ")");
        }

        // Check visibility for flood.north (teamId: TEAM-CHN-N-001, stationId: STA-CHN-N-001)
        List<AlertResponse> northAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-001", "STA-CHN-N-001", null);
        System.out.println("\n[4] Alerts visible to flood.north (TEAM-CHN-N-001 @ STA-CHN-N-001): count=" + northAlerts.size());
        for (AlertResponse r : northAlerts) {
            System.out.println(" - Visible Alert: " + r.getIncidentId() + " (Team: " + r.getTeamId() + ", Station: " + r.getStationId() + ")");
        }

        System.out.println("=== END DIAGNOSIS ===\n");
    }

    @Test
    @DisplayName("Verify Fire SOS isolation: Fire team receives alert, Flood and SAR teams do not")
    void testFireSOSRoutingIsolation() {
        CreateIncidentRequest fireReq = new CreateIncidentRequest();
        fireReq.setCategory(IncidentCategory.FIRE);
        fireReq.setLatitude(13.0827); // North Station vicinity
        fireReq.setLongitude(80.2707);
        fireReq.setLocationLandmark("Anna Nagar Fire Ground");
        fireReq.setContactName("Fire Caller");
        fireReq.setContactPhone("+91-98401-22222");
        fireReq.setAffectedPeople(4);

        Incident fireIncident = incidentService.createIncident(fireReq, "CITIZEN_FIRE", "CITIZEN");
        assertThat(fireIncident.getCategory()).isEqualTo(IncidentCategory.FIRE);
        assertThat(fireIncident.getAssignedTeamId()).isEqualTo("TEAM-CHN-N-002"); // North Fire Response

        // Fire login queries alerts for TEAM-CHN-N-002
        List<AlertResponse> fireAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-002", "STA-CHN-N-001", null);
        assertThat(fireAlerts).isNotEmpty();
        assertThat(fireAlerts.get(0).getIncidentId()).isEqualTo(fireIncident.getId());

        // Flood login queries alerts for TEAM-CHN-N-001 - MUST BE EMPTY
        List<AlertResponse> floodAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-001", "STA-CHN-N-001", null);
        assertThat(floodAlerts.stream().noneMatch(a -> a.getIncidentId().equals(fireIncident.getId()))).isTrue();

        // SAR login queries alerts for TEAM-CHN-N-004 - MUST BE EMPTY
        List<AlertResponse> sarAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-004", "STA-CHN-N-001", null);
        assertThat(sarAlerts.stream().noneMatch(a -> a.getIncidentId().equals(fireIncident.getId()))).isTrue();
    }

    @Test
    @DisplayName("Verify Medical SOS isolation: Medical team receives alert, other teams do not")
    void testMedicalSOSRoutingIsolation() {
        CreateIncidentRequest medReq = new CreateIncidentRequest();
        medReq.setCategory(IncidentCategory.MEDICAL);
        medReq.setLatitude(13.0827);
        medReq.setLongitude(80.2707);
        medReq.setLocationLandmark("Anna Nagar Roundtana");
        medReq.setContactName("Medical Caller");
        medReq.setContactPhone("+91-98401-33333");
        medReq.setAffectedPeople(2);

        Incident medIncident = incidentService.createIncident(medReq, "CITIZEN_MED", "CITIZEN");
        assertThat(medIncident.getCategory()).isEqualTo(IncidentCategory.MEDICAL);
        assertThat(medIncident.getAssignedTeamId()).isEqualTo("TEAM-CHN-N-003"); // North Medical Team

        List<AlertResponse> medAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-003", "STA-CHN-N-001", null);
        assertThat(medAlerts).isNotEmpty();
        assertThat(medAlerts.get(0).getIncidentId()).isEqualTo(medIncident.getId());

        List<AlertResponse> fireAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-002", "STA-CHN-N-001", null);
        assertThat(fireAlerts.stream().noneMatch(a -> a.getIncidentId().equals(medIncident.getId()))).isTrue();
    }

    @Test
    @DisplayName("Verify Trapped/Missing SOS routing to Search & Rescue Team")
    void testTrappedSARRoutingIsolation() {
        CreateIncidentRequest sarReq = new CreateIncidentRequest();
        sarReq.setCategory(IncidentCategory.TRAPPED);
        sarReq.setLatitude(13.0827);
        sarReq.setLongitude(80.2707);
        sarReq.setLocationLandmark("Collapsed Building Anna Nagar");
        sarReq.setContactName("SAR Caller");
        sarReq.setContactPhone("+91-98401-44444");
        sarReq.setAffectedPeople(5);

        Incident sarIncident = incidentService.createIncident(sarReq, "CITIZEN_SAR", "CITIZEN");
        assertThat(sarIncident.getCategory()).isEqualTo(IncidentCategory.TRAPPED);
        assertThat(sarIncident.getAssignedTeamId()).isEqualTo("TEAM-CHN-N-004"); // North SAR Team

        List<AlertResponse> sarAlerts = assignmentService.getRescueAlerts("TEAM-CHN-N-004", "STA-CHN-N-001", null);
        assertThat(sarAlerts).isNotEmpty();
        assertThat(sarAlerts.get(0).getIncidentId()).isEqualTo(sarIncident.getId());
    }

    @Test
    @DisplayName("Verify Other category routes to Station Leader triage queue without assigned team")
    void testOtherCategoryTriageRouting() {
        CreateIncidentRequest otherReq = new CreateIncidentRequest();
        otherReq.setCategory(IncidentCategory.OTHER);
        otherReq.setLatitude(13.0827);
        otherReq.setLongitude(80.2707);
        otherReq.setLocationLandmark("Unknown Hazard");
        otherReq.setContactName("Other Caller");
        otherReq.setContactPhone("+91-98401-55555");
        otherReq.setAffectedPeople(1);

        Incident otherIncident = incidentService.createIncident(otherReq, "CITIZEN_OTHER", "CITIZEN");
        assertThat(otherIncident.getCategory()).isEqualTo(IncidentCategory.OTHER);
        assertThat(otherIncident.getAssignedTeamId()).isNull();
        assertThat(otherIncident.getQueueStatus()).isEqualTo("TRIAGED");
        assertThat(otherIncident.getRoutingNotice()).contains("triage queue");
    }
}
