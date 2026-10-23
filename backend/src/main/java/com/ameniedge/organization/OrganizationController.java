package com.ameniedge.organization;

import com.ameniedge.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class OrganizationController {

    private final RegionRepository regionRepository;
    private final StationRepository stationRepository;
    private final TeamRepository teamRepository;

    public OrganizationController(
            RegionRepository regionRepository,
            StationRepository stationRepository,
            TeamRepository teamRepository) {
        this.regionRepository = regionRepository;
        this.stationRepository = stationRepository;
        this.teamRepository = teamRepository;
    }

    @GetMapping("/regions")
    public ResponseEntity<ApiResponse<List<Region>>> getAllRegions() {
        return ResponseEntity.ok(ApiResponse.ok(regionRepository.findAll()));
    }

    @GetMapping("/stations")
    public ResponseEntity<ApiResponse<List<Station>>> getAllStations(@RequestParam(required = false) String regionId) {
        if (regionId != null && !regionId.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(stationRepository.findByRegionId(regionId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(stationRepository.findAll()));
    }

    @PostMapping("/stations")
    @PreAuthorize("hasRole('ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Station>> createStation(@RequestBody Station station) {
        if (station.getId() == null || station.getId().isBlank()) {
            station.setId("STA-GEN-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
        }
        Station saved = stationRepository.save(station);
        return new ResponseEntity<>(ApiResponse.ok("Station created", saved), HttpStatus.CREATED);
    }

    @GetMapping("/teams")
    public ResponseEntity<ApiResponse<List<Team>>> getAllTeams(
            @RequestParam(required = false) String stationId,
            @RequestParam(required = false) TeamStatus status) {
        if (stationId != null && status != null) {
            return ResponseEntity.ok(ApiResponse.ok(teamRepository.findByStationIdAndStatus(stationId, status)));
        }
        if (stationId != null) {
            return ResponseEntity.ok(ApiResponse.ok(teamRepository.findByStationId(stationId)));
        }
        return ResponseEntity.ok(ApiResponse.ok(teamRepository.findAll()));
    }

    @PostMapping("/teams")
    @PreAuthorize("hasAnyRole('ORG_ADMIN', 'STATION_LEADER')")
    public ResponseEntity<ApiResponse<Team>> createTeam(@RequestBody Team team) {
        if (team.getId() == null || team.getId().isBlank()) {
            team.setId("TEAM-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        }
        Team saved = teamRepository.save(team);
        return new ResponseEntity<>(ApiResponse.ok("Team created", saved), HttpStatus.CREATED);
    }

    @PatchMapping("/teams/{id}/status")
    public ResponseEntity<ApiResponse<Team>> updateTeamStatus(
            @PathVariable String id,
            @RequestBody TeamStatusUpdateRequest update) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Team not found with id: " + id));
        team.setStatus(update.getStatus());
        if (update.getLatitude() != null) team.setCurrentLatitude(update.getLatitude());
        if (update.getLongitude() != null) team.setCurrentLongitude(update.getLongitude());
        Team saved = teamRepository.save(team);
        return ResponseEntity.ok(ApiResponse.ok("Team status updated", saved));
    }

    public static class TeamStatusUpdateRequest {
        private TeamStatus status;
        private Double latitude;
        private Double longitude;

        public TeamStatus getStatus() { return status; }
        public void setStatus(TeamStatus status) { this.status = status; }
        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }
        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }
}
