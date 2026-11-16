package com.ameniedge.sync;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyncEventRepository extends JpaRepository<SyncEvent, String> {
    Optional<SyncEvent> findByEventId(String eventId);
    List<SyncEvent> findByVectorSequenceGreaterThanOrderByVectorSequenceAsc(long sequence);
    List<SyncEvent> findByProcessedFalseOrderByCreatedAtAsc();
    long countByProcessedFalse();
}

