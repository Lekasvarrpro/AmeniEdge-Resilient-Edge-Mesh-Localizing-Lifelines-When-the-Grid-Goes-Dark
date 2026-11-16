package com.ameniedge.incidents;

import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.Instant;

@Service
public class PriorityScoringService {

    public static class ScoreResult {
        private final double score;
        private final IncidentPriority priority;
        private final String explanation;

        public ScoreResult(double score, IncidentPriority priority, String explanation) {
            this.score = score;
            this.priority = priority;
            this.explanation = explanation;
        }

        public double getScore() { return score; }
        public IncidentPriority getPriority() { return priority; }
        public String getExplanation() { return explanation; }
    }

    public ScoreResult calculateScore(Incident incident) {
        double baseScore = getBaseCategoryScore(incident.getCategory());
        String categoryName = incident.getCategory() != null ? incident.getCategory().name() : "OTHER";

        int people = Math.max(1, incident.getAffectedPeople());
        double peopleScore = 5.0 * Math.min(people, 8);

        double vulnerableScore = incident.isVulnerablePresent() ? 15.0 : 0.0;
        double hazardScore = incident.isInHazardZone() ? 15.0 : 0.0;

        // Waiting time aging: +1 point per minute unassigned
        long minutesWaiting = 0;
        if (incident.getCreatedAt() != null && incident.getAssignedTeamId() == null) {
            minutesWaiting = Math.max(0, Duration.between(incident.getCreatedAt(), Instant.now()).toMinutes());
        }
        double waitingScore = Math.min(25.0, (double) minutesWaiting * 1.0);

        double rawTotal = baseScore + peopleScore + vulnerableScore + hazardScore + waitingScore;
        double finalScore = Math.min(100.0, Math.max(0.0, rawTotal));

        IncidentPriority priority;
        if (finalScore >= 80.0) {
            priority = IncidentPriority.P1_CRITICAL;
        } else if (finalScore >= 60.0) {
            priority = IncidentPriority.P2_URGENT;
        } else if (finalScore >= 40.0) {
            priority = IncidentPriority.P3_ROUTINE;
        } else {
            priority = IncidentPriority.P4_MONITORING;
        }

        StringBuilder expl = new StringBuilder();
        expl.append("Base ").append(categoryName.toLowerCase()).append(" (").append((int) baseScore).append(")");
        expl.append(" + ").append(people).append(" affected (+").append((int) peopleScore).append(")");
        if (vulnerableScore > 0) {
            expl.append(" + vulnerable present (+15)");
        }
        if (hazardScore > 0) {
            expl.append(" + hazard zone (+15)");
        }
        if (waitingScore > 0) {
            expl.append(" + ").append(minutesWaiting).append(" min wait (+").append((int) waitingScore).append(")");
        }
        expl.append(" = ").append(String.format("%.1f", finalScore)).append(" (").append(priority.name()).append(")");

        return new ScoreResult(finalScore, priority, expl.toString());
    }

    private double getBaseCategoryScore(IncidentCategory category) {
        if (category == null) return 15.0;
        return switch (category) {
            case TRAPPED -> 40.0;
            case FIRE -> 35.0;
            case MEDICAL -> 35.0;
            case FLOOD -> 30.0;
            case MISSING -> 25.0;
            case STRUCTURAL_COLLAPSE -> 35.0;
            case OTHER -> 15.0;
        };
    }
}
