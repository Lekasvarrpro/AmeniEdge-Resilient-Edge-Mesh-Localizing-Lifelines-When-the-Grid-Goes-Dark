package com.ameniedge.volunteers;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "volunteer_shifts")
public class VolunteerShift {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "user_id", nullable = false, length = 64)
    private String userId;

    @Column(name = "station_id", nullable = false, length = 64)
    private String stationId;

    @Column(name = "check_in_time", nullable = false, updatable = false)
    private Instant checkInTime = Instant.now();

    @Column(name = "check_out_time")
    private Instant checkOutTime;

    @Column(length = 32)
    private String status = "ACTIVE";

    @Column(name = "skills_applied", columnDefinition = "TEXT")
    private String skillsApplied;

    public VolunteerShift() {}

    public VolunteerShift(String id, String userId, String stationId, String skillsApplied) {
        this.id = id;
        this.userId = userId;
        this.stationId = stationId;
        this.skillsApplied = skillsApplied;
        this.checkInTime = Instant.now();
        this.status = "ACTIVE";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public Instant getCheckInTime() { return checkInTime; }
    public void setCheckInTime(Instant checkInTime) { this.checkInTime = checkInTime; }
    public Instant getCheckOutTime() { return checkOutTime; }
    public void setCheckOutTime(Instant checkOutTime) { this.checkOutTime = checkOutTime; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getSkillsApplied() { return skillsApplied; }
    public void setSkillsApplied(String skillsApplied) { this.skillsApplied = skillsApplied; }
}

