package com.ameniedge.seed;

import com.ameniedge.bulletins.Bulletin;
import com.ameniedge.bulletins.BulletinRepository;
import com.ameniedge.incidents.Incident;
import com.ameniedge.incidents.IncidentCategory;
import com.ameniedge.incidents.IncidentPriority;
import com.ameniedge.incidents.IncidentRepository;
import com.ameniedge.incidents.IncidentStatus;
import com.ameniedge.organization.*;
import com.ameniedge.users.Role;
import com.ameniedge.users.User;
import com.ameniedge.users.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RegionRepository regionRepository;
    private final StationRepository stationRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;
    private final BulletinRepository bulletinRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RegionRepository regionRepository,
            StationRepository stationRepository,
            TeamRepository teamRepository,
            UserRepository userRepository,
            IncidentRepository incidentRepository,
            BulletinRepository bulletinRepository,
            PasswordEncoder passwordEncoder) {
        this.regionRepository = regionRepository;
        this.stationRepository = stationRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
        this.bulletinRepository = bulletinRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (regionRepository.count() > 0) {
            return; // Data already exists
        }

        // 1. Region
        Region region = new Region("REG-CHN-01", "Chennai Metropolitan Disaster Zone", "Coastal district subject to monsoonal cyclonic flooding");
        regionRepository.save(region);

        // 2. Stations
        Station stationNorth = new Station("STA-CHN-N-001", "Station North Command (Royapuram)", "REG-CHN-01", 13.0827, 80.2707, 6000);
        Station stationSouth = new Station("STA-CHN-S-002", "Station South Command (Mylapore)", "REG-CHN-01", 13.0360, 80.2675, 5000);
        stationRepository.save(stationNorth);
        stationRepository.save(stationSouth);

        // 3. Users
        String encodedPass = passwordEncoder.encode("password123");

        User admin = new User("USR-ADM-001", "admin", encodedPass, "Executive Director Sharma", Role.ORG_ADMIN, null);
        admin.setSkills("ADMIN_GOVERNANCE,AUDIT_AUDITOR");
        userRepository.save(admin);

        User supervisor = new User("USR-SUP-001", "supervisor", encodedPass, "District Supervisor Priya Raman", Role.REGIONAL_SUPERVISOR, null);
        supervisor.setSkills("INCIDENT_COMMAND,CROSS_STATION_COORDINATION");
        userRepository.save(supervisor);

        User leaderNorth = new User("USR-LDR-001", "leader_north", encodedPass, "Commander Vikram Seth", Role.STATION_LEADER, "STA-CHN-N-001");
        leaderNorth.setSkills("TACTICAL_COMMAND,RESCUEFIT_DISPATCH");
        userRepository.save(leaderNorth);

        User leaderSouth = new User("USR-LDR-002", "leader_south", encodedPass, "Commander Ananya Roy", Role.STATION_LEADER, "STA-CHN-S-002");
        leaderSouth.setSkills("TACTICAL_COMMAND,RESCUEFIT_DISPATCH");
        userRepository.save(leaderSouth);

        User rescueAlpha = new User("USR-RSC-001", "rescue_alpha", encodedPass, "Officer Rajesh Kumar", Role.RESCUE_MEMBER, "STA-CHN-N-001");
        rescueAlpha.setSkills("SWIFT_WATER_RESCUE,BOAT_OPERATOR,FIRST_AID");
        userRepository.save(rescueAlpha);

        User rescueBeta = new User("USR-RSC-002", "rescue_beta", encodedPass, "Officer Suresh Mani", Role.RESCUE_MEMBER, "STA-CHN-N-001");
        rescueBeta.setSkills("STRUCTURAL_COLLAPSE,TRIAGE,DEBRIS_REMOVAL");
        userRepository.save(rescueBeta);

        User volunteerMaya = new User("USR-VOL-001", "volunteer_maya", encodedPass, "Maya Venkat", Role.VOLUNTEER, "STA-CHN-N-001");
        volunteerMaya.setSkills("EMT_BASIC,SHELTER_MANAGEMENT");
        userRepository.save(volunteerMaya);

        User citizenArun = new User("USR-CTZ-001", "citizen_arun", encodedPass, "Arun Krishnan", Role.CITIZEN, null);
        userRepository.save(citizenArun);

        // 4. Teams
        Team teamAlpha = new Team(
                "TEAM-CHN-N-001",
                "Swift Water Alpha",
                "STA-CHN-N-001",
                "USR-RSC-001",
                TeamStatus.AVAILABLE,
                "SWIFT_WATER_RESCUE,BOAT_OPERATION,FIRST_AID",
                "INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES",
                13.0850,
                80.2690
        );
        teamRepository.save(teamAlpha);

        Team teamBeta = new Team(
                "TEAM-CHN-N-002",
                "Urban Search & Extrication Beta",
                "STA-CHN-N-001",
                "USR-RSC-002",
                TeamStatus.AVAILABLE,
                "STRUCTURAL_SEARCH,TRIAGE,DEBRIS_CLEARING",
                "HYDRAULIC_CUTTERS,THERMAL_IMAGER,STRETCHERS",
                13.0810,
                80.2730
        );
        teamRepository.save(teamBeta);

        Team teamCharlie = new Team(
                "TEAM-CHN-N-003",
                "Heavy Evacuation Charlie",
                "STA-CHN-N-001",
                null,
                TeamStatus.BUSY,
                "SWIFT_WATER_RESCUE,TRANSPORT",
                "HIGH_CLEARANCE_TRUCK,MEGAPHONE",
                13.0900,
                80.2600
        );
        teamCharlie.setActiveIncidentCount(1);
        teamRepository.save(teamCharlie);

        Team teamDelta = new Team(
                "TEAM-CHN-S-001",
                "Mylapore Coastal Rescue Delta",
                "STA-CHN-S-002",
                null,
                TeamStatus.AVAILABLE,
                "SWIFT_WATER_RESCUE,DIVING,TRAUMA_CARE",
                "MOTORIZED_DINGHY,DEFIBRILLATOR",
                13.0370,
                80.2680
        );
        teamRepository.save(teamDelta);

        // 5. Bulletins
        Bulletin b1 = new Bulletin(
                "BLT-001",
                "Station North Wi-Fi Operational - Emergency Mesh Active",
                "Cellular towers offline across North Chennai. Station North Wi-Fi (SSID: AmeniEdge-Station-North-SOS) is active on backup power. Submit SOS or visit St. Mary Relief Camp.",
                "INFO",
                "STA-CHN-N-001",
                "USR-LDR-001"
        );
        Bulletin b2 = new Bulletin(
                "BLT-002",
                "Urgent Flood Alert: River Otteri Overflowing",
                "Otteri Nullah water levels exceeding danger mark by 1.8m. Evacuate low-lying ground floors immediately.",
                "DANGER",
                "STA-CHN-N-001",
                "USR-LDR-001"
        );
        bulletinRepository.save(b1);
        bulletinRepository.save(b2);

        // 6. Incidents
        Incident inc1 = new Incident();
        inc1.setId("INC-1001");
        inc1.setClientReferenceId("e9c8e1a1-3b74-4b57-bc01-9a70659a0001");
        inc1.setStationId("STA-CHN-N-001");
        inc1.setCategory(IncidentCategory.FLOOD);
        inc1.setPriority(IncidentPriority.P1_CRITICAL);
        inc1.setStatus(IncidentStatus.RECEIVED);
        inc1.setAffectedPeople(4);
        inc1.setLatitude(13.0895);
        inc1.setLongitude(80.2715);
        inc1.setLocationLandmark("Basin Bridge 2nd Cross, Near Water Tank");
        inc1.setDetails("Water reached 1st floor balcony. 2 elderly and 2 children stranded without drinking water.");
        inc1.setContactName("Karthik Raja");
        inc1.setContactPhone("+91-98401-11111");
        inc1.setHasImmediateDanger(true);
        incidentRepository.save(inc1);

        Incident inc2 = new Incident();
        inc2.setId("INC-1002");
        inc2.setClientReferenceId("e9c8e1a1-3b74-4b57-bc01-9a70659a0002");
        inc2.setStationId("STA-CHN-N-001");
        inc2.setCategory(IncidentCategory.MEDICAL);
        inc2.setPriority(IncidentPriority.P1_CRITICAL);
        inc2.setStatus(IncidentStatus.ASSIGNED);
        inc2.setAffectedPeople(1);
        inc2.setLatitude(13.0840);
        inc2.setLongitude(80.2650);
        inc2.setLocationLandmark("Royapuram Police Station Road #12");
        inc2.setDetails("72yo diabetic woman with breathing difficulty. Power failure stopped oxygen unit.");
        inc2.setContactName("Revathi S");
        inc2.setContactPhone("+91-98402-22222");
        inc2.setHasImmediateDanger(true);
        inc2.setAssignedTeamId("TEAM-CHN-N-003");
        incidentRepository.save(inc2);

        Incident inc3 = new Incident();
        inc3.setId("INC-1003");
        inc3.setClientReferenceId("e9c8e1a1-3b74-4b57-bc01-9a70659a0003");
        inc3.setStationId("STA-CHN-N-001");
        inc3.setCategory(IncidentCategory.OTHER);
        inc3.setPriority(IncidentPriority.P3_ROUTINE);
        inc3.setStatus(IncidentStatus.TRIAGED);
        inc3.setAffectedPeople(0);
        inc3.setLatitude(13.0780);
        inc3.setLongitude(80.2740);
        inc3.setLocationLandmark("Walltax Road Intersection");
        inc3.setDetails("Massive banyan tree fallen across both lanes. Fire tender cannot pass.");
        inc3.setContactName("Traffic Warden Ravi");
        inc3.setContactPhone("+91-98403-33333");
        inc3.setHasImmediateDanger(false);
        incidentRepository.save(inc3);
    }
}
