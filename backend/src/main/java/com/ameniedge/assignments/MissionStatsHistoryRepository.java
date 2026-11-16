package com.ameniedge.assignments;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MissionStatsHistoryRepository extends JpaRepository<MissionStatsHistory, String> {
    List<MissionStatsHistory> findTop5ByDepartmentIdOrderByCompletedAtDesc(String departmentId);
    List<MissionStatsHistory> findTop5ByCategoryOrderByCompletedAtDesc(String category);
    
    @Query("SELECT AVG(m.actualTravelSeconds) FROM MissionStatsHistory m WHERE m.departmentId = :departmentId")
    Double getAverageTravelSecondsByDepartment(String departmentId);

    @Query("SELECT AVG(m.actualWorkSeconds) FROM MissionStatsHistory m WHERE m.departmentId = :departmentId")
    Double getAverageWorkSecondsByDepartment(String departmentId);

    @Query("SELECT AVG(m.actualReturnSeconds) FROM MissionStatsHistory m WHERE m.departmentId = :departmentId")
    Double getAverageReturnSecondsByDepartment(String departmentId);
}

