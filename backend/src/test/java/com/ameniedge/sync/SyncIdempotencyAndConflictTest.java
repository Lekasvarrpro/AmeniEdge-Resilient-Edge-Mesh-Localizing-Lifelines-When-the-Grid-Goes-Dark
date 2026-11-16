package com.ameniedge.sync;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentEventRepository;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.sync.dto.SyncBatchRequest;
import com.ameniedge.sync.dto.SyncBatchResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SyncIdempotencyAndConflictTest {

    @Mock
    private SyncEventRepository syncEventRepository;

    @Mock
    private IncidentRepository incidentRepository;

    @Mock
    private IncidentEventRepository incidentEventRepository;

    private SyncService syncService;

    @BeforeEach
    void setUp() {
        syncService = new SyncService(syncEventRepository, incidentRepository, incidentEventRepository, "test-secret-key");
    }

    @Test
    @DisplayName("Duplicate event replay returns receipt without duplicating records (Idempotent)")
    void duplicateEventIdempotency() {
        String eventId = "EVT-DUP-001";
        SyncEvent existing = new SyncEvent("ID-1", eventId, "STA-CHN-S-002", "INCIDENT", "INC-100", "CREATE", "{}", 1);

        when(syncEventRepository.findByEventId(eventId)).thenReturn(Optional.of(existing));

        SyncBatchRequest.SyncEventItem item = new SyncBatchRequest.SyncEventItem();
        item.setEventId(eventId);
        item.setEntityType("INCIDENT");
        item.setEntityId("INC-100");
        item.setOperation("CREATE");
        item.setPayload(Collections.emptyMap());
        item.setVectorSequence(1);

        SyncBatchRequest req = new SyncBatchRequest();
        req.setOriginStationId("STA-CHN-S-002");
        req.setHmacSignature("sig_test_valid");
        req.setEvents(Collections.singletonList(item));

        SyncBatchResponse res = syncService.processBatch(req);

        assertThat(res.getReceipts()).contains(eventId);
        assertThat(res.getProcessedCount()).isEqualTo(0); // Did not reprocess
    }

    @Test
    @DisplayName("Concurrent divergent assignment between Station A and Station B flags conflict and preserves timeline")
    void concurrentAssignmentConflictDetection() {
        String eventId = "EVT-NEW-002";
        when(syncEventRepository.findByEventId(eventId)).thenReturn(Optional.empty());

        // Local incident already assigned to TEAM-ALPHA
        Incident localIncident = new Incident();
        localIncident.setId("INC-SHARED-01");
        localIncident.setAssignedTeamId("TEAM-ALPHA");
        localIncident.setStatus(IncidentStatus.ASSIGNED);
        when(incidentRepository.findById("INC-SHARED-01")).thenReturn(Optional.of(localIncident));

        // Incoming event from Station South assigns TEAM-BETA to same incident
        SyncBatchRequest.SyncEventItem item = new SyncBatchRequest.SyncEventItem();
        item.setEventId(eventId);
        item.setEntityType("INCIDENT");
        item.setEntityId("INC-SHARED-01");
        item.setOperation("ASSIGN");
        Map<String, Object> payload = new HashMap<>();
        payload.put("assigned_team_id", "TEAM-BETA");
        item.setPayload(payload);
        item.setVectorSequence(2);

        SyncBatchRequest req = new SyncBatchRequest();
        req.setOriginStationId("STA-CHN-S-002");
        req.setHmacSignature("sig_test_valid");
        req.setEvents(Collections.singletonList(item));

        SyncBatchResponse res = syncService.processBatch(req);

        // Then:
        assertThat(localIncident.isConflictDetected()).isTrue();
        assertThat(res.getConflicts()).hasSize(1);
        assertThat(res.getConflicts().get(0).getConflictType()).isEqualTo("CONCURRENT_TEAM_ASSIGNMENT");
        assertThat(res.getStatus()).isEqualTo("SYNC_COMPLETED_WITH_CONFLICTS");
    }
}

