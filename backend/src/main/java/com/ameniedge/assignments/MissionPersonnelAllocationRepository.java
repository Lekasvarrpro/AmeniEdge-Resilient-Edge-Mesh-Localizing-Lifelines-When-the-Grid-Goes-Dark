package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MissionPersonnelAllocationRepository extends JpaRepository<MissionPersonnelAllocation, String> {
    Optional<MissionPersonnelAllocation> findByAssignmentId(String assignmentId);
    List<MissionPersonnelAllocation> findByTeamIdAndStatus(String teamId, String status);
    List<MissionPersonnelAllocation> findByStatus(String status);
}

