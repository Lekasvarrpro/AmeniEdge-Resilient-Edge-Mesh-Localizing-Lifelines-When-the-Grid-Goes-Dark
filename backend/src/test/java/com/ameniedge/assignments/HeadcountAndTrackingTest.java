package com.ameniedge.assignments;

import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.organization.DepartmentCapacity;
import com.ameniedge.organization.DepartmentCapacityRepository;
import com.ameniedge.organization.StationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HeadcountAndTrackingTest {

    @Mock
    private DepartmentCapacityRepository capacityRepository;

    @Mock
    private VehicleTrackRepository trackRepository;

    @Mock
    private StationRepository stationRepository;

    @Test
    @DisplayName("Calculate headcount rules across disaster categories")
    void testHeadcountCalculationRules() {
        HeadcountService headcountService = new HeadcountService(capacityRepository);

        Incident floodInc = new Incident();
        floodInc.setCategory(IncidentCategory.FLOOD);
        floodInc.setAffectedPeople(2);
        // Flood: max(6, 4 + ceil(2/2)*2) = 6
        assertThat(headcountService.calculateRequiredHeadcount(floodInc)).isGreaterThanOrEqualTo(6);

        Incident fireInc = new Incident();
        fireInc.setCategory(IncidentCategory.FIRE);
        fireInc.setAffectedPeople(3);
        // Fire: max(6, 6 + ceil(3/3)*2) = 8
        assertThat(headcountService.calculateRequiredHeadcount(fireInc)).isEqualTo(8);

        Incident sarInc = new Incident();
        sarInc.setCategory(IncidentCategory.TRAPPED);
        sarInc.setAffectedPeople(2);
        // Trapped: max(8, 8 + 2*2) = 12
        assertThat(headcountService.calculateRequiredHeadcount(sarInc)).isEqualTo(12);
    }

    @Test
    @DisplayName("Personnel allocation drops available and increases deployed")
    void testPersonnelAllocation() {
        DepartmentCapacity cap = new DepartmentCapacity();
        cap.setId("CAP-01");
        cap.setTeamId("TEAM-01");
        cap.setTotalPersonnel(120);
        cap.setAvailablePersonnel(120);
        cap.setDeployedPersonnel(0);

        when(capacityRepository.findByTeamId("TEAM-01")).thenReturn(Optional.of(cap));
        when(capacityRepository.save(any(DepartmentCapacity.class))).thenAnswer(i -> i.getArgument(0));

        HeadcountService headcountService = new HeadcountService(capacityRepository);
        boolean success = headcountService.allocatePersonnel("TEAM-01", 12);

        assertThat(success).isTrue();
        assertThat(cap.getAvailablePersonnel()).isEqualTo(108);
        assertThat(cap.getDeployedPersonnel()).isEqualTo(12);
    }

    @Test
    @DisplayName("Vehicle track calculates realistic ETA and speed based on real distance")
    void testVehicleTrackingRealPace() {
        VehicleTrackingService trackingService = new VehicleTrackingService(trackRepository, stationRepository);

        Assignment assignment = new Assignment();
        assignment.setId("ASN-TEST");
        assignment.setStationId("STA-CHN-N-001");
        assignment.setTeamId("TEAM-01");

        Incident incident = new Incident();
        incident.setId("INC-TEST");
        incident.setLatitude(13.1000);
        incident.setLongitude(80.2800);

        when(trackRepository.save(any(VehicleTrack.class))).thenAnswer(i -> i.getArgument(0));

        VehicleTrack track = trackingService.initializeTrack(assignment, incident, 1.0);

        assertThat(track.getTotalDistanceKm()).isGreaterThan(1.0);
        assertThat(track.getSpeedKmh()).isEqualTo(40.0);
        assertThat(track.getEtaSeconds()).isGreaterThan(60); // Must be > 1 minute at 40 km/h, not 5 seconds!

        VehicleTrackingService.LiveTelemetry telemetry = trackingService.calculateLiveTelemetry(track);
        assertThat(telemetry.speedKmh).isEqualTo(40.0);
        assertThat(telemetry.progressPercent).isBetween(0.0, 5.0);
        assertThat(telemetry.isArrived).isFalse();
    }
}

