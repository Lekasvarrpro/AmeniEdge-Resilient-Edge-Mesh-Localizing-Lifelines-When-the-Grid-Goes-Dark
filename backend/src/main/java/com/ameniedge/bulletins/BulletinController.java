package com.ameniedge.bulletins;

import com.ameniedge.auth.UserPrincipal;
import com.ameniedge.common.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bulletins")
public class BulletinController {

    private final BulletinRepository bulletinRepository;

    public BulletinController(BulletinRepository bulletinRepository) {
        this.bulletinRepository = bulletinRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Bulletin>>> listBulletins(@RequestParam(required = false) String station_id) {
        if (station_id != null && !station_id.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok(bulletinRepository.findByStationIdOrderByPublishedAtDesc(station_id)));
        }
        return ResponseEntity.ok(ApiResponse.ok(bulletinRepository.findAllByOrderByPublishedAtDesc()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STATION_LEADER', 'REGIONAL_SUPERVISOR', 'ORG_ADMIN')")
    public ResponseEntity<ApiResponse<Bulletin>> createBulletin(
            @RequestBody Bulletin bulletin,
            @AuthenticationPrincipal UserPrincipal principal) {
        bulletin.setId("BLT-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        if (principal != null) {
            bulletin.setPublishedBy(principal.getId());
            if (bulletin.getStationId() == null) {
                bulletin.setStationId(principal.getStationId());
            }
        }
        Bulletin saved = bulletinRepository.save(bulletin);
        return new ResponseEntity<>(ApiResponse.ok("Bulletin published", saved), HttpStatus.CREATED);
    }
}
