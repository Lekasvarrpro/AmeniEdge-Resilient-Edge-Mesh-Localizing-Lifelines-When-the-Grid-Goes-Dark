package com.ameniedge.incidents;

import com.ameniedge.assignments.Assignment;
import com.ameniedge.assignments.AssignmentRepository;
import com.ameniedge.assignments.AssignmentStatus;
import com.ameniedge.assignments.VehicleTrackingService;
import com.ameniedge.common.ArrivalGateException;
import com.ameniedge.incidents.dto.CreateIncidentRequest;
import com.ameniedge.incidents.dto.IncidentStatusUpdate;
import com.ameniedge.incidents.dto.ReportTrackerDto;
import com.ameniedge.organization.Station;
import com.ameniedge.organization.StationRepository;
import com.ameniedge.organization.Team;
import com.ameniedge.organization.TeamRepository;
import com.ameniedge.organization.TeamStatus;
import com.ameniedge.organization.DepartmentCapacity;
import com.ameniedge.organization.DepartmentCapacityRepository;
import com.ameniedge.rescuefit.RescueFitEngine;
import com.ameniedge.rescuefit.dto.RescueFitCandidate;
import com.ameniedge.rescuefit.dto.RescueFitResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentEventRepository eventRepository;
    private final AssignmentRepository assignmentRepository;
    private final TeamRepository teamRepository;
    private final RescueFitEngine rescueFitEngine;
    private final String defaultStationId;

    @Autowired(required = false)
    private StationRepository stationRepository;

    @Autowired(required = false)
    private DepartmentCapacityRepository capacityRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Autowired(required = false)
    private VehicleTrackingService vehicleTrackingService;

    public IncidentService(
            IncidentRepository incidentRepository,
            IncidentEventRepository eventRepository,
            AssignmentRepository assignmentRepository,
            TeamRepository teamRepository,
            RescueFitEngine rescueFitEngine,
            @Value("${ameniedge.station.id:STA-CHN-N-001}") String defaultStationId) {
        this.incidentRepository = incidentRepository;
        this.eventRepository = eventRepository;
        this.assignmentRepository = assignmentRepository;
        this.teamRepository = teamRepository;
        this.rescueFitEngine = rescueFitEngine;
        this.defaultStationId = defaultStationId;
    }

    public void setStationRepository(StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    public void setCapacityRepository(DepartmentCapacityRepository capacityRepository) {
        this.capacityRepository = capacityRepository;
    }

    @org.springframework.transaction.annotation.Transactional
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
        incident.setPriority(calculateInitialPriority(req));

        // Decoupled, non-overloaded lifecycle states
        java.time.Instant now = java.time.Instant.now();
        incident.setDeliveryState(DeliveryState.RECEIVED_BY_STATION);
        incident.setReceivedAt(now);
        incident.setSavedAt(req.getSavedAt() != null ? req.getSavedAt() : now);
        incident.setSyncState(SyncState.SYNCED);
        incident.setMissionState(MissionState.WAITING);

        // Deterministic proximity & capacity routing evaluation
        RoutingResult routing = determineOptimalRouting(incident, req);

        String normRegion = req.getRegion() != null ? req.getRegion().trim().toUpperCase() : null;
        if (normRegion == null && routing.targetStation != null) {
            String sid = routing.targetStation.getId();
            normRegion = sid.contains("-S-") ? "SOUTH" : sid.contains("-E-") ? "EAST" : sid.contains("-W-") ? "WEST" : "NORTH";
        }
        incident.setRegion(normRegion);

        if (routing.isTriage) {
            incident.setStationId(routing.targetStation != null ? routing.targetStation.getId() : (req.getStationId() != null ? req.getStationId() : defaultStationId));
            incident.setAssignedTeamId(null);
            incident.setStatus(IncidentStatus.RECEIVED);
            incident.setAssignmentState(AssignmentState.NONE);
            incident.setQueueStatus("TRIAGED");
            incident.setRoutingNotice(routing.notice);
            if (routing.targetStation != null) {
                incident.setStationName(routing.targetStation.getName());
                incident.setDepartmentName(routing.targetStation.getName() + " Triage Queue");
            }
        } else {
            incident.setStationId(routing.targetStation.getId());
            incident.setAssignedTeamId(routing.targetTeam.getId());
            incident.setStatus(IncidentStatus.RECEIVED);
            incident.setAssignmentState(AssignmentState.OFFERED);
            incident.setOfferedAt(now);
            incident.setQueueStatus("PENDING");
            incident.setAssignedTeamName(routing.targetTeam.getName());
            incident.setDepartmentName(routing.targetTeam.getName());
            incident.setStationName(routing.targetStation.getName());
            incident.setRoutingNotice(routing.notice);
        }

        Incident saved = incidentRepository.save(incident);

        // Record immutable intake event
        IncidentEvent event = new IncidentEvent(
                saved.getId(),
                "INCIDENT_INTAKE",
                null,
                saved.getStatus(),
                actorId != null ? actorId : "ANONYMOUS_CITIZEN",
                actorRole != null ? actorRole : "CITIZEN",
                "Emergency SOS intake recorded. " + routing.notice
        );
        eventRepository.save(event);

        // If routed to a team, create the pending assignment offer
        if (!routing.isTriage && routing.targetTeam != null && assignmentRepository != null) {
            Assignment assignment = new Assignment();
            assignment.setId("ASN-" + (10000 + new Random().nextInt(90000)));
            assignment.setIncidentId(saved.getId());
            assignment.setTeamId(routing.targetTeam.getId());
            assignment.setStationId(routing.targetStation.getId());
            assignment.setStatus(AssignmentStatus.PENDING_ACK);
            assignment.setLifecycleState("OFFERED");
            assignment.setForwardedFrom(routing.forwardedFrom);
            assignment.setNotes("Routed to " + routing.targetTeam.getName() + (routing.forwardedFrom != null ? " (" + routing.forwardedFrom + ")" : ""));
            assignment.setTruckLatitude(routing.targetTeam.getCurrentLatitude());
            assignment.setTruckLongitude(routing.targetTeam.getCurrentLongitude());
            assignment.setTruckProgress(0.0);
            assignment.setTruckArrived(false);
            assignmentRepository.save(assignment);

            routing.targetTeam.setActiveIncidentCount(routing.targetTeam.getActiveIncidentCount() + 1);
            teamRepository.save(routing.targetTeam);

            IncidentEvent routeEvent = new IncidentEvent(
                    saved.getId(),
                    "AUTO_ASSIGNMENT",
                    IncidentStatus.RECEIVED,
                    IncidentStatus.ASSIGNED,
                    "RESCUEFIT_ROUTING_ENGINE",
                    "SYSTEM",
                    routing.notice
            );
            eventRepository.save(routeEvent);
        }

        broadcastUpdate(saved);
        return saved;
    }

    public static class RoutingResult {
        public Station targetStation;
        public Team targetTeam;
        public String forwardedFrom;
        public boolean isTriage;
        public String notice;
    }

    private RoutingResult determineOptimalRouting(Incident incident, CreateIncidentRequest req) {
        RoutingResult result = new RoutingResult();

        // 1. Gather all stations
        List<Station> stations = new ArrayList<>();
        if (stationRepository != null) {
            stations.addAll(stationRepository.findAll());
        }
        if (stations.isEmpty()) {
            Station defaultStation = new Station(defaultStationId, "North Station - Anna Nagar", "REG-CHN-01", 13.0827, 80.2707, 6000);
            stations.add(defaultStation);
        }

        boolean hasCoordinates = req.getLatitude() != null && req.getLongitude() != null &&
                (Math.abs(req.getLatitude()) > 0.001 || Math.abs(req.getLongitude()) > 0.001);

        // Resolution Order 1: Check if citizen explicitly chose an area/region (North / South / East / West)
        Station selectedRegionStation = null;
        if (req.getRegion() != null && !req.getRegion().isBlank()) {
            String normRegion = req.getRegion().trim().toUpperCase();
            for (Station s : stations) {
                if (s.getId().toUpperCase().contains("-" + normRegion.charAt(0) + "-") ||
                    (s.getRegionId() != null && s.getRegionId().toUpperCase().contains("-" + normRegion.charAt(0))) ||
                    s.getName().toUpperCase().contains(normRegion)) {
                    selectedRegionStation = s;
                    break;
                }
            }
        }

        // Resolution Order: (1) Area chosen, (2) GPS coordinates, (3) Connected Wi-Fi station, (4) Leader triage
        if (selectedRegionStation != null) {
            Station finalSelected = selectedRegionStation;
            stations.sort((s1, s2) -> {
                if (s1.getId().equalsIgnoreCase(finalSelected.getId())) return -1;
                if (s2.getId().equalsIgnoreCase(finalSelected.getId())) return 1;
                return 0;
            });
        } else if (hasCoordinates) {
            stations.sort((s1, s2) -> {
                double d1 = calculateDistanceKm(req.getLatitude(), req.getLongitude(), s1.getLatitude(), s1.getLongitude());
                double d2 = calculateDistanceKm(req.getLatitude(), req.getLongitude(), s2.getLatitude(), s2.getLongitude());
                return Double.compare(d1, d2);
            });
        } else if (req.getStationId() != null && !req.getStationId().isBlank()) {
            stations.sort((s1, s2) -> {
                if (s1.getId().equalsIgnoreCase(req.getStationId())) return -1;
                if (s2.getId().equalsIgnoreCase(req.getStationId())) return 1;
                return 0;
            });
        } else {
            // Rule 4: If neither location nor station exists, send to station leader triage queue
            result.isTriage = true;
            result.targetStation = stations.get(0);
            result.notice = "No area or GPS provided. Sent to Station Leader triage queue (" + stations.get(0).getName() + ")";
            return result;
        }

        Station nearestStation = stations.get(0);

        // Rule 2: If category is OTHER -> Send to Station leader triage queue
        if (incident.getCategory() == IncidentCategory.OTHER) {
            result.isTriage = true;
            result.targetStation = nearestStation;
            result.notice = "Category OTHER sent to Station Leader triage queue (" + nearestStation.getName() + ")";
            return result;
        }

        // Rule 1 & 3: Iterate stations in proximity order to find matching department with available personnel
        List<Team> allTeams = teamRepository != null ? teamRepository.findAll() : Collections.emptyList();

        for (Station candidateStation : stations) {
            List<Team> stationMatchingTeams = allTeams.stream()
                    .filter(t -> t.getStationId() != null && t.getStationId().equalsIgnoreCase(candidateStation.getId()))
                    .filter(t -> matchesCategory(t, incident.getCategory()))
                    .filter(t -> t.getStatus() != TeamStatus.OFF_DUTY)
                    .toList();

            for (Team candidateTeam : stationMatchingTeams) {
                boolean hasCapacity = checkTeamPersonnelCapacity(candidateTeam);
                if (hasCapacity) {
                    int availMembers = 12;
                    if (capacityRepository != null) {
                        Optional<DepartmentCapacity> capOpt = capacityRepository.findByTeamId(candidateTeam.getId());
                        if (capOpt.isPresent()) {
                            availMembers = capOpt.get().getAvailablePersonnel();
                        }
                    }

                    result.isTriage = false;
                    result.targetStation = candidateStation;
                    result.targetTeam = candidateTeam;

                    boolean isNearest = candidateStation.getId().equalsIgnoreCase(nearestStation.getId());
                    if (!isNearest) {
                        result.forwardedFrom = "Forwarded from " + nearestStation.getName();
                        result.notice = "Forwarded to " + candidateTeam.getName() + " (" + candidateStation.getName() + "): " + nearestStation.getName() + " at capacity; nearest station with " + availMembers + " available members";
                    } else {
                        result.notice = "Routed to " + candidateTeam.getName() + ": nearest station with " + availMembers + " available members";
                    }
                    return result;
                }
            }
        }

        // If no matching department across all stations has available personnel:
        // Rule: An alert may NEVER be silently dropped. Create offer as 'Waiting for personnel' at the designated station.
        List<Team> primaryStationTeams = allTeams.stream()
                .filter(t -> t.getStationId() != null && t.getStationId().equalsIgnoreCase(nearestStation.getId()))
                .filter(t -> matchesCategory(t, incident.getCategory()))
                .toList();

        if (!primaryStationTeams.isEmpty()) {
            result.isTriage = false;
            result.targetStation = nearestStation;
            result.targetTeam = primaryStationTeams.get(0);
            result.notice = "Routed to " + result.targetTeam.getName() + " (Waiting for personnel: 0 members available)";
            return result;
        }

        result.isTriage = true;
        result.targetStation = nearestStation;
        result.notice = "All matching departments at capacity. Sent to " + nearestStation.getName() + " triage queue.";
        return result;
    }

    private boolean matchesCategory(Team team, IncidentCategory category) {
        String caps = (team.getCapabilities() != null ? team.getCapabilities() : "").toUpperCase();
        if (category == IncidentCategory.FLOOD) {
            return caps.contains("FLOOD") || caps.contains("SWIFT_WATER") || caps.contains("BOAT");
        }
        if (category == IncidentCategory.FIRE) {
            return caps.contains("FIRE") || caps.contains("EXTRICATION");
        }
        if (category == IncidentCategory.MEDICAL) {
            return caps.contains("MEDICAL") || caps.contains("TRIAGE") || caps.contains("TRAUMA") || caps.contains("EMT");
        }
        if (category == IncidentCategory.TRAPPED || category == IncidentCategory.MISSING || category == IncidentCategory.STRUCTURAL_COLLAPSE) {
            return caps.contains("TRAPPED") || caps.contains("MISSING") || caps.contains("STRUCTURAL") || caps.contains("URBAN_SAR");
        }
        return false;
    }

    private boolean checkTeamPersonnelCapacity(Team team) {
        if (capacityRepository != null) {
            Optional<DepartmentCapacity> capOpt = capacityRepository.findByTeamId(team.getId());
            if (capOpt.isPresent()) {
                return capOpt.get().getAvailablePersonnel() >= 8;
            }
        }
        return team.getActiveIncidentCount() < 5;
    }

    private double calculateDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round((R * c) * 10.0) / 10.0;
    }

    public Incident transitionStatus(String id, IncidentStatusUpdate update, String actorId, String actorRole) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found with ID: " + id));

        IncidentStatus prev = incident.getStatus();
        IncidentStatus target = update.getStatus();

        validateTransition(prev, target);

        // Arrival Gate Check (Part 4): Cannot transition to ON_SITE or RESOLVED unless truck has arrived
        if (target == IncidentStatus.ON_SITE || target == IncidentStatus.RESOLVED) {
            if (assignmentRepository != null) {
                Assignment activeAsn = assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(id).orElse(null);
                if (activeAsn != null) {
                    boolean hasArrived = Boolean.TRUE.equals(activeAsn.getTruckArrived()) ||
                            (activeAsn.getTruckProgress() != null && activeAsn.getTruckProgress() >= 0.98);
                    if (!hasArrived) {
                        throw new ArrivalGateException("Reach the location to continue: Rescue team has not reached the incident location yet.");
                    }
                }
            }
        }

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
            case RECEIVED -> to == IncidentStatus.TRIAGED || to == IncidentStatus.ASSIGNED || to == IncidentStatus.ACCEPTED || to == IncidentStatus.CANCELLED || to == IncidentStatus.ESCALATED;
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
                if (incident.getAssignedTeamId() != null) {
                    messagingTemplate.convertAndSend("/topic/alerts/team/" + incident.getAssignedTeamId(), incident);
                }
                if (incident.getStationId() != null) {
                    messagingTemplate.convertAndSend("/topic/alerts/station/" + incident.getStationId(), incident);
                    messagingTemplate.convertAndSend("/topic/stations/" + incident.getStationId() + "/incidents", incident);
                }
                messagingTemplate.convertAndSend("/topic/incidents/" + incident.getId(), incident);
                messagingTemplate.convertAndSend("/topic/alerts/all", incident);
            } catch (Exception ignored) {}
        }
    }

    public ReportTrackerDto getReportTracker(String idOrClientRef) {
        Incident incident = incidentRepository.findById(idOrClientRef)
                .or(() -> incidentRepository.findByClientReferenceId(idOrClientRef))
                .orElseThrow(() -> new IllegalArgumentException("Report not found for reference: " + idOrClientRef));

        ReportTrackerDto dto = new ReportTrackerDto();
        dto.setIncidentId(incident.getId());
        dto.setClientReferenceId(incident.getClientReferenceId());
        dto.setCategory(incident.getCategory() != null ? incident.getCategory().name() : "OTHER");
        dto.setAffectedPeople(incident.getAffectedPeople());
        dto.setLocationLandmark(incident.getLocationLandmark());
        dto.setLatitude(incident.getLatitude());
        dto.setLongitude(incident.getLongitude());

        dto.setDeliveryState(incident.getDeliveryState() != null ? incident.getDeliveryState() : DeliveryState.RECEIVED_BY_STATION);
        dto.setAssignmentState(incident.getAssignmentState() != null ? incident.getAssignmentState() : AssignmentState.NONE);
        dto.setMissionState(incident.getMissionState() != null ? incident.getMissionState() : MissionState.WAITING);
        dto.setSyncState(incident.getSyncState() != null ? incident.getSyncState() : SyncState.SYNCED);

        dto.setSavedAt(incident.getSavedAt() != null ? incident.getSavedAt() : incident.getCreatedAt());
        dto.setReceivedAt(incident.getReceivedAt() != null ? incident.getReceivedAt() : incident.getCreatedAt());
        dto.setOfferedAt(incident.getOfferedAt());
        dto.setAcceptedAt(incident.getAcceptedAt());
        dto.setDispatchedAt(incident.getDispatchedAt());
        dto.setArrivedAt(incident.getArrivedAt());
        dto.setResolvedAt(incident.getResolvedAt() != null ? incident.getResolvedAt() : incident.getWorkCompletedAt());

        dto.setStationId(incident.getStationId());
        dto.setStationName(incident.getStationName());
        dto.setDepartmentName(incident.getDepartmentName() != null ? incident.getDepartmentName() : incident.getAssignedTeamName());
        dto.setTeamId(incident.getAssignedTeamId());
        dto.setTeamName(incident.getAssignedTeamName());
        dto.setDeclineReason(incident.getDeclineReason());
        dto.setReassigning(incident.getAssignmentState() == AssignmentState.DECLINED ||
                (incident.getAssignmentState() == AssignmentState.NONE && incident.getDeclineReason() != null));

        if (assignmentRepository != null) {
            assignmentRepository.findTopByIncidentIdOrderByCreatedAtDesc(incident.getId()).ifPresent(asn -> {
                if (asn.getDeclineReason() != null && dto.getDeclineReason() == null) {
                    dto.setDeclineReason(asn.getDeclineReason());
                }
                if (vehicleTrackingService != null && ("EN_ROUTE".equalsIgnoreCase(asn.getLifecycleState()) || "ON_SITE".equalsIgnoreCase(asn.getLifecycleState()))) {
                    VehicleTrackingService.LiveTelemetry tel = vehicleTrackingService.getTelemetryByAssignmentId(asn.getId());
                    if (tel != null) {
                        dto.setDistanceKm(tel.distanceKm);
                        dto.setEtaSeconds(tel.etaSeconds);
                        dto.setTruckProgress(tel.progressPercent);
                        dto.setTruckLatitude(tel.currentLatitude);
                        dto.setTruckLongitude(tel.currentLongitude);
                    }
                }
                if ("ON_SITE".equalsIgnoreCase(asn.getLifecycleState()) && incident.getWorkStartedAt() != null) {
                    int totalWork = incident.getWorkTimeSeconds() + asn.getWorkExtendedSeconds();
                    long elapsed = java.time.Duration.between(incident.getWorkStartedAt(), java.time.Instant.now()).getSeconds();
                    dto.setWorkTimeRemainingSeconds((int) Math.max(0, totalWork - elapsed));
                }
            });
        }

        return dto;
    }
}
