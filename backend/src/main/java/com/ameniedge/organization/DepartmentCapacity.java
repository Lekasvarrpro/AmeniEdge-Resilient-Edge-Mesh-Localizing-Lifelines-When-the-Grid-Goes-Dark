package com.ameniedge.organization;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "department_capacity")
public class DepartmentCapacity {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "team_id", nullable = false, length = 64)
    private String teamId;

    @Column(name = "station_id", nullable = false, length = 64)
    private String stationId;

    @Column(name = "department_name", nullable = false, length = 128)
    private String departmentName;

    @Column(nullable = false, length = 64)
    private String category;

    @Column(name = "total_personnel", nullable = false)
    private int totalPersonnel = 100;

    @Column(name = "available_personnel", nullable = false)
    private int availablePersonnel = 100;

    @Column(name = "deployed_personnel", nullable = false)
    private int deployedPersonnel = 0;

    @Column(name = "returning_personnel", nullable = false)
    private int returningPersonnel = 0;

    @Column(name = "off_duty_personnel", nullable = false)
    private int offDutyPersonnel = 0;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public DepartmentCapacity() {}

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTeamId() { return teamId; }
    public void setTeamId(String teamId) { this.teamId = teamId; }
    public String getStationId() { return stationId; }
    public void setStationId(String stationId) { this.stationId = stationId; }
    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public int getTotalPersonnel() { return totalPersonnel; }
    public void setTotalPersonnel(int totalPersonnel) { this.totalPersonnel = totalPersonnel; }
    public int getAvailablePersonnel() { return availablePersonnel; }
    public void setAvailablePersonnel(int availablePersonnel) { this.availablePersonnel = availablePersonnel; }
    public int getDeployedPersonnel() { return deployedPersonnel; }
    public void setDeployedPersonnel(int deployedPersonnel) { this.deployedPersonnel = deployedPersonnel; }
    public int getReturningPersonnel() { return returningPersonnel; }
    public void setReturningPersonnel(int returningPersonnel) { this.returningPersonnel = returningPersonnel; }
    public int getOffDutyPersonnel() { return offDutyPersonnel; }
    public void setOffDutyPersonnel(int offDutyPersonnel) { this.offDutyPersonnel = offDutyPersonnel; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}

