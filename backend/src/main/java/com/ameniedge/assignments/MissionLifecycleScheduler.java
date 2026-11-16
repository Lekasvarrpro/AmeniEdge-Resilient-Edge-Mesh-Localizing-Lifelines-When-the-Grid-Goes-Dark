package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Component
public class MissionLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(MissionLifecycleScheduler.class);

    private final AssignmentRepository assignmentRepository;
    private final IncidentRepository incidentRepository;
    private final VehicleTrackRepository trackRepository;
    private final MissionPersonnelAllocationRepository allocationRepository;
    private final HeadcountService headcountService;
    private final EstimatesService estimatesService;
    private final VehicleTrackingService vehicleTrackingService;

    public MissionLifecycleScheduler(AssignmentRepository assignmentRepository,
                                     IncidentRepository incidentRepository,
                                     VehicleTrackRepository trackRepository,
                                     MissionPersonnelAllocationRepository allocationRepository,
                                     HeadcountService headcountService,
                                     EstimatesService estimatesService,
                                     VehicleTrackingService vehicleTrackingService) {
        this.assignmentRepository = assignmentRepository;
        this.incidentRepository = incidentRepository;
        this.trackRepository = trackRepository;
        this.allocationRepository = allocationRepository;
        this.headcountService = headcountService;
        this.estimatesService = estimatesService;
        this.vehicleTrackingService = vehicleTrackingService;
    }

    @Scheduled(fixedDelay = 2000)
    @Transactional
    public void processMissionLifecycles() {
        Instant now = Instant.now();

        // 1. Process EN_ROUTE tracks -> check if arrived
        List<VehicleTrack> enRouteTracks = trackRepository.findByStatus("EN_ROUTE");
        for (VehicleTrack track : enRouteTracks) {
            VehicleTrackingService.LiveTelemetry tel = vehicleTrackingService.calculateLiveTelemetry(track);
            if (tel.isArrived) {
                track.setStatus("ON_SITE");
                track.setActualArrivalTime(now);
                trackRepository.save(track);

                Optional<Assignment> optAsn = assignmentRepository.findById(track.getAssignmentId());
                if (optAsn.isPresent()) {
                    Assignment asn = optAsn.get();
                    asn.setLifecycleState("ON_SITE");
                    asn.setTruckProgress(100.0);
                    asn.setTruckArrived(true);
                    assignmentRepository.save(asn);

                    // Update incident
                    Optional<Incident> optInc = incidentRepository.findById(track.getIncidentId());
                    if (optInc.isPresent()) {
                        Incident inc = optInc.get();
                        inc.setStatus(IncidentStatus.ON_SITE);
                        inc.setMissionState(com.ameniedge.incidents.MissionState.ON_SITE);
                        inc.setArrivedAt(now);
                        inc.setWorkStartedAt(now);
                        incidentRepository.save(inc);
                    }
                    log.info("Mission {} automatically arrived ON_SITE at {}", asn.getId(), now);
                }
            }
        }

        // 2. Process ON_SITE assignments -> check work timer expiry
        List<Assignment> activeAssignments = assignmentRepository.findByLifecycleState("ON_SITE");
        for (Assignment asn : activeAssignments) {
            if (asn.isFieldConfirmationRequired()) {
                // Waits for explicit manual completion from field worker
                continue;
            }

            Optional<Incident> optInc = incidentRepository.findById(asn.getIncidentId());
            if (optInc.isEmpty()) continue;
            Incident inc = optInc.get();

            if (inc.getWorkStartedAt() == null) {
                inc.setWorkStartedAt(now);
                incidentRepository.save(inc);
                continue;
            }

            int allocatedWorkSeconds = inc.getWorkTimeSeconds() + asn.getWorkExtendedSeconds();
            long elapsedSeconds = Duration.between(inc.getWorkStartedAt(), now).getSeconds();

            if (elapsedSeconds >= allocatedWorkSeconds) {
                // Auto-resolve mission!
                asn.setStatus(AssignmentStatus.COMPLETED);
                asn.setLifecycleState("RESOLVED");
                asn.setOutcomeNote(asn.getOutcomeNote() != null ? asn.getOutcomeNote() : "AUTOMATED_COMPLETION: Rescue work completed successfully on site");
                assignmentRepository.save(asn);

                inc.setStatus(IncidentStatus.RESOLVED);
                inc.setMissionState(com.ameniedge.incidents.MissionState.RESOLVED);
                inc.setResolvedAt(now);
                inc.setWorkCompletedAt(now);
                inc.setQueueStatus("COMPLETED");
                incidentRepository.save(inc);

                // Transition personnel to RETURNING
                int count = asn.getAllocatedPersonnel() > 0 ? asn.getAllocatedPersonnel() : 6;
                headcountService.startReturn(asn.getTeamId(), count);

                Optional<MissionPersonnelAllocation> optAlloc = allocationRepository.findByAssignmentId(asn.getId());
                if (optAlloc.isPresent()) {
                    MissionPersonnelAllocation alloc = optAlloc.get();
                    alloc.setStatus("RETURNING");
                    alloc.setReturnStartTime(now);
                    // Return travel takes approx same time as outward travel
                    Optional<VehicleTrack> optTrack = trackRepository.findByAssignmentId(asn.getId());
                    int returnDuration = optTrack.map(VehicleTrack::getEtaSeconds).orElse(180);
                    alloc.setReturnCompleteTime(now.plusSeconds(returnDuration));
                    allocationRepository.save(alloc);
                }

                // Record stats history
                Optional<VehicleTrack> optTrack = trackRepository.findByAssignmentId(asn.getId());
                int travelSec = optTrack.map(VehicleTrack::getEtaSeconds).orElse(240);
                estimatesService.recordCompletedMission(
                        asn.getTeamId(),
                        inc.getCategory() != null ? inc.getCategory().name() : "OTHER",
                        inc.getAffectedPeople(),
                        travelSec,
                        (int) elapsedSeconds,
                        travelSec,
                        "SUCCESSFUL_EXTRACTION"
                );

                log.info("Mission {} automatically completed work and personnel started return trip", asn.getId());
            }
        }

        // 3. Process RETURNING personnel allocations -> restore to available when return duration passes
        List<MissionPersonnelAllocation> returningAllocs = allocationRepository.findByStatus("RETURNING");
        for (MissionPersonnelAllocation alloc : returningAllocs) {
            if (alloc.getReturnCompleteTime() != null && now.isAfter(alloc.getReturnCompleteTime())) {
                alloc.setStatus("COMPLETED");
                allocationRepository.save(alloc);
                headcountService.completeReturn(alloc.getTeamId(), alloc.getAllocatedCount());
                log.info("Personnel allocation {} returned to base; {} members restored to available", alloc.getId(), alloc.getAllocatedCount());
            }
        }
    }
}
