package com.ameniedge.audit;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Async
    public void record(String actorId, String actorRole, String action, String entityType, String entityId, String details) {
        AuditLog log = new AuditLog(actorId, actorRole, action, entityType, entityId, details);
        auditLogRepository.save(log);
    }

    public List<AuditLog> listLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }
}

