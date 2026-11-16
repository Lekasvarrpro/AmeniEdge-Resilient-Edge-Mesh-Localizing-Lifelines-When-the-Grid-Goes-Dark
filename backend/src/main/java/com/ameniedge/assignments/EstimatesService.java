package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.organization.DepartmentCapacity;
import com.ameniedge.organization.DepartmentCapacityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class EstimatesService {

    private final MissionStatsHistoryRepository historyRepository;
    private final MissionEstimatesRepository estimatesRepository;
    private final DepartmentCapacityRepository capacityRepository;

    public EstimatesService(MissionStatsHistoryRepository historyRepository,
                            MissionEstimatesRepository estimatesRepository,
                            DepartmentCapacityRepository capacityRepository) {
        this.historyRepository = historyRepository;
        this.estimatesRepository = estimatesRepository;
        this.capacityRepository = capacityRepository;
    }

    public static class DepartmentEstimatesSummary {
        public double avgTravelSeconds;
        public double avgWorkSeconds;
        public double avgReturnSeconds;
        public double avgTotalSeconds;
        public int historyCount;
        public String nextAvailableEstimate;
    }

    public DepartmentEstimatesSummary getEstimatesForDepartment(String departmentId) {
        List<MissionStatsHistory> history = historyRepository.findTop5ByDepartmentIdOrderByCompletedAtDesc(departmentId);
        DepartmentEstimatesSummary summary = new DepartmentEstimatesSummary();
        summary.historyCount = history.size();

        if (history.isEmpty()) {
            summary.avgTravelSeconds = 240.0;
            summary.avgWorkSeconds = 180.0;
            summary.avgReturnSeconds = 240.0;
            summary.avgTotalSeconds = 660.0;
        } else {
            summary.avgTravelSeconds = history.stream().mapToInt(MissionStatsHistory::getActualTravelSeconds).average().orElse(240.0);
            summary.avgWorkSeconds = history.stream().mapToInt(MissionStatsHistory::getActualWorkSeconds).average().orElse(180.0);
            summary.avgReturnSeconds = history.stream().mapToInt(MissionStatsHistory::getActualReturnSeconds).average().orElse(240.0);
            summary.avgTotalSeconds = summary.avgTravelSeconds + summary.avgWorkSeconds + summary.avgReturnSeconds;
        }

        Optional<DepartmentCapacity> cap = capacityRepository.findByTeamId(departmentId);
        if (cap.isPresent() && cap.get().getAvailablePersonnel() > 0) {
            summary.nextAvailableEstimate = "Immediate (Available personnel ready)";
        } else {
            int waitMin = (int) Math.ceil(summary.avgReturnSeconds / 60.0);
            summary.nextAvailableEstimate = "In ~" + Math.max(2, waitMin) + " minutes (when deployed unit returns)";
        }

        return summary;
    }

    @Transactional
    public MissionEstimates computeAndSaveEstimate(Incident incident, String departmentId, double distanceKm) {
        DepartmentEstimatesSummary summary = getEstimatesForDepartment(departmentId);

        int travelSec = (int) Math.max(30.0, (distanceKm / 40.0) * 3600.0);
        int workSec = (int) summary.avgWorkSeconds;
        int returnSec = travelSec;
        int totalSec = travelSec + workSec + returnSec;

        Instant startTime = Instant.now();
        Optional<DepartmentCapacity> cap = capacityRepository.findByTeamId(departmentId);
        if (cap.isPresent() && cap.get().getAvailablePersonnel() <= 0) {
            startTime = startTime.plusSeconds((long) summary.avgReturnSeconds);
        }

        MissionEstimates est = new MissionEstimates();
        est.setId("EST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        est.setIncidentId(incident.getId());
        est.setDepartmentId(departmentId);
        est.setCategory(incident.getCategory() != null ? incident.getCategory().name() : "OTHER");
        est.setTravelDistanceKm(distanceKm);
        est.setTravelTimeSeconds(travelSec);
        est.setWorkTimeSeconds(workSec);
        est.setReturnTimeSeconds(returnSec);
        est.setTotalEstimatedSeconds(totalSec);
        est.setEstimatedStartTime(startTime);
        est.setBasedOnHistoryCount(summary.historyCount);
        est.setExplanation("Travel " + (travelSec / 60) + "m + Work " + (workSec / 60) + "m + Return " + (returnSec / 60) + "m based on " + summary.historyCount + " past missions");

        return estimatesRepository.save(est);
    }

    @Transactional
    public void recordCompletedMission(String departmentId, String category, int people, int travelSec, int workSec, int returnSec, String outcome) {
        MissionStatsHistory hist = new MissionStatsHistory();
        hist.setId("HIST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        hist.setDepartmentId(departmentId);
        hist.setCategory(category != null ? category : "OTHER");
        hist.setPeopleAffected(Math.max(1, people));
        hist.setActualTravelSeconds(travelSec > 0 ? travelSec : 240);
        hist.setActualWorkSeconds(workSec > 0 ? workSec : 180);
        hist.setActualReturnSeconds(returnSec > 0 ? returnSec : 240);
        hist.setOutcome(outcome != null ? outcome : "SUCCESSFUL_EXTRACTION");
        hist.setCompletedAt(Instant.now());
        historyRepository.save(hist);
    }
}

