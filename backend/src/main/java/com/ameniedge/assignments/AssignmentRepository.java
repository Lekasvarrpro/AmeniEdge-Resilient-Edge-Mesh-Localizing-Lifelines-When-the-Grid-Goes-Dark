package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, String> {
    List<Assignment> findByIncidentId(String incidentId);
    List<Assignment> findByTeamId(String teamId);
    Optional<Assignment> findTopByIncidentIdOrderByCreatedAtDesc(String incidentId);
    Optional<Assignment> findTopByTeamIdAndStatus(String teamId, AssignmentStatus status);
}
