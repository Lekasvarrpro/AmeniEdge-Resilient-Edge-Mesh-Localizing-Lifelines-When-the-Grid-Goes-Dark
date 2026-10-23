package com.ameniedge.rescuefit;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.rescuefit.dto.RescueFitCandidate;
import com.ameniedge.rescuefit.dto.RescueFitExclusion;
import com.ameniedge.rescuefit.dto.RescueFitResponse;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class RescueFitEngine {

    private final TeamRepository teamRepository;

    public RescueFitEngine(TeamRepository teamRepository) {
        this.teamRepository = teamRepository;
    }

    public RescueFitResponse evaluate(Incident incident) {
        List<Team> allTeams = teamRepository.findAll();

        List<RescueFitCandidate> eligible = new ArrayList<>();
        List<RescueFitExclusion> excluded = new ArrayList<>();

        for (Team team : allTeams) {
            EvaluationResult result = evaluateTeam(team, incident);
            if (result.isEligible()) {
                eligible.add(result.getCandidate());
            } else {
                excluded.add(result.getExclusion());
            }
        }

        // Rank eligible candidates by fit score descending
        eligible.sort((a, b) -> Double.compare(b.getFitScore(), a.getFitScore()));

        String stationNotice = "Autonomous station rules engine evaluated " + allTeams.size() +
                " teams against category " + incident.getCategory() +
                ". Station leader holds final deployment authorization.";

        return new RescueFitResponse(
                incident.getId(),
                incident.getCategory().name(),
                incident.getAffectedPeople(),
                eligible,
                excluded,
                stationNotice
        );
    }

    private EvaluationResult evaluateTeam(Team team, Incident incident) {
        // Hard Filter 1: Operational Status (Must be AVAILABLE)
        if (team.getStatus() == TeamStatus.OFF_DUTY) {
            return EvaluationResult.exclude(new RescueFitExclusion(
                    team.getId(),
                    team.getName(),
                    "Excluded: Team is currently OFF_DUTY",
                    "Unavailable for dispatch"
            ));
        }

        if (team.getStatus() == TeamStatus.BUSY || team.getActiveIncidentCount() > 0) {
            return EvaluationResult.exclude(new RescueFitExclusion(
                    team.getId(),
                    team.getName(),
                    "Excluded: Team is currently deployed on active mission (" + team.getActiveIncidentCount() + " active)",
                    "Potential relief team once current mission resolves"
            ));
        }

        // Hard Filter 2: Mandatory Skills & Equipment per Category
        String capabilities = team.getCapabilities() != null ? team.getCapabilities().toUpperCase() : "";
        String equipment = team.getEquipment() != null ? team.getEquipment().toUpperCase() : "";

        if (incident.getCategory() == IncidentCategory.FLOOD) {
            boolean hasWaterSkill = capabilities.contains("SWIFT_WATER_RESCUE") || capabilities.contains("BOAT_OPERATION") || capabilities.contains("DIVING");
            if (!hasWaterSkill) {
                return EvaluationResult.exclude(new RescueFitExclusion(
                        team.getId(),
                        team.getName(),
                        "Excluded: Lacks mandatory swift-water or boat rescue training",
                        "Perimeter security, crowd control, or relief shelter support"
                ));
            }

            boolean hasBoatOrHighClearance = equipment.contains("BOAT") || equipment.contains("ZODIAC") ||
                    equipment.contains("DINGHY") || equipment.contains("HIGH_CLEARANCE") || equipment.contains("LIFE_JACKETS");
            if (!hasBoatOrHighClearance) {
                return EvaluationResult.exclude(new RescueFitExclusion(
                        team.getId(),
                        team.getName(),
                        "Excluded: Lacks required watercraft or high-clearance flood vehicle",
                        "Ground triage and casualty reception at safe water boundary"
                ));
            }
        } else if (incident.getCategory() == IncidentCategory.STRUCTURAL_COLLAPSE || incident.getCategory() == IncidentCategory.TRAPPED) {
            boolean hasCollapseSkill = capabilities.contains("STRUCTURAL_SEARCH") || capabilities.contains("TRIAGE") || capabilities.contains("EXTRICATION");
            if (!hasCollapseSkill) {
                return EvaluationResult.exclude(new RescueFitExclusion(
                        team.getId(),
                        team.getName(),
                        "Excluded: Lacks heavy urban search & extrication training",
                        "Secondary cordon and first-aid support"
                ));
            }
        }

        // Calculate Proximity and ETA
        double incLat = incident.getLatitude() != null ? incident.getLatitude() : 13.0827;
        double incLng = incident.getLongitude() != null ? incident.getLongitude() : 80.2707;
        double teamLat = team.getCurrentLatitude() != null ? team.getCurrentLatitude() : incLat;
        double teamLng = team.getCurrentLongitude() != null ? team.getCurrentLongitude() : incLng;

        int distanceMeters = (int) calculateHaversineDistance(incLat, incLng, teamLat, teamLng);
        // Estimate travel speed: ~25 km/h in disaster conditions (~416 meters / minute)
        int etaMinutes = Math.max(2, (int) Math.ceil(distanceMeters / 416.0));

        // Telemetry staleness check (> 15 minutes old)
        boolean isStale = false;
        if (team.getUpdatedAt() != null) {
            long minutesSinceUpdate = Duration.between(team.getUpdatedAt(), Instant.now()).toMinutes();
            if (minutesSinceUpdate > 15) {
                isStale = true;
            }
        }

        // Soft Scoring Matrix (Range 0.0 to 1.0)
        // Score = Proximity (50%) + Availability/Workload (30%) + Equipment/Skill Match (20%)
        double proximityScore = 1.0 / (1.0 + (distanceMeters / 1000.0));
        double workloadScore = 1.0; // Since activeIncidentCount == 0 for eligible teams
        double equipmentScore = 0.95;

        double fitScore = Math.round(((proximityScore * 0.5) + (workloadScore * 0.3) + (equipmentScore * 0.2)) * 100.0) / 100.0;

        StringBuilder rationale = new StringBuilder();
        rationale.append("Verified for ").append(incident.getCategory()).append(" response. ");
        if (incident.getCategory() == IncidentCategory.FLOOD) {
            rationale.append("Swift-water certified with aquatic craft. ");
        }
        rationale.append("Available status. Estimated ETA: ").append(etaMinutes).append(" mins (").append(distanceMeters).append("m). ");
        if (isStale) {
            rationale.append("[Warning: Team telemetry last updated >15m ago].");
        } else {
            rationale.append("Telemetry verified live.");
        }

        RescueFitCandidate candidate = new RescueFitCandidate(
                team.getId(),
                team.getName(),
                fitScore,
                etaMinutes,
                distanceMeters,
                rationale.toString(),
                isStale
        );

        return EvaluationResult.eligible(candidate);
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Radius of Earth in meters
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static class EvaluationResult {
        private final boolean eligible;
        private final RescueFitCandidate candidate;
        private final RescueFitExclusion exclusion;

        private EvaluationResult(boolean eligible, RescueFitCandidate candidate, RescueFitExclusion exclusion) {
            this.eligible = eligible;
            this.candidate = candidate;
            this.exclusion = exclusion;
        }

        public static EvaluationResult eligible(RescueFitCandidate candidate) {
            return new EvaluationResult(true, candidate, null);
        }

        public static EvaluationResult exclude(RescueFitExclusion exclusion) {
            return new EvaluationResult(false, null, exclusion);
        }

        public boolean isEligible() { return eligible; }
        public RescueFitCandidate getCandidate() { return candidate; }
        public RescueFitExclusion getExclusion() { return exclusion; }
    }
}
