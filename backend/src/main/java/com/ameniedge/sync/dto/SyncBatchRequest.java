package com.ameniedge.sync.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.Map;

public class SyncBatchRequest {

    @NotBlank
    private String originStationId;

    @NotEmpty
    private List<SyncEventItem> events;

    @NotBlank
    private String hmacSignature;

    public SyncBatchRequest() {}

    public String getOriginStationId() { return originStationId; }
    public void setOriginStationId(String originStationId) { this.originStationId = originStationId; }
    public List<SyncEventItem> getEvents() { return events; }
    public void setEvents(List<SyncEventItem> events) { this.events = events; }
    public String getHmacSignature() { return hmacSignature; }
    public void setHmacSignature(String hmacSignature) { this.hmacSignature = hmacSignature; }

    public static class SyncEventItem {
        private String eventId;
        private String entityType;
        private String entityId;
        private String operation;
        private Map<String, Object> payload;
        private long vectorSequence;

        public String getEventId() { return eventId; }
        public void setEventId(String eventId) { this.eventId = eventId; }
        public String getEntityType() { return entityType; }
        public void setEntityType(String entityType) { this.entityType = entityType; }
        public String getEntityId() { return entityId; }
        public void setEntityId(String entityId) { this.entityId = entityId; }
        public String getOperation() { return operation; }
        public void setOperation(String operation) { this.operation = operation; }
        public Map<String, Object> getPayload() { return payload; }
        public void setPayload(Map<String, Object> payload) { this.payload = payload; }
        public long getVectorSequence() { return vectorSequence; }
        public void setVectorSequence(long vectorSequence) { this.vectorSequence = vectorSequence; }
    }
}
