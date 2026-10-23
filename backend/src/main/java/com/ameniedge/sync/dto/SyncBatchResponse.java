package com.ameniedge.sync.dto;

import java.util.ArrayList;
import java.util.List;

public class SyncBatchResponse {
    private int processedCount;
    private List<String> receipts = new ArrayList<>();
    private List<ConflictDetail> conflicts = new ArrayList<>();
    private String status;

    public SyncBatchResponse() {}

    public SyncBatchResponse(int processedCount, List<String> receipts, List<ConflictDetail> conflicts, String status) {
        this.processedCount = processedCount;
        this.receipts = receipts;
        this.conflicts = conflicts;
        this.status = status;
    }

    public int getProcessedCount() { return processedCount; }
    public void setProcessedCount(int processedCount) { this.processedCount = processedCount; }
    public List<String> getReceipts() { return receipts; }
    public void setReceipts(List<String> receipts) { this.receipts = receipts; }
    public List<ConflictDetail> getConflicts() { return conflicts; }
    public void setConflicts(List<ConflictDetail> conflicts) { this.conflicts = conflicts; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public static class ConflictDetail {
        private String eventId;
        private String entityId;
        private String conflictType;
        private String resolution;

        public ConflictDetail() {}

        public ConflictDetail(String eventId, String entityId, String conflictType, String resolution) {
            this.eventId = eventId;
            this.entityId = entityId;
            this.conflictType = conflictType;
            this.resolution = resolution;
        }

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getConflictType() { return conflictType; }
        public void setConflictType(String conflictType) { this.conflictType = conflictType; }
        public String getResolution() { return resolution; }
        public void setResolution(String resolution) { this.resolution = resolution; }
    }
}
