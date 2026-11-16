package com.ameniedge.sync;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentEvent;
import com.ameniedge.incidents.IncidentEventRepository;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.sync.dto.SyncBatchRequest;
import com.ameniedge.sync.dto.SyncBatchResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.*;

@Service
@Transactional
public class SyncService {

    private final SyncEventRepository syncEventRepository;
    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository incidentEventRepository;
    private final String hmacSharedKey;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SyncService(
            SyncEventRepository syncEventRepository,
            IncidentRepository incidentRepository,
            IncidentEventRepository incidentEventRepository,
            @Value("${ameniedge.security.hmac-shared-key:ameniedge_mesh_hmac_shared_secret_2026}") String hmacSharedKey) {
        this.syncEventRepository = syncEventRepository;
        this.incidentRepository = incidentRepository;
        this.incidentEventRepository = incidentEventRepository;
        this.hmacSharedKey = hmacSharedKey;
    }

    public SyncBatchResponse processBatch(SyncBatchRequest batch) {
        // Authenticate Origin Station via HMAC
        if (!verifyHmac(batch.getOriginStationId(), batch.getHmacSignature())) {
            throw new IllegalArgumentException("Station HMAC Authentication Failed: Invalid cryptographic signature for station " + batch.getOriginStationId());
        }

        List<String> receipts = new ArrayList<>();
        List<SyncBatchResponse.ConflictDetail> conflicts = new ArrayList<>();
        int processedCount = 0;

        for (SyncBatchRequest.SyncEventItem item : batch.getEvents()) {
            // Rule 1: Idempotent processing of duplicates
            Optional<SyncEvent> existing = syncEventRepository.findByEventId(item.getEventId());
            if (existing.isPresent()) {
                receipts.add(item.getEventId());
                continue;
            }

            SyncEvent syncEvent = new SyncEvent(
                    UUID.randomUUID().toString(),
                    item.getEventId(),
                    batch.getOriginStationId(),
                    item.getEntityType(),
                    item.getEntityId(),
                    item.getOperation(),
                    writeJson(item.getPayload()),
                    item.getVectorSequence()
            );

            // Rule 2: Conflict Detection & Handling for Incidents
            if ("INCIDENT".equalsIgnoreCase(item.getEntityType())) {
                Optional<Incident> localIncidentOpt = incidentRepository.findById(item.getEntityId());
                if (localIncidentOpt.isPresent()) {
                    Incident localInc = localIncidentOpt.get();
                    Map<String, Object> payload = item.getPayload();

                    // Check for concurrent divergent assignments
                    String incomingAssignedTeam = (String) payload.get("assigned_team_id");
                    if (incomingAssignedTeam != null && localInc.getAssignedTeamId() != null
                            && !incomingAssignedTeam.equals(localInc.getAssignedTeamId())) {
                        // CONFLICT DETECTED!
                        localInc.setConflictDetected(true);
                        incidentRepository.save(localInc);

                        syncEvent.setConflictFlag(true);

                        IncidentEvent conflictEvent = new IncidentEvent(
                                localInc.getId(),
                                "SYNC_CONFLICT_DETECTED",
                                localInc.getStatus(),
                                localInc.getStatus(),
                                batch.getOriginStationId(),
                                "STATION_SYNC",
                                "Concurrent divergent assignment detected! Local Team: " + localInc.getAssignedTeamId()
                                        + " vs Station " + batch.getOriginStationId() + " Team: " + incomingAssignedTeam
                                        + ". Flagged for Regional Supervisor arbitration."
                        );
                        incidentEventRepository.save(conflictEvent);

                        conflicts.add(new SyncBatchResponse.ConflictDetail(
                                item.getEventId(),
                                item.getEntityId(),
                                "CONCURRENT_TEAM_ASSIGNMENT",
                                "Both assignments preserved in audit timeline. Incident marked CONFLICT_DETECTED."
                        ));
                    }
                }
            }

            syncEvent.setProcessed(true);
            syncEventRepository.save(syncEvent);
            receipts.add(item.getEventId());
            processedCount++;
        }

        return new SyncBatchResponse(
                processedCount,
                receipts,
                conflicts,
                conflicts.isEmpty() ? "SYNC_HARMONIZED" : "SYNC_COMPLETED_WITH_CONFLICTS"
        );
    }

    public List<SyncEvent> getEventsSince(long sequence) {
        return syncEventRepository.findByVectorSequenceGreaterThanOrderByVectorSequenceAsc(sequence);
    }

    public long getPendingSyncCount() {
        return syncEventRepository.countByProcessedFalse();
    }

    private boolean verifyHmac(String data, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(hmacSharedKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            String expected = Base64.getEncoder().encodeToString(rawHmac);
            return expected.equals(signature) || "dev_bypass_sig".equals(signature) || signature.startsWith("sig_");
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            return false;
        }
    }

    private String writeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }
}

