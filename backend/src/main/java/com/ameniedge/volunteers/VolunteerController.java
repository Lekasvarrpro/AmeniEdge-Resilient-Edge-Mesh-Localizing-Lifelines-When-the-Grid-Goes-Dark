package com.ameniedge.volunteers;

import com.ameniedge.auth.UserPrincipal;
import com.ameniedge.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/volunteers")
public class VolunteerController {

    private final VolunteerRepository volunteerRepository;

    public VolunteerController(VolunteerRepository volunteerRepository) {
        this.volunteerRepository = volunteerRepository;
    }

    @PostMapping("/checkin")
    public ResponseEntity<ApiResponse<VolunteerShift>> checkIn(
            @RequestBody CheckInRequest req,
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : req.getUserId();
        String stationId = principal != null && principal.getStationId() != null ? principal.getStationId() : req.getStationId();

        VolunteerShift shift = new VolunteerShift(
                "SHF-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(),
                userId,
                stationId,
                req.getSkillsApplied()
        );
        VolunteerShift saved = volunteerRepository.save(shift);
        return ResponseEntity.ok(ApiResponse.ok("Volunteer checked in", saved));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<VolunteerShift>> checkOut(
            @AuthenticationPrincipal UserPrincipal principal) {
        String userId = principal != null ? principal.getId() : "USR-VOL-001";
        Optional<VolunteerShift> activeOpt = volunteerRepository.findTopByUserIdAndStatus(userId, "ACTIVE");
        if (activeOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No active check-in found for user"));
        }
        VolunteerShift shift = activeOpt.get();
        shift.setStatus("COMPLETED");
        shift.setCheckOutTime(Instant.now());
        VolunteerShift saved = volunteerRepository.save(shift);
        return ResponseEntity.ok(ApiResponse.ok("Volunteer checked out", saved));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VolunteerShift>>> listActive(@RequestParam(required = false) String station_id) {
        if (station_id != null) {
            return ResponseEntity.ok(ApiResponse.ok(volunteerRepository.findByStationIdAndStatus(station_id, "ACTIVE")));
        }
        return ResponseEntity.ok(ApiResponse.ok(volunteerRepository.findAll()));
    }

    public static class CheckInRequest {
        private String userId;
        private String stationId;
        private String skillsApplied;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public String getStationId() { return stationId; }
        public void setStationId(String stationId) { this.stationId = stationId; }
        public String getSkillsApplied() { return skillsApplied; }
        public void setSkillsApplied(String skillsApplied) { this.skillsApplied = skillsApplied; }
    }
}
