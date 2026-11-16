package com.ameniedge.incidents;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, String> {
    Optional<Incident> findByClientReferenceId(String clientReferenceId);
    List<Incident> findByStationIdOrderByCreatedAtDesc(String stationId);
    List<Incident> findByStationIdAndStatus(String stationId, IncidentStatus status);
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByAssignedTeamId(String assignedTeamId);
}

