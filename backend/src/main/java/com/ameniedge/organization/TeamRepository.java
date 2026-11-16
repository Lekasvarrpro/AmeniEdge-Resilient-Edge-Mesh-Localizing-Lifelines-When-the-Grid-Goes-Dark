package com.ameniedge.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByStationId(String stationId);
    List<Team> findByStationIdAndStatus(String stationId, TeamStatus status);
}

