package com.ameniedge.organization;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentCapacityRepository extends JpaRepository<DepartmentCapacity, String> {
    Optional<DepartmentCapacity> findByTeamId(String teamId);
    List<DepartmentCapacity> findByStationId(String stationId);
    List<DepartmentCapacity> findByCategory(String category);
}

