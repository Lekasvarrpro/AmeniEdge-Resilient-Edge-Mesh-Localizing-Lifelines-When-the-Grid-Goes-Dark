package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.organization.DepartmentCapacity;
import com.ameniedge.organization.DepartmentCapacityRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class HeadcountService {

    private final DepartmentCapacityRepository capacityRepository;

    public HeadcountService(DepartmentCapacityRepository capacityRepository) {
        this.capacityRepository = capacityRepository;
    }

    public int calculateRequiredHeadcount(Incident incident) {
        int people = Math.max(1, incident.getAffectedPeople());
        IncidentCategory category = incident.getCategory();
        if (category == null) return 4;

        return switch (category) {
            case FLOOD -> Math.max(6, 4 + (int) Math.ceil((double) people / 2.0) * 2);
            case FIRE -> Math.max(6, 6 + (int) Math.ceil((double) people / 3.0) * 2);
            case MEDICAL -> Math.max(2, (int) Math.ceil((double) people / 2.0) * 2);
            case TRAPPED -> Math.max(8, 8 + people * 2);
            case MISSING -> Math.max(6, 6 + (int) Math.ceil((double) people / 2.0) * 2);
            case STRUCTURAL_COLLAPSE -> Math.max(8, 8 + people * 2);
            case OTHER -> 4;
        };
    }

    @Transactional
    public DepartmentCapacity getOrCreateCapacityForTeam(String teamId, String stationId, String deptName, String category) {
        return capacityRepository.findByTeamId(teamId).orElseGet(() -> {
            DepartmentCapacity cap = new DepartmentCapacity();
            cap.setId("CAP-" + teamId);
            cap.setTeamId(teamId);
            cap.setStationId(stationId != null ? stationId : "STA-CHN-N-001");
            cap.setDepartmentName(deptName != null ? deptName : "Rescue Unit");
            cap.setCategory(category != null ? category : "OTHER");
            cap.setTotalPersonnel(100);
            cap.setAvailablePersonnel(100);
            cap.setDeployedPersonnel(0);
            cap.setReturningPersonnel(0);
            cap.setOffDutyPersonnel(0);
            cap.setUpdatedAt(Instant.now());
            return capacityRepository.save(cap);
        });
    }

    @Transactional
    public boolean allocatePersonnel(String teamId, int count) {
        Optional<DepartmentCapacity> opt = capacityRepository.findByTeamId(teamId);
        if (opt.isEmpty()) return true;
        DepartmentCapacity cap = opt.get();
        if (cap.getAvailablePersonnel() < count) {
            // Partial dispatch or deficit: dispatch whatever is available if > 0, else 0
            int allocatable = Math.min(cap.getAvailablePersonnel(), count);
            cap.setAvailablePersonnel(cap.getAvailablePersonnel() - allocatable);
            cap.setDeployedPersonnel(cap.getDeployedPersonnel() + allocatable);
            cap.setUpdatedAt(Instant.now());
            capacityRepository.save(cap);
            return false; // indicates deficit
        }
        cap.setAvailablePersonnel(cap.getAvailablePersonnel() - count);
        cap.setDeployedPersonnel(cap.getDeployedPersonnel() + count);
        cap.setUpdatedAt(Instant.now());
        capacityRepository.save(cap);
        return true;
    }

    @Transactional
    public void startReturn(String teamId, int count) {
        Optional<DepartmentCapacity> opt = capacityRepository.findByTeamId(teamId);
        if (opt.isEmpty()) return;
        DepartmentCapacity cap = opt.get();
        int actualDeployed = Math.min(cap.getDeployedPersonnel(), count);
        cap.setDeployedPersonnel(cap.getDeployedPersonnel() - actualDeployed);
        cap.setReturningPersonnel(cap.getReturningPersonnel() + actualDeployed);
        cap.setUpdatedAt(Instant.now());
        capacityRepository.save(cap);
    }

    @Transactional
    public void completeReturn(String teamId, int count) {
        Optional<DepartmentCapacity> opt = capacityRepository.findByTeamId(teamId);
        if (opt.isEmpty()) return;
        DepartmentCapacity cap = opt.get();
        int actualReturning = Math.min(cap.getReturningPersonnel(), count);
        cap.setReturningPersonnel(cap.getReturningPersonnel() - actualReturning);
        cap.setAvailablePersonnel(cap.getAvailablePersonnel() + actualReturning);
        cap.setUpdatedAt(Instant.now());
        capacityRepository.save(cap);
    }

    @Transactional
    public void releaseAllocation(String teamId, int count) {
        Optional<DepartmentCapacity> opt = capacityRepository.findByTeamId(teamId);
        if (opt.isEmpty()) return;
        DepartmentCapacity cap = opt.get();
        int toRestore = Math.min(cap.getDeployedPersonnel(), count);
        cap.setDeployedPersonnel(cap.getDeployedPersonnel() - toRestore);
        cap.setAvailablePersonnel(cap.getAvailablePersonnel() + toRestore);
        cap.setUpdatedAt(Instant.now());
        capacityRepository.save(cap);
    }
}

