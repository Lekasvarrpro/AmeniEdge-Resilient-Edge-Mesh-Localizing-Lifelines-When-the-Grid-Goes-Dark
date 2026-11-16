package com.ameniedge.rescuefit;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.incidents.IncidentPriority;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.rescuefit.dto.RescueFitCandidate;
import com.ameniedge.rescuefit.dto.RescueFitExclusion;
import com.ameniedge.rescuefit.dto.RescueFitResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RescueFitEngineTest {

    @Mock
    private TeamRepository teamRepository;

    private RescueFitEngine engine;

    @BeforeEach
    void setUp() {
        engine = new RescueFitEngine(teamRepository);
    }

    @Test
    @DisplayName("Evaluate flood report with 2 trapped people: Team A recommended, Team B excluded for lack of boat, Team C excluded because busy")
    void evaluateFloodScenario() {
        // Given a Flood emergency with 2 trapped people
        Incident incident = new Incident();
        incident.setId("INC-9999");
        incident.setCategory(IncidentCategory.FLOOD);
        incident.setPriority(IncidentPriority.P1_CRITICAL);
        incident.setStatus(IncidentStatus.RECEIVED);
        incident.setAffectedPeople(2);
        incident.setLatitude(13.0850);
        incident.setLongitude(80.2700);

        // Candidate Teams
        // Team A: Nearby, swift-water certified, equipped with inflatable boat, available
        Team teamA = new Team(
                "TEAM-A",
                "Swift Water Alpha",
                "STA-CHN-N-001",
                "LEADER-A",
                TeamStatus.AVAILABLE,
                "SWIFT_WATER_RESCUE,BOAT_OPERATION",
                "INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS",
                13.0860,
                80.2710
        );

        // Team B: Closer proximity, but lacks swift-water certification & inflatable boat
        Team teamB = new Team(
                "TEAM-B",
                "Ground Patrol Beta",
                "STA-CHN-N-001",
                "LEADER-B",
                TeamStatus.AVAILABLE,
                "CROWD_CONTROL,FIRST_AID",
                "MEGAPHONE,FIRST_AID_KIT",
                13.0852,
                80.2702
        );

        // Team C: Qualified for water rescue, but currently deployed on another mission
        Team teamC = new Team(
                "TEAM-C",
                "Marine Delta",
                "STA-CHN-N-001",
                "LEADER-C",
                TeamStatus.BUSY,
                "SWIFT_WATER_RESCUE,BOAT_OPERATION",
                "MOTORIZED_DINGHY",
                13.0870,
                80.2680
        );
        teamC.setActiveIncidentCount(1);

        when(teamRepository.findAll()).thenReturn(Arrays.asList(teamA, teamB, teamC));

        // When evaluating RescueFit
        RescueFitResponse response = engine.evaluate(incident);

        // Then:
        assertThat(response.getEligibleTeams()).hasSize(1);
        RescueFitCandidate eligibleTeam = response.getEligibleTeams().get(0);
        assertThat(eligibleTeam.getTeamId()).isEqualTo("TEAM-A");
        assertThat(eligibleTeam.getFitScore()).isGreaterThan(0.7);
        assertThat(eligibleTeam.getRationale()).contains("Swift-water certified").contains("Available");

        // Team B and C must be explicitly excluded with transparent reasons
        List<RescueFitExclusion> exclusions = response.getExcludedTeams();
        assertThat(exclusions).hasSize(2);

        RescueFitExclusion exclusionB = exclusions.stream()
                .filter(e -> e.getTeamId().equals("TEAM-B"))
                .findFirst()
                .orElseThrow();
        assertThat(exclusionB.getExclusionReason()).contains("Lacks mandatory swift-water or boat rescue training");
        assertThat(exclusionB.getPotentialSupportRole()).isNotBlank();

        RescueFitExclusion exclusionC = exclusions.stream()
                .filter(e -> e.getTeamId().equals("TEAM-C"))
                .findFirst()
                .orElseThrow();
        assertThat(exclusionC.getExclusionReason()).contains("deployed on active mission");
    }
}

