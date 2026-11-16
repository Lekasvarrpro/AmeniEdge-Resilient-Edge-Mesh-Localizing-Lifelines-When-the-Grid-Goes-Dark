package com.ameniedge.common;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/system")
public class SystemController {

    private final SystemResetService systemResetService;

    public SystemController(SystemResetService systemResetService) {
        this.systemResetService = systemResetService;
    }

    @PostMapping("/reset-demo-data")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetDemoData() {
        systemResetService.resetAllDemoData();
        return ResponseEntity.ok(ApiResponse.ok("Demo incidents purged and personnel counters reset to baseline",
                Map.of("status", "SUCCESS", "message", "Database ready for live citizen reports")));
    }
}

