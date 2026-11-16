package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleTrackRepository extends JpaRepository<VehicleTrack, String> {
    Optional<VehicleTrack> findByAssignmentId(String assignmentId);
    Optional<VehicleTrack> findByIncidentId(String incidentId);
    List<VehicleTrack> findByTeamIdAndStatus(String teamId, String status);
    List<VehicleTrack> findByStatus(String status);
}

