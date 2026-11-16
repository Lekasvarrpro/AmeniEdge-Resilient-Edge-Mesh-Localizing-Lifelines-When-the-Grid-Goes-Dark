package com.ameniedge.volunteers;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<VolunteerShift, String> {
    List<VolunteerShift> findByStationIdAndStatus(String stationId, String status);
    Optional<VolunteerShift> findTopByUserIdAndStatus(String userId, String status);
}

