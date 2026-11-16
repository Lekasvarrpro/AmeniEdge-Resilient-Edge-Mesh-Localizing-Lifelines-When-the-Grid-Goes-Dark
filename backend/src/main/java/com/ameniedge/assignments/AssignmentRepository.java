package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    List<Assignment> findByIncidentId(String incidentId);
    List<Assignment> findByTeamId(String teamId);
    List<Assignment> findByStatus(AssignmentStatus status);
    List<Assignment> findByTeamIdAndStatus(String teamId, AssignmentStatus status);
    List<Assignment> findByLifecycleState(String lifecycleState);
    List<Assignment> findByTeamIdAndLifecycleState(String teamId, String lifecycleState);
    List<Assignment> findByTeamIdOrderByCreatedAtDesc(String teamId);
    List<Assignment> findByTeamIdAndStatusOrderByCreatedAtDesc(String teamId, AssignmentStatus status);
    List<Assignment> findByStationIdOrderByCreatedAtDesc(String stationId);
    Optional<Assignment> findTopByIncidentIdOrderByCreatedAtDesc(String incidentId);
    Optional<Assignment> findTopByTeamIdAndStatus(String teamId, AssignmentStatus status);
    Optional<Assignment> findTopByTeamIdAndStatusOrderByCreatedAtDesc(String teamId, AssignmentStatus status);
}


