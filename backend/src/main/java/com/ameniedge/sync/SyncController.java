package com.ameniedge.sync;

import com.ameniedge.common.ApiResponse;
import com.ameniedge.sync.dto.SyncBatchRequest;
import com.ameniedge.sync.dto.SyncBatchResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/events")
    public ResponseEntity<ApiResponse<SyncBatchResponse>> syncEvents(@Valid @RequestBody SyncBatchRequest batch) {
        SyncBatchResponse response = syncService.processBatch(batch);
        return ResponseEntity.ok(ApiResponse.ok("Sync batch processed", response));
    }

    @GetMapping("/events")
    public ResponseEntity<ApiResponse<List<SyncEvent>>> getEvents(
            @RequestParam(defaultValue = "0") long since_sequence) {
        List<SyncEvent> events = syncService.getEventsSince(since_sequence);
        return ResponseEntity.ok(ApiResponse.ok(events));
    }
}
