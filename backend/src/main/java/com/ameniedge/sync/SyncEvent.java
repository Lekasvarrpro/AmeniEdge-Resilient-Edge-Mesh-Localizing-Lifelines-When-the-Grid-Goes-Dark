package com.ameniedge.sync;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sync_events")
public class SyncEvent {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "event_id", unique = true, nullable = false, length = 64)
    private String eventId;

    @Column(name = "origin_station_id", nullable = false, length = 64)
    private String originStationId;

    @Column(name = "entity_type", nullable = false, length = 64)
    private String entityType;

    @Column(name = "entity_id", nullable = false, length = 64)
    private String entityId;

    @Column(nullable = false, length = 32)
    private String operation;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String payload;

    @Column(name = "vector_sequence")
    private long vectorSequence = 1;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    private boolean processed = false;

    @Column(name = "conflict_flag")
    private boolean conflictFlag = false;

    public SyncEvent() {}

    public SyncEvent(String id, String eventId, String originStationId, String entityType, String entityId, String operation, String payload, long vectorSequence) {
        this.id = id;
        this.eventId = eventId;
        this.originStationId = originStationId;
        this.entityType = entityType;
        this.entityId = entityId;
        this.operation = operation;
        this.payload = payload;
        this.vectorSequence = vectorSequence;
        this.createdAt = Instant.now();
        this.processed = false;
        this.conflictFlag = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public String getOriginStationId() { return originStationId; }
    public void setOriginStationId(String originStationId) { this.originStationId = originStationId; }
    public String getEntityType() { return entityType; }
    public void setEntityType(String entityType) { this.entityType = entityType; }
    public String getEntityId() { return entityId; }
    public void setEntityId(String entityId) { this.entityId = entityId; }
    public String getOperation() { return operation; }
    public void setOperation(String operation) { this.operation = operation; }
    public String getPayload() { return payload; }
    public void setPayload(String payload) { this.payload = payload; }
    public long getVectorSequence() { return vectorSequence; }
    public void setVectorSequence(long vectorSequence) { this.vectorSequence = vectorSequence; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public boolean isProcessed() { return processed; }
    public void setProcessed(boolean processed) { this.processed = processed; }
    public boolean isConflictFlag() { return conflictFlag; }
    public void setConflictFlag(boolean conflictFlag) { this.conflictFlag = conflictFlag; }
}
