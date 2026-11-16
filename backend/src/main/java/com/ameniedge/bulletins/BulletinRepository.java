package com.ameniedge.bulletins;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BulletinRepository extends JpaRepository<Bulletin, String> {
    List<Bulletin> findAllByOrderByPublishedAtDesc();
    List<Bulletin> findByStationIdOrderByPublishedAtDesc(String stationId);
}

