package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.organization.Station;
import com.ameniedge.organization.StationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class VehicleTrackingService {

    private final VehicleTrackRepository trackRepository;
    private final StationRepository stationRepository;

    public VehicleTrackingService(VehicleTrackRepository trackRepository, StationRepository stationRepository) {
        this.trackRepository = trackRepository;
        this.stationRepository = stationRepository;
    }

    public static class LiveTelemetry {
        public String trackId;
        public String assignmentId;
        public String incidentId;
        public double currentLatitude;
        public double currentLongitude;
        public double progressPercent;
        public double distanceKm;
        public double distanceRemainingKm;
        public int etaSeconds;
        public int elapsedSeconds;
        public double speedKmh;
        public String status;
        public boolean isArrived;
    }

    @Transactional
    public VehicleTrack initializeTrack(Assignment assignment, Incident incident, double demoMultiplier) {
        // Look up station coordinates (fallback to Chennai North: 13.0827, 80.2707)
        double startLat = 13.0827;
        double startLng = 80.2707;
        if (assignment.getStationId() != null) {
            Optional<Station> st = stationRepository.findById(assignment.getStationId());
            if (st.isPresent()) {
                startLat = st.get().getLatitude();
                startLng = st.get().getLongitude();
            }
        }

        double targetLat = incident.getLatitude() != null ? incident.getLatitude() : 13.0890;
        double targetLng = incident.getLongitude() != null ? incident.getLongitude() : 80.2790;

        // Straight-line haversine distance
        double straightDistance = calculateHaversineKm(startLat, startLng, targetLat, targetLng);
        // Apply 1.3 road factor
        double totalDistance = Math.max(0.5, straightDistance * 1.3);

        double speedKmh = 40.0;
        // Travel time in seconds = (distance / speed) * 3600
        int nominalEtaSeconds = (int) Math.max(30.0, (totalDistance / speedKmh) * 3600.0);
        int adjustedEtaSeconds = (int) Math.max(10.0, (double) nominalEtaSeconds / Math.max(1.0, demoMultiplier));

        Instant departureTime = Instant.now();
        Instant arrivalTime = departureTime.plusSeconds(adjustedEtaSeconds);

        VehicleTrack track = new VehicleTrack();
        track.setId("TRK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        track.setAssignmentId(assignment.getId());
        track.setIncidentId(incident.getId());
        track.setTeamId(assignment.getTeamId());
        track.setStartLatitude(startLat);
        track.setStartLongitude(startLng);
        track.setTargetLatitude(targetLat);
        track.setTargetLongitude(targetLng);
        track.setCurrentLatitude(startLat);
        track.setCurrentLongitude(startLng);
        track.setDepartureTime(departureTime);
        track.setEstimatedArrivalTime(arrivalTime);
        track.setSpeedKmh(speedKmh);
        track.setTotalDistanceKm(totalDistance);
        track.setEtaSeconds(adjustedEtaSeconds);
        track.setDemoSpeedMultiplier(demoMultiplier > 0 ? demoMultiplier : 1.0);
        track.setStatus("EN_ROUTE");
        track.setRoutePolyline(startLat + "," + startLng + ";" + targetLat + "," + targetLng);

        return trackRepository.save(track);
    }

    public LiveTelemetry getTelemetryByAssignmentId(String assignmentId) {
        return trackRepository.findByAssignmentId(assignmentId)
                .map(this::calculateLiveTelemetry)
                .orElse(null);
    }

    public LiveTelemetry calculateLiveTelemetry(VehicleTrack track) {
        LiveTelemetry tel = new LiveTelemetry();
        tel.trackId = track.getId();
        tel.assignmentId = track.getAssignmentId();
        tel.incidentId = track.getIncidentId();
        tel.distanceKm = track.getTotalDistanceKm();
        tel.speedKmh = track.getSpeedKmh();

        Instant now = Instant.now();
        long elapsedMillis = Duration.between(track.getDepartureTime(), now).toMillis();
        long totalMillis = (long) track.getEtaSeconds() * 1000L;

        double progress = totalMillis > 0 ? (double) elapsedMillis / (double) totalMillis : 1.0;
        progress = Math.min(1.0, Math.max(0.0, progress));

        tel.progressPercent = progress * 100.0;
        tel.elapsedSeconds = (int) (elapsedMillis / 1000L);
        tel.isArrived = progress >= 1.0 || "ARRIVED".equalsIgnoreCase(track.getStatus()) || "ON_SITE".equalsIgnoreCase(track.getStatus());

        if (tel.isArrived) {
            tel.currentLatitude = track.getTargetLatitude();
            tel.currentLongitude = track.getTargetLongitude();
            tel.distanceRemainingKm = 0.0;
            tel.etaSeconds = 0;
            tel.status = "ARRIVED";
        } else {
            tel.currentLatitude = track.getStartLatitude() + (track.getTargetLatitude() - track.getStartLatitude()) * progress;
            tel.currentLongitude = track.getStartLongitude() + (track.getTargetLongitude() - track.getStartLongitude()) * progress;
            tel.distanceRemainingKm = Math.max(0.0, track.getTotalDistanceKm() * (1.0 - progress));
            tel.etaSeconds = Math.max(0, (int) ((totalMillis - elapsedMillis) / 1000L));
            tel.status = "EN_ROUTE";
        }

        return tel;
    }

    private double calculateHaversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return 6371.0 * c;
    }
}

