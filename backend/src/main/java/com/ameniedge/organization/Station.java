package com.ameniedge.organization;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stations")
public class Station {

    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false)
    private String name;

    @Column(name = "region_id", nullable = false, length = 64)
    private String regionId;

    @Column(nullable = false)
    private double latitude;

    @Column(nullable = false)
    private double longitude;

    @Column(name = "coverage_radius_meters")
    private int coverageRadiusMeters = 5000;

    @Column(length = 32)
    private String status = "ONLINE";

    @Column(name = "created_at", updatable = false)
    private Instant createdAt = Instant.now();

    public Station() {}

    public Station(String id, String name, String regionId, double latitude, double longitude, int coverageRadiusMeters) {
        this.id = id;
        this.name = name;
        this.regionId = regionId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.coverageRadiusMeters = coverageRadiusMeters;
        this.status = "ONLINE";
        this.createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRegionId() { return regionId; }
    public void setRegionId(String regionId) { this.regionId = regionId; }
    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }
    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
    public int getCoverageRadiusMeters() { return coverageRadiusMeters; }
    public void setCoverageRadiusMeters(int coverageRadiusMeters) { this.coverageRadiusMeters = coverageRadiusMeters; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}

