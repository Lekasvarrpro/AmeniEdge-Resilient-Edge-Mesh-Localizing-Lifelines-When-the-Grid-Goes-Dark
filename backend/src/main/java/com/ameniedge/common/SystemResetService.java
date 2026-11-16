package com.ameniedge.common;

import com.ameniedge.assignments.*;
import com.ameniedge.audit.AuditLogRepository;
import com.ameniedge.incidents.IncidentEventRepository;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.organization.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SystemResetService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository eventRepository;
    private final AssignmentRepository assignmentRepository;
    private final TeamRepository teamRepository;
    private final DepartmentCapacityRepository capacityRepository;

    @Autowired(required = false)
    private VehicleTrackRepository vehicleTrackRepository;

    @Autowired(required = false)
    private MissionPersonnelAllocationRepository allocationRepository;

    @Autowired(required = false)
    private MissionEstimatesRepository estimatesRepository;

    @Autowired(required = false)
    private MissionStatsHistoryRepository historyRepository;

    @Autowired(required = false)
    private AuditLogRepository auditLogRepository;

    public SystemResetService(
            IncidentRepository incidentRepository,
            IncidentEventRepository eventRepository,
            AssignmentRepository assignmentRepository,
            TeamRepository teamRepository,
            DepartmentCapacityRepository capacityRepository) {
        this.incidentRepository = incidentRepository;
        this.eventRepository = eventRepository;
        this.assignmentRepository = assignmentRepository;
        this.teamRepository = teamRepository;
        this.capacityRepository = capacityRepository;
    }

    public void resetAllDemoData() {
        // 1. Purge all transactional records
        if (vehicleTrackRepository != null) vehicleTrackRepository.deleteAllInBatch();
        if (allocationRepository != null) allocationRepository.deleteAllInBatch();
        if (estimatesRepository != null) estimatesRepository.deleteAllInBatch();
        if (historyRepository != null) historyRepository.deleteAllInBatch();

        assignmentRepository.deleteAllInBatch();
        eventRepository.deleteAllInBatch();
        incidentRepository.deleteAllInBatch();

        if (auditLogRepository != null) {
            try {
                auditLogRepository.deleteAllInBatch();
            } catch (Exception ignored) {}
        }

        // 2. Reset team counters
        List<Team> teams = teamRepository.findAll();
        for (Team team : teams) {
            team.setStatus(TeamStatus.AVAILABLE);
            team.setActiveIncidentCount(0);
            teamRepository.save(team);
        }

        // 3. Reset department capacity counters
        if (capacityRepository != null) {
            List<DepartmentCapacity> capacities = capacityRepository.findAll();
            for (DepartmentCapacity cap : capacities) {
                cap.setAvailablePersonnel(cap.getTotalPersonnel());
                cap.setDeployedPersonnel(0);
                cap.setReturningPersonnel(0);
                cap.setOffDutyPersonnel(0);
                capacityRepository.save(cap);
            }
        }
    }
}

