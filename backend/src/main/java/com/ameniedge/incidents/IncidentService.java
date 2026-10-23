package com.ameniedge.incidents;

import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository eventRepository;
    private final String defaultStationId;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    public IncidentService(
            IncidentRepository incidentRepository,
            IncidentEventRepository eventRepository,
            @Value("${ameniedge.station.id:STA-CHN-N-001}") String defaultStationId) {
        this.incidentRepository = incidentRepository;
        this.eventRepository = eventRepository;
        this.defaultStationId = defaultStationId;
    }

    public Incident createIncident(CreateIncidentRequest req, String actorId, String actorRole) {
        // Idempotency: If clientReferenceId is supplied and already recorded, return existing!
        if (req.getClientReferenceId() != null && !req.getClientReferenceId().isBlank()) {
            Optional<Incident> existing = incidentRepository.findByClientReferenceId(req.getClientReferenceId());
            if (existing.isPresent()) {
                return existing.get();
            }
        }

        Incident incident = new Incident();
        String generatedId = "INC-" + (10000 + new Random().nextInt(90000));
        incident.setId(generatedId);
        incident.setClientReferenceId(req.getClientReferenceId());
        incident.setStationId(req.getStationId() != null && !req.getStationId().isBlank() ? req.getStationId() : defaultStationId);
        incident.setCategory(req.getCategory());
        incident.setAffectedPeople(Math.max(1, req.getAffectedPeople()));
        incident.setLatitude(req.getLatitude());
        incident.setLongitude(req.getLongitude());
        incident.setLocationLandmark(req.getLocationLandmark());
        incident.setDetails(req.getDetails());
        incident.setContactName(req.getContactName());
        incident.setContactPhone(req.getContactPhone());
        incident.setHasImmediateDanger(req.isHasImmediateDanger());
        incident.setStatus(IncidentStatus.RECEIVED);

        // Calculate initial priority based on category and life threat
        incident.setPriority(calculateInitialPriority(req));

        Incident saved = incidentRepository.save(incident);

        // Record immutable intake event
        IncidentEvent event = new IncidentEvent(
                saved.getId(),
                "INCIDENT_INTAKE",
                null,
                IncidentStatus.RECEIVED,
                actorId != null ? actorId : "ANONYMOUS_CITIZEN",
                actorRole != null ? actorRole : "CITIZEN",
                "Emergency SOS intake recorded at Station " + incident.getStationId()
        );
        eventRepository.save(event);

        broadcastUpdate(saved);
        return saved;
    }

    public Incident transitionStatus(String id, IncidentStatusUpdate update, String actorId, String actorRole) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + id));

        IncidentStatus prev = incident.getStatus();
        IncidentStatus target = update.getStatus();

        validateTransition(prev, target);

        incident.setStatus(target);
        Incident saved = incidentRepository.save(incident);

        IncidentEvent event = new IncidentEvent(
                saved.getId(),
                "STATUS_CHANGE",
                prev,
                target,
                actorId,
                actorRole,
                update.getNote() != null ? update.getNote() : "Transitioned from " + prev + " to " + target
        );
        eventRepository.save(event);

        broadcastUpdate(saved);
        return saved;
    }

    public void validateTransition(IncidentStatus from, IncidentStatus to) {
        if (from == to) return;

        boolean allowed = switch (from) {
            case QUEUED_OFFLINE -> to == IncidentStatus.RECEIVED;
            case RECEIVED -> to == IncidentStatus.TRIAGED || to == IncidentStatus.ASSIGNED || to == IncidentStatus.CANCELLED || to == IncidentStatus.ESCALATED;
            case TRIAGED -> to == IncidentStatus.ASSIGNED || to == IncidentStatus.ESCALATED || to == IncidentStatus.CANCELLED;
            case ASSIGNED -> to == IncidentStatus.ACCEPTED || to == IncidentStatus.TRIAGED || to == IncidentStatus.ESCALATED;
            case ACCEPTED -> to == IncidentStatus.EN_ROUTE || to == IncidentStatus.ESCALATED || to == IncidentStatus.TRIAGED;
            case EN_ROUTE -> to == IncidentStatus.ON_SITE || to == IncidentStatus.ESCALATED;
            case ON_SITE -> to == IncidentStatus.RESOLVED || to == IncidentStatus.ESCALATED;
            case RESOLVED -> to == IncidentStatus.CLOSED || to == IncidentStatus.REOPENED;
            case CLOSED -> to == IncidentStatus.REOPENED;
            case ESCALATED -> to == IncidentStatus.ASSIGNED || to == IncidentStatus.TRIAGED;
            case CANCELLED -> to == IncidentStatus.REOPENED;
            case REOPENED -> to == IncidentStatus.TRIAGED || to == IncidentStatus.ASSIGNED;
        };

        if (!allowed) {
            throw new IllegalStateException("Invalid incident status transition from " + from + " to " + to);
        }
    }

    public IncidentPriority calculateInitialPriority(CreateIncidentRequest req) {
        if (req.isHasImmediateDanger() || req.getAffectedPeople() >= 3) {
            return IncidentPriority.P1_CRITICAL;
        }
        if (req.getCategory() == IncidentCategory.FLOOD || req.getCategory() == IncidentCategory.TRAPPED || req.getCategory() == IncidentCategory.MEDICAL) {
            return IncidentPriority.P1_CRITICAL;
        }
        if (req.getCategory() == IncidentCategory.FIRE || req.getCategory() == IncidentCategory.STRUCTURAL_COLLAPSE) {
            return IncidentPriority.P2_URGENT;
        }
        return IncidentPriority.P3_ROUTINE;
    }

    public List<Incident> findAll(String stationId, IncidentStatus status) {
        if (stationId != null && status != null) {
            return incidentRepository.findByStationIdAndStatus(stationId, status);
        }
        if (stationId != null) {
            return incidentRepository.findByStationIdOrderByCreatedAtDesc(stationId);
        }
        if (status != null) {
            return incidentRepository.findByStatus(status);
        }
        return incidentRepository.findAll();
    }

    public Optional<Incident> findById(String id) {
        return incidentRepository.findById(id);
    }

    public List<IncidentEvent> getEvents(String incidentId) {
        return eventRepository.findByIncidentIdOrderByTimestampAsc(incidentId);
    }

    private void broadcastUpdate(Incident incident) {
        if (messagingTemplate != null) {
            try {
                messagingTemplate.convertAndSend("/topic/stations/" + incident.getStationId() + "/incidents", incident);
                messagingTemplate.convertAndSend("/topic/incidents/" + incident.getId(), incident);
            } catch (Exception ignored) {}
        }
    }
}
