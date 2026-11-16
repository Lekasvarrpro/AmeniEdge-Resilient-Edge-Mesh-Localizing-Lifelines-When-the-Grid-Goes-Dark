package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface MissionEstimatesRepository extends JpaRepository<MissionEstimates, String> {
    Optional<MissionEstimates> findByIncidentId(String incidentId);
}

