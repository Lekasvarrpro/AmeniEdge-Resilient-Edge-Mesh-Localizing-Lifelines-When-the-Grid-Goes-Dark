package com.ameniedge.notifications;

import com.ameniedge.common.ApiResponse;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.sync.SyncEventRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.lang.management.ManagementFactory;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    private final String stationId;
    private final String stationName;
    private final String operationalMode;
    private final TeamRepository teamRepository;
    private final IncidentRepository incidentRepository;
    private final SyncEventRepository syncEventRepository;

    public HealthController(
            @Value("${ameniedge.station.id:STA-CHN-N-001}") String stationId,
            @Value("${ameniedge.station.name:Station North Command}") String stationName,
            @Value("${ameniedge.station.mode:ISOLATED_EDGE}") String operationalMode,
            TeamRepository teamRepository,
            IncidentRepository incidentRepository,
            SyncEventRepository syncEventRepository) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.operationalMode = operationalMode;
        this.teamRepository = teamRepository;
        this.incidentRepository = incidentRepository;
        this.syncEventRepository = syncEventRepository;
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "HEALTHY");
        health.put("station_id", stationId);
        health.put("station_name", stationName);
        health.put("mode", operationalMode);
        health.put("uptime_seconds", ManagementFactory.getRuntimeMXBean().getUptime() / 1000);
        health.put("active_teams_count", teamRepository.count());
        health.put("pending_outbox_events", syncEventRepository.countByProcessedFalse());
        health.put("open_incidents_count", incidentRepository.findByStatus(IncidentStatus.RECEIVED).size());

        return ResponseEntity.ok(ApiResponse.ok("Station operational", health));
    }
}

