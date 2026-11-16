package com.ameniedge.rescuefit;

import com.ameniedge.common.ApiResponse;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.organization.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/dev")
@Profile("!prod")
public class DevRoutingTraceController {

    private final IncidentRepository incidentRepository;
    private final StationRepository stationRepository;
    private final TeamRepository teamRepository;

    @Autowired(required = false)
    private DepartmentCapacityRepository capacityRepository;

    public DevRoutingTraceController(
            IncidentRepository incidentRepository,
            StationRepository stationRepository,
            TeamRepository teamRepository) {
        this.incidentRepository = incidentRepository;
        this.stationRepository = stationRepository;
        this.teamRepository = teamRepository;
    }

    public static class RoutingTraceResponse {
        public String incidentId;
        public String category;
        public Double latitude;
        public Double longitude;
        public String assignedStationId;
        public String assignedStationName;
        public String assignedTeamId;
        public String assignedTeamName;
        public String routingReason;
        public boolean isForwarded;
        public boolean isTriage;
        public List<StationTrace> stationEvaluations = new ArrayList<>();
    }

    public static class StationTrace {
        public String stationId;
        public String stationName;
        public double distanceKm;
        public boolean isNearest;
        public List<TeamTrace> candidateTeams = new ArrayList<>();
    }

    public static class TeamTrace {
        public String teamId;
        public String teamName;
        public String capabilities;
        public boolean matchesCategory;
        public int availablePersonnel;
        public boolean hasCapacity;
        public boolean isSelected;
    }

    @GetMapping("/routing-trace/{incidentId}")
    public ResponseEntity<ApiResponse<RoutingTraceResponse>> getRoutingTrace(@PathVariable String incidentId) {
        Incident incident = incidentRepository.findById(incidentId)
                .or(() -> incidentRepository.findByClientReferenceId(incidentId))
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + incidentId));

        RoutingTraceResponse trace = new RoutingTraceResponse();
        trace.incidentId = incident.getId();
        trace.category = incident.getCategory() != null ? incident.getCategory().name() : "OTHER";
        trace.latitude = incident.getLatitude();
        trace.longitude = incident.getLongitude();
        trace.assignedStationId = incident.getStationId();
        trace.assignedStationName = incident.getStationName();
        trace.assignedTeamId = incident.getAssignedTeamId();
        trace.assignedTeamName = incident.getAssignedTeamName();
        trace.routingReason = incident.getRoutingNotice();
        trace.isTriage = incident.getAssignedTeamId() == null;
        trace.isForwarded = incident.getRoutingNotice() != null && incident.getRoutingNotice().contains("Forwarded");

        List<Station> stations = stationRepository != null ? new ArrayList<>(stationRepository.findAll()) : new ArrayList<>();
        double incLat = incident.getLatitude() != null ? incident.getLatitude() : 13.0827;
        double incLng = incident.getLongitude() != null ? incident.getLongitude() : 80.2707;

        stations.sort(Comparator.comparingDouble(s -> calculateHaversineKm(incLat, incLng, s.getLatitude(), s.getLongitude())));

        List<Team> allTeams = teamRepository != null ? teamRepository.findAll() : Collections.emptyList();

        for (int i = 0; i < stations.size(); i++) {
            Station st = stations.get(i);
            StationTrace stTrace = new StationTrace();
            stTrace.stationId = st.getId();
            stTrace.stationName = st.getName();
            stTrace.distanceKm = Math.round(calculateHaversineKm(incLat, incLng, st.getLatitude(), st.getLongitude()) * 10.0) / 10.0;
            stTrace.isNearest = (i == 0);

            for (Team t : allTeams) {
                if (t.getStationId() != null && t.getStationId().equalsIgnoreCase(st.getId())) {
                    TeamTrace tTrace = new TeamTrace();
                    tTrace.teamId = t.getId();
                    tTrace.teamName = t.getName();
                    tTrace.capabilities = t.getCapabilities();
                    tTrace.matchesCategory = matchesCategory(t.getCapabilities(), incident.getCategory());

                    int avail = 120;
                    if (capacityRepository != null) {
                        Optional<DepartmentCapacity> cap = capacityRepository.findByTeamId(t.getId());
                        if (cap.isPresent()) avail = cap.get().getAvailablePersonnel();
                    }
                    tTrace.availablePersonnel = avail;
                    tTrace.hasCapacity = avail >= 8 && t.getStatus() != TeamStatus.OFF_DUTY;
                    tTrace.isSelected = t.getId().equalsIgnoreCase(incident.getAssignedTeamId());
                    stTrace.candidateTeams.add(tTrace);
                }
            }
            trace.stationEvaluations.add(stTrace);
        }

        return ResponseEntity.ok(ApiResponse.ok("Routing evaluation trace", trace));
    }

    private boolean matchesCategory(String caps, IncidentCategory category) {
        if (caps == null || category == null) return false;
        String upper = caps.toUpperCase();
        return switch (category) {
            case FLOOD -> upper.contains("FLOOD") || upper.contains("SWIFT_WATER") || upper.contains("BOAT");
            case FIRE -> upper.contains("FIRE") || upper.contains("EXTRICATION");
            case MEDICAL -> upper.contains("MEDICAL") || upper.contains("TRIAGE") || upper.contains("TRAUMA") || upper.contains("EMT");
            case TRAPPED, MISSING, STRUCTURAL_COLLAPSE -> upper.contains("TRAPPED") || upper.contains("MISSING") || upper.contains("STRUCTURAL") || upper.contains("URBAN_SAR");
            default -> false;
        };
    }

    private double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371.0 * c;
    }
}
