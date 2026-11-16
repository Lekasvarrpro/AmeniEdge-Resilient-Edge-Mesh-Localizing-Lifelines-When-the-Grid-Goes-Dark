package com.ameniedge.incidents;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentEventRepository extends JpaRepository<IncidentEvent, String> {
    List<IncidentEvent> findByIncidentIdOrderByTimestampAsc(String incidentId);
}

