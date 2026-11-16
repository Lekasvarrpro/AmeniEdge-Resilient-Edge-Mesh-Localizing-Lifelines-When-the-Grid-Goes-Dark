package com.ameniedge.auth;

import com.ameniedge.assignments.Assignment;
import com.ameniedge.assignments.AssignmentRepository;
import com.ameniedge.assignments.AssignmentService;
import com.ameniedge.assignments.dto.AlertResponse;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.incidents.IncidentEventRepository;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentService;
import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.organization.Station;
import com.ameniedge.organization.StationRepository;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.rescuefit.RescueFitEngine;
import com.ameniedge.users.Role;
import com.ameniedge.users.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
public class AccountAuthenticationAndRoutingVerificationTest {

    @Mock
    private IncidentRepository incidentRepository;
    @Mock
    private IncidentEventRepository eventRepository;
    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private TeamRepository teamRepository;
    @Mock
    private StationRepository stationRepository;

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private IncidentService incidentService;
    private AssignmentService assignmentService;

    private final Map<String, User> seededUsers = new LinkedHashMap<>();
    private final Map<String, Team> seededTeams = new LinkedHashMap<>();
    private final Map<String, Station> seededStations = new LinkedHashMap<>();
    private final List<Incident> savedIncidents = new ArrayList<>();
    private final List<Assignment> savedAssignments = new ArrayList<>();

    @BeforeEach
    void setUp() {
        savedIncidents.clear();
        savedAssignments.clear();

        // 1. Seed 4 Regional Stations
        Station northStation = new Station("STA-CHN-N-001", "North Station - Anna Nagar", "REG-CHN-N", 13.0827, 80.2707, 6000);
        Station southStation = new Station("STA-CHN-S-002", "South Station - Tambaram", "REG-CHN-S", 12.9249, 80.1000, 6000);
        Station eastStation  = new Station("STA-CHN-E-003", "East Station - Royapuram", "REG-CHN-E", 13.1143, 80.2974, 6000);
        Station westStation  = new Station("STA-CHN-W-004", "West Station - Ambattur", "REG-CHN-W", 13.1147, 80.1548, 6000);

        seededStations.put(northStation.getId(), northStation);
        seededStations.put(southStation.getId(), southStation);
        seededStations.put(eastStation.getId(), eastStation);
        seededStations.put(westStation.getId(), westStation);

        // 2. Seed 16 Teams across 4 Stations (4 per station)
        seedTeam("TEAM-CHN-N-001", "Flood Rescue Team - North Station", "STA-CHN-N-001", "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION", 13.0827, 80.2707);
        seedTeam("TEAM-CHN-N-002", "Fire Response Team - North Station", "STA-CHN-N-001", "FIRE,FIRE_SUPPRESSION,EXTRICATION", 13.0827, 80.2707);
        seedTeam("TEAM-CHN-N-003", "Emergency Medical Team - North Station", "STA-CHN-N-001", "MEDICAL,TRIAGE,TRAUMA_CARE", 13.0827, 80.2707);
        seedTeam("TEAM-CHN-N-004", "Search & Rescue Team - North Station", "STA-CHN-N-001", "TRAPPED,MISSING,STRUCTURAL_SEARCH", 13.0827, 80.2707);

        seedTeam("TEAM-CHN-S-001", "Flood Rescue Team - South Station", "STA-CHN-S-002", "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION", 12.9249, 80.1000);
        seedTeam("TEAM-CHN-S-002", "Emergency Medical Team - South Station", "STA-CHN-S-002", "MEDICAL,TRIAGE,TRAUMA_CARE", 12.9249, 80.1000);
        seedTeam("TEAM-CHN-S-003", "Fire Response Team - South Station", "STA-CHN-S-002", "FIRE,FIRE_SUPPRESSION,EXTRICATION", 12.9249, 80.1000);
        seedTeam("TEAM-CHN-S-004", "Search & Rescue Team - South Station", "STA-CHN-S-002", "TRAPPED,MISSING,STRUCTURAL_SEARCH", 12.9249, 80.1000);

        seedTeam("TEAM-CHN-E-001", "Flood Rescue Team - East Station", "STA-CHN-E-003", "FLOOD,SWIFT_WATER_RESCUE,COASTAL_EXTRACTION", 13.1143, 80.2974);
        seedTeam("TEAM-CHN-E-002", "Fire Response Team - East Station", "STA-CHN-E-003", "FIRE,FIRE_SUPPRESSION,PORT_EXTRICATION", 13.1143, 80.2974);
        seedTeam("TEAM-CHN-E-003", "Emergency Medical Team - East Station", "STA-CHN-E-003", "MEDICAL,TRIAGE,TRAUMA_CARE,PARAMEDIC", 13.1143, 80.2974);
        seedTeam("TEAM-CHN-E-004", "Search & Rescue Team - East Station", "STA-CHN-E-003", "TRAPPED,MISSING,PORT_SAR", 13.1143, 80.2974);

        seedTeam("TEAM-CHN-W-001", "Flood Rescue Team - West Station", "STA-CHN-W-004", "FLOOD,SWIFT_WATER_RESCUE,CANAL_EXTRACTION", 13.1147, 80.1548);
        seedTeam("TEAM-CHN-W-002", "Fire Response Team - West Station", "STA-CHN-W-004", "FIRE,INDUSTRIAL_FIRE,CHEMICAL_EXTRICATION", 13.1147, 80.1548);
        seedTeam("TEAM-CHN-W-003", "Emergency Medical Team - West Station", "STA-CHN-W-004", "MEDICAL,TRIAGE,TRAUMA_CARE,INDUSTRIAL_FIRST_AID", 13.1147, 80.1548);
        seedTeam("TEAM-CHN-W-004", "Search & Rescue Team - West Station", "STA-CHN-W-004", "TRAPPED,MISSING,INDUSTRIAL_SAR", 13.1147, 80.1548);

        // 3. Seed 23 Accounts (16 Responders + 4 Leaders + 1 Supervisor + 1 Admin + 1 Citizen)
        seedUser("USR-RSC-N-01", "flood.north@amenedge.test", "Flood@12345", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-001");
        seedUser("USR-RSC-N-02", "fire.north@amenedge.test", "Fire@12345", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-002");
        seedUser("USR-RSC-N-03", "medical.north@amenedge.test", "Medical@12345", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-003");
        seedUser("USR-RSC-N-04", "sar.north@amenedge.test", "Sar@12345", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-004");
        seedUser("USR-LDR-N-01", "leader.north@amenedge.test", "Leader@12345", Role.STATION_LEADER, "STA-CHN-N-001", null);

        seedUser("USR-RSC-S-01", "flood.south@amenedge.test", "Flood@12345", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-001");
        seedUser("USR-RSC-S-02", "medical.south@amenedge.test", "Medical@12345", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-002");
        seedUser("USR-RSC-S-03", "fire.south@amenedge.test", "Fire@12345", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-003");
        seedUser("USR-RSC-S-04", "sar.south@amenedge.test", "Sar@12345", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-004");
        seedUser("USR-LDR-S-01", "leader.south@amenedge.test", "Leader@12345", Role.STATION_LEADER, "STA-CHN-S-002", null);

        seedUser("USR-RSC-E-01", "flood.east@amenedge.test", "Flood@12345", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-001");
        seedUser("USR-RSC-E-02", "fire.east@amenedge.test", "Fire@12345", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-002");
        seedUser("USR-RSC-E-03", "medical.east@amenedge.test", "Medical@12345", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-003");
        seedUser("USR-RSC-E-04", "sar.east@amenedge.test", "Sar@12345", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-004");
        seedUser("USR-LDR-E-01", "leader.east@amenedge.test", "Leader@12345", Role.STATION_LEADER, "STA-CHN-E-003", null);

        seedUser("USR-RSC-W-01", "flood.west@amenedge.test", "Flood@12345", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-001");
        seedUser("USR-RSC-W-02", "fire.west@amenedge.test", "Fire@12345", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-002");
        seedUser("USR-RSC-W-03", "medical.west@amenedge.test", "Medical@12345", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-003");
        seedUser("USR-RSC-W-04", "sar.west@amenedge.test", "Sar@12345", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-004");
        seedUser("USR-LDR-W-01", "leader.west@amenedge.test", "Leader@12345", Role.STATION_LEADER, "STA-CHN-W-004", null);

        seedUser("USR-SUP-01", "supervisor@amenedge.test", "Super@12345", Role.REGIONAL_SUPERVISOR, null, null);
        seedUser("USR-ADM-01", "admin@amenedge.test", "Admin@12345", Role.ORG_ADMIN, null, null);
        seedUser("USR-CTZ-01", "citizen@amenedge.test", "Citizen@12345", Role.CITIZEN, null, null);

        // Mock Repositories
        when(teamRepository.findAll()).thenReturn(new ArrayList<>(seededTeams.values()));
        when(teamRepository.findById(anyString())).thenAnswer(inv -> Optional.ofNullable(seededTeams.get(inv.getArgument(0))));

        when(stationRepository.findAll()).thenReturn(new ArrayList<>(seededStations.values()));
        when(stationRepository.findById(anyString())).thenAnswer(inv -> Optional.ofNullable(seededStations.get(inv.getArgument(0))));

        when(incidentRepository.save(any(Incident.class))).thenAnswer(inv -> {
            Incident inc = inv.getArgument(0);
            savedIncidents.removeIf(i -> i.getId().equals(inc.getId()));
            savedIncidents.add(inc);
            return inc;
        });
        when(incidentRepository.findAll()).thenReturn(savedIncidents);
        when(incidentRepository.findById(anyString())).thenAnswer(inv -> savedIncidents.stream().filter(i -> i.getId().equals(inv.getArgument(0))).findFirst());

        when(assignmentRepository.save(any(Assignment.class))).thenAnswer(inv -> {
            Assignment asn = inv.getArgument(0);
            savedAssignments.removeIf(a -> a.getId().equals(asn.getId()));
            savedAssignments.add(asn);
            return asn;
        });
        when(assignmentRepository.findAll()).thenReturn(savedAssignments);
        when(assignmentRepository.findById(anyString())).thenAnswer(inv -> savedAssignments.stream().filter(a -> a.getId().equals(inv.getArgument(0))).findFirst());
        when(assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(anyString())).thenAnswer(inv -> {
            String id = inv.getArgument(0);
            return savedAssignments.stream().filter(a -> a.getIncidentId().equals(id)).findFirst();
        });

        RescueFitEngine engine = new RescueFitEngine(teamRepository);
        incidentService = new IncidentService(incidentRepository, eventRepository, assignmentRepository, teamRepository, engine, "STA-CHN-N-001");
        incidentService.setStationRepository(stationRepository);

        assignmentService = new AssignmentService(assignmentRepository, incidentRepository, incidentService, teamRepository, null);
        assignmentService.setStationRepository(stationRepository);
    }

    private void seedTeam(String id, String name, String stationId, String caps, double lat, double lng) {
        Team t = new Team(id, name, stationId, null, TeamStatus.AVAILABLE, caps, "STANDARD_GEAR", lat, lng);
        seededTeams.put(id, t);
    }

    private void seedUser(String id, String username, String pass, Role role, String stationId, String teamId) {
        User u = new User(id, username, passwordEncoder.encode(pass), username.split("@")[0], role, stationId);
        u.setTeamId(teamId);
        seededUsers.put(username, u);
    }

    @Test
    @DisplayName("Verify all 23 accounts are configured with exact 1-to-1 team and station links")
    void testAll23AccountsSeededCorrectly() {
        assertThat(seededUsers).hasSize(23);

        // North
        assertAccount("flood.north@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-001");
        assertAccount("fire.north@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-002");
        assertAccount("medical.north@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-003");
        assertAccount("sar.north@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-004");
        assertAccount("leader.north@amenedge.test", Role.STATION_LEADER, "STA-CHN-N-001", null);

        // South
        assertAccount("flood.south@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-001");
        assertAccount("medical.south@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-002");
        assertAccount("fire.south@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-003");
        assertAccount("sar.south@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-004");
        assertAccount("leader.south@amenedge.test", Role.STATION_LEADER, "STA-CHN-S-002", null);

        // East
        assertAccount("flood.east@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-001");
        assertAccount("fire.east@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-002");
        assertAccount("medical.east@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-003");
        assertAccount("sar.east@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-004");
        assertAccount("leader.east@amenedge.test", Role.STATION_LEADER, "STA-CHN-E-003", null);

        // West
        assertAccount("flood.west@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-001");
        assertAccount("fire.west@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-002");
        assertAccount("medical.west@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-003");
        assertAccount("sar.west@amenedge.test", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-004");
        assertAccount("leader.west@amenedge.test", Role.STATION_LEADER, "STA-CHN-W-004", null);

        // Governance & Public
        assertAccount("supervisor@amenedge.test", Role.REGIONAL_SUPERVISOR, null, null);
        assertAccount("admin@amenedge.test", Role.ORG_ADMIN, null, null);
        assertAccount("citizen@amenedge.test", Role.CITIZEN, null, null);
    }

    private void assertAccount(String username, Role expectedRole, String expectedStation, String expectedTeam) {
        User u = seededUsers.get(username);
        assertThat(u).isNotNull();
        assertThat(u.getRole()).isEqualTo(expectedRole);
        assertThat(u.getStationId()).isEqualTo(expectedStation);
        assertThat(u.getTeamId()).isEqualTo(expectedTeam);
    }

    @Test
    @DisplayName("Verify all 16 routing combinations (4 regions x 4 categories) route with 1-to-1 isolation")
    void testAll16RegionCategoryRoutingCombinations() {
        String[] regions = {"North", "South", "East", "West"};
        IncidentCategory[] categories = {
                IncidentCategory.FLOOD,
                IncidentCategory.FIRE,
                IncidentCategory.MEDICAL,
                IncidentCategory.TRAPPED
        };

        Map<String, Map<IncidentCategory, String>> expectedTeamMatrix = Map.of(
                "North", Map.of(
                        IncidentCategory.FLOOD, "TEAM-CHN-N-001",
                        IncidentCategory.FIRE, "TEAM-CHN-N-002",
                        IncidentCategory.MEDICAL, "TEAM-CHN-N-003",
                        IncidentCategory.TRAPPED, "TEAM-CHN-N-004"
                ),
                "South", Map.of(
                        IncidentCategory.FLOOD, "TEAM-CHN-S-001",
                        IncidentCategory.FIRE, "TEAM-CHN-S-003",
                        IncidentCategory.MEDICAL, "TEAM-CHN-S-002",
                        IncidentCategory.TRAPPED, "TEAM-CHN-S-004"
                ),
                "East", Map.of(
                        IncidentCategory.FLOOD, "TEAM-CHN-E-001",
                        IncidentCategory.FIRE, "TEAM-CHN-E-002",
                        IncidentCategory.MEDICAL, "TEAM-CHN-E-003",
                        IncidentCategory.TRAPPED, "TEAM-CHN-E-004"
                ),
                "West", Map.of(
                        IncidentCategory.FLOOD, "TEAM-CHN-W-001",
                        IncidentCategory.FIRE, "TEAM-CHN-W-002",
                        IncidentCategory.MEDICAL, "TEAM-CHN-W-003",
                        IncidentCategory.TRAPPED, "TEAM-CHN-W-004"
                )
        );

        Map<String, String> regionStationMap = Map.of(
                "North", "STA-CHN-N-001",
                "South", "STA-CHN-S-002",
                "East", "STA-CHN-E-003",
                "West", "STA-CHN-W-004"
        );

        for (String region : regions) {
            for (IncidentCategory category : categories) {
                savedIncidents.clear();
                savedAssignments.clear();

                CreateIncidentRequest req = new CreateIncidentRequest();
                req.setCategory(category);
                req.setRegion(region);
                req.setLocationLandmark(region + " " + category + " incident sector");
                req.setContactName("Citizen " + region + " " + category);
                req.setAffectedPeople(2);

                Incident incident = incidentService.createIncident(req, "CTZ-AUTOTEST", "CITIZEN");
                String expectedTeamId = expectedTeamMatrix.get(region).get(category);
                String expectedStationId = regionStationMap.get(region);

                assertThat(incident.getAssignedTeamId())
                        .as("Routing failed for Region: %s, Category: %s", region, category)
                        .isEqualTo(expectedTeamId);
                assertThat(incident.getStationId())
                        .as("Station mismatch for Region: %s", region)
                        .isEqualTo(expectedStationId);

                // Verify targeted department sees 1 alert
                List<AlertResponse> targetAlerts = assignmentService.getRescueAlerts(expectedTeamId, expectedStationId, null);
                assertThat(targetAlerts)
                        .as("Target team %s did not receive alert", expectedTeamId)
                        .hasSize(1);
                assertThat(targetAlerts.get(0).getIncidentId()).isEqualTo(incident.getId());

                // Verify other teams at other stations see 0 alerts
                for (String otherTeamId : seededTeams.keySet()) {
                    if (!otherTeamId.equals(expectedTeamId)) {
                        Team otherTeam = seededTeams.get(otherTeamId);
                        List<AlertResponse> otherAlerts = assignmentService.getRescueAlerts(otherTeamId, otherTeam.getStationId(), null);
                        assertThat(otherAlerts)
                                .as("Team %s unexpectedly saw alert meant for %s", otherTeamId, expectedTeamId)
                                .isEmpty();
                    }
                }
            }
        }
    }

    @Test
    @DisplayName("Verify GPS proximity routing when region is not explicitly selected")
    void testGpsProximityRouting() {
        // Royapuram East coordinates: 13.1143, 80.2974
        CreateIncidentRequest req = new CreateIncidentRequest();
        req.setCategory(IncidentCategory.FIRE);
        req.setLatitude(13.1140);
        req.setLongitude(80.2970);
        req.setLocationLandmark("East Port Terminal");

        Incident incident = incidentService.createIncident(req, "CTZ-GPS", "CITIZEN");
        assertThat(incident.getStationId()).isEqualTo("STA-CHN-E-003");
        assertThat(incident.getAssignedTeamId()).isEqualTo("TEAM-CHN-E-002"); // East Fire Response
    }

    @Test
    @DisplayName("Verify decline assignment with reason removes alert from team queue")
    void testDeclineWithReasonRemovesAlert() {
        CreateIncidentRequest req = new CreateIncidentRequest();
        req.setCategory(IncidentCategory.FLOOD);
        req.setRegion("North");
        req.setLocationLandmark("Anna Nagar Roundtana");

        Incident incident = incidentService.createIncident(req, "CTZ-DECLINE", "CITIZEN");
        String teamId = "TEAM-CHN-N-001";
        String stationId = "STA-CHN-N-001";

        List<AlertResponse> alertsBefore = assignmentService.getRescueAlerts(teamId, stationId, null);
        assertThat(alertsBefore).hasSize(1);
        String assignmentId = alertsBefore.get(0).getAssignmentId();

        assignmentService.declineAssignment(assignmentId, "Equipment malfunction on watercraft engine", "USR-RSC-N-01", "RESCUE_MEMBER");

        List<AlertResponse> alertsAfter = assignmentService.getRescueAlerts(teamId, stationId, null);
        assertThat(alertsAfter).isEmpty();
    }
}
