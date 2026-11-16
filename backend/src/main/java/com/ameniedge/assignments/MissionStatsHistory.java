package com.ameniedge.assignments;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "mission_stats_history")
public class MissionStatsHistory {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "department_id", nullable = false, length = 64)
    private String departmentId;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "people_affected", nullable = false)
    private int peopleAffected = 1;

    @Column(name = "actual_travel_seconds", nullable = false)
    private int actualTravelSeconds;

    @Column(name = "actual_work_seconds", nullable = false)
    private int actualWorkSeconds;

    @Column(name = "actual_return_seconds", nullable = false)
    private int actualReturnSeconds;

    @Column(nullable = false, length = 64)
    private String outcome = "SUCCESSFUL_EXTRACTION";

    @Column(name = "completed_at")
    private Instant completedAt = Instant.now();

    public MissionStatsHistory() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getDepartmentId() { return departmentId; }
    public void setDepartmentId(String departmentId) { this.departmentId = departmentId; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getPeopleAffected() { return peopleAffected; }
    public void setPeopleAffected(int peopleAffected) { this.peopleAffected = peopleAffected; }
    public int getActualTravelSeconds() { return actualTravelSeconds; }
    public void setActualTravelSeconds(int actualTravelSeconds) { this.actualTravelSeconds = actualTravelSeconds; }
    public int getActualWorkSeconds() { return actualWorkSeconds; }
    public void setActualWorkSeconds(int actualWorkSeconds) { this.actualWorkSeconds = actualWorkSeconds; }
    public int getActualReturnSeconds() { return actualReturnSeconds; }
    public void setActualReturnSeconds(int actualReturnSeconds) { this.actualReturnSeconds = actualReturnSeconds; }
    public String getOutcome() { return outcome; }
    public void setOutcome(String outcome) { this.outcome = outcome; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
}

