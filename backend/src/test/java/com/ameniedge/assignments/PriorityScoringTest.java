package com.ameniedge.assignments;

import com.ameniedge.incidents.*;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PriorityScoringTest {

    private final PriorityScoringService scoringService = new PriorityScoringService();

    @Test
    @DisplayName("Calculate score: base category, people, vulnerable, hazard, and waiting time")
    void testDeterministicScoringRules() {
        Incident incident = new Incident();
        incident.setCategory(IncidentCategory.FLOOD); // Base 30
        incident.setAffectedPeople(4); // 4 * 5 = +20
        incident.setVulnerablePresent(true); // +15
        incident.setInHazardZone(true); // +15
        // Total expected = 30 + 20 + 15 + 15 = 80 -> P1_CRITICAL

        PriorityScoringService.ScoreResult result = scoringService.calculateScore(incident);

        assertThat(result.getScore()).isEqualTo(80.0);
        assertThat(result.getPriority()).isEqualTo(IncidentPriority.P1_CRITICAL);
        assertThat(result.getExplanation()).contains("Base flood (30)");
        assertThat(result.getExplanation()).contains("4 affected (+20)");
        assertThat(result.getExplanation()).contains("vulnerable present (+15)");
        assertThat(result.getExplanation()).contains("hazard zone (+15)");
    }

    @Test
    @DisplayName("Trapped people with 1 affected scores P3 or higher")
    void testTrappedCategoryScoring() {
        Incident incident = new Incident();
        incident.setCategory(IncidentCategory.TRAPPED); // Base 40
        incident.setAffectedPeople(1); // 1 * 5 = +5
        // 45 -> P3_ROUTINE

        PriorityScoringService.ScoreResult result = scoringService.calculateScore(incident);

        assertThat(result.getScore()).isEqualTo(45.0);
        assertThat(result.getPriority()).isEqualTo(IncidentPriority.P3_ROUTINE);
    }
}

