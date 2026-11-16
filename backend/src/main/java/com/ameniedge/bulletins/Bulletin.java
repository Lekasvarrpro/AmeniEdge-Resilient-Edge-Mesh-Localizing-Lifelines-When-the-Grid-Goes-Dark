package com.ameniedge.bulletins;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "bulletins")
public class Bulletin {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(length = 32)
    private String severity = "INFO";

    @Column(name = "station_id", length = 64)
    private String stationId;

    @Column(name = "published_by", length = 64)
    private String publishedBy;

    @Column(name = "published_at", updatable = false)
    private Instant publishedAt = Instant.now();

    public Bulletin() {}

    public Bulletin(String id, String title, String content, String severity, String stationId, String publishedBy) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.severity = severity;
        this.stationId = stationId;
        this.publishedBy = publishedBy;
        this.publishedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public String getPublishedBy() { return publishedBy; }
    public void setPublishedBy(String publishedBy) { this.publishedBy = publishedBy; }
    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }
}

