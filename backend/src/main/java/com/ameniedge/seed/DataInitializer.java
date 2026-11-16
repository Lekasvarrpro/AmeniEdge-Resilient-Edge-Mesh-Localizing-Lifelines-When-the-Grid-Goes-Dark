package com.ameniedge.seed;

import com.ameniedge.bulletins.Bulletin;
import com.ameniedge.bulletins.BulletinRepository;
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
    private final BulletinRepository bulletinRepository;
    private final DepartmentCapacityRepository capacityRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            RegionRepository regionRepository,
            StationRepository stationRepository,
            TeamRepository teamRepository,
            UserRepository userRepository,
            BulletinRepository bulletinRepository,
            DepartmentCapacityRepository capacityRepository,
            PasswordEncoder passwordEncoder) {
        this.regionRepository = regionRepository;
        this.stationRepository = stationRepository;
        this.teamRepository = teamRepository;
        this.userRepository = userRepository;
        this.bulletinRepository = bulletinRepository;
        this.capacityRepository = capacityRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Ensure stations, teams, capacities and users are always updated to the latest standard names
        seedStations();
        seedTeamsAndUsers();
        seedDepartmentCapacities();

        if (regionRepository.count() == 0) {
            Region region = new Region("REG-CHN-01", "Chennai Metropolitan Disaster Zone", "Coastal district subject to monsoonal cyclonic flooding");
            regionRepository.save(region);
        }

        if (bulletinRepository.count() == 0) {
            Bulletin b1 = new Bulletin(
                    "BLT-001",
                    "North Station Wi-Fi Operational - Emergency Mesh Active",
                    "Cellular towers offline across North Chennai. Station Wi-Fi is active on backup power. Submit SOS or visit Anna Nagar Relief Camp.",
                    "INFO",
                    "STA-CHN-N-001",
                    "USR-LDR-N-01"
            );
            Bulletin b2 = new Bulletin(
                    "BLT-002",
                    "Urgent Flood Alert: River Otteri Overflowing",
                    "Otteri Nullah water levels exceeding danger mark by 1.8m. Evacuate low-lying ground floors immediately.",
                    "DANGER",
                    "STA-CHN-N-001",
                    "USR-LDR-N-01"
            );
            bulletinRepository.save(b1);
            bulletinRepository.save(b2);
        }
    }

    private void seedStations() {
        saveOrUpdateStation("STA-CHN-N-001", "North Station - Anna Nagar", "REG-CHN-N", 13.0827, 80.2707, 6000);
        saveOrUpdateStation("STA-CHN-S-002", "South Station - Tambaram", "REG-CHN-S", 13.0360, 80.2675, 6000);
        saveOrUpdateStation("STA-CHN-E-003", "East Station - Royapuram", "REG-CHN-E", 13.1143, 80.2974, 6000);
        saveOrUpdateStation("STA-CHN-W-004", "West Station - Ambattur", "REG-CHN-W", 13.1147, 80.1548, 6000);
    }

    private void saveOrUpdateStation(String id, String name, String regionId, double lat, double lng, int radius) {
        stationRepository.findById(id).ifPresentOrElse(
                st -> {
                    st.setName(name);
                    st.setLatitude(lat);
                    st.setLongitude(lng);
                    st.setCoverageRadiusMeters(radius);
                    stationRepository.save(st);
                },
                () -> {
                    Station st = new Station(id, name, regionId, lat, lng, radius);
                    stationRepository.save(st);
                }
        );
    }

    private void seedDepartmentCapacities() {
        if (capacityRepository == null) return;
        // North
        saveOrUpdateCapacity("CAP-CHN-N-001", "TEAM-CHN-N-001", "STA-CHN-N-001", "Flood Rescue Department - North Station", "FLOOD", 120);
        saveOrUpdateCapacity("CAP-CHN-N-002", "TEAM-CHN-N-002", "STA-CHN-N-001", "Fire Response Department - North Station", "FIRE", 150);
        saveOrUpdateCapacity("CAP-CHN-N-003", "TEAM-CHN-N-003", "STA-CHN-N-001", "Emergency Medical Department - North Station", "MEDICAL", 100);
        saveOrUpdateCapacity("CAP-CHN-N-004", "TEAM-CHN-N-004", "STA-CHN-N-001", "Search & Rescue Department - North Station", "TRAPPED", 200);

        // South
        saveOrUpdateCapacity("CAP-CHN-S-001", "TEAM-CHN-S-001", "STA-CHN-S-002", "Flood Rescue Department - South Station", "FLOOD", 100);
        saveOrUpdateCapacity("CAP-CHN-S-002", "TEAM-CHN-S-002", "STA-CHN-S-002", "Emergency Medical Department - South Station", "MEDICAL", 120);
        saveOrUpdateCapacity("CAP-CHN-S-003", "TEAM-CHN-S-003", "STA-CHN-S-002", "Fire Response Department - South Station", "FIRE", 140);
        saveOrUpdateCapacity("CAP-CHN-S-004", "TEAM-CHN-S-004", "STA-CHN-S-002", "Search & Rescue Department - South Station", "TRAPPED", 160);

        // East
        saveOrUpdateCapacity("CAP-CHN-E-001", "TEAM-CHN-E-001", "STA-CHN-E-003", "Flood Rescue Department - East Station", "FLOOD", 110);
        saveOrUpdateCapacity("CAP-CHN-E-002", "TEAM-CHN-E-002", "STA-CHN-E-003", "Fire Response Department - East Station", "FIRE", 130);
        saveOrUpdateCapacity("CAP-CHN-E-003", "TEAM-CHN-E-003", "STA-CHN-E-003", "Emergency Medical Department - East Station", "MEDICAL", 90);
        saveOrUpdateCapacity("CAP-CHN-E-004", "TEAM-CHN-E-004", "STA-CHN-E-003", "Search & Rescue Department - East Station", "TRAPPED", 150);

        // West
        saveOrUpdateCapacity("CAP-CHN-W-001", "TEAM-CHN-W-001", "STA-CHN-W-004", "Flood Rescue Department - West Station", "FLOOD", 115);
        saveOrUpdateCapacity("CAP-CHN-W-002", "TEAM-CHN-W-002", "STA-CHN-W-004", "Fire Response Department - West Station", "FIRE", 145);
        saveOrUpdateCapacity("CAP-CHN-W-003", "TEAM-CHN-W-003", "STA-CHN-W-004", "Emergency Medical Department - West Station", "MEDICAL", 95);
        saveOrUpdateCapacity("CAP-CHN-W-004", "TEAM-CHN-W-004", "STA-CHN-W-004", "Search & Rescue Department - West Station", "TRAPPED", 175);
    }

    private void saveOrUpdateCapacity(String id, String teamId, String stationId, String deptName, String category, int total) {
        capacityRepository.findById(id).ifPresentOrElse(
                cap -> {
                    cap.setDepartmentName(deptName);
                    cap.setTeamId(teamId);
                    cap.setStationId(stationId);
                    cap.setCategory(category);
                    cap.setTotalPersonnel(total);
                    cap.setAvailablePersonnel(total);
                    cap.setDeployedPersonnel(0);
                    cap.setReturningPersonnel(0);
                    cap.setOffDutyPersonnel(0);
                    capacityRepository.save(cap);
                },
                () -> {
                    DepartmentCapacity cap = new DepartmentCapacity();
                    cap.setId(id);
                    cap.setTeamId(teamId);
                    cap.setStationId(stationId);
                    cap.setDepartmentName(deptName);
                    cap.setCategory(category);
                    cap.setTotalPersonnel(total);
                    cap.setAvailablePersonnel(total);
                    cap.setDeployedPersonnel(0);
                    cap.setReturningPersonnel(0);
                    cap.setOffDutyPersonnel(0);
                    capacityRepository.save(cap);
                }
        );
    }

    private void seedTeamsAndUsers() {
        // North Teams
        saveOrUpdateTeam("TEAM-CHN-N-001", "Flood Rescue Team - North Station", "STA-CHN-N-001", "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION,WATER_EXTRACTION", "INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES", 13.0827, 80.2707);
        saveOrUpdateTeam("TEAM-CHN-N-002", "Fire Response Team - North Station", "STA-CHN-N-001", "FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION", "FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS", 13.0827, 80.2707);
        saveOrUpdateTeam("TEAM-CHN-N-003", "Emergency Medical Team - North Station", "STA-CHN-N-001", "MEDICAL,TRIAGE,TRAUMA_CARE,EMT,PARAMEDIC", "AMBULANCE,OXYGEN_KIT,DEFIBRILLATOR,TRAUMA_KIT", 13.0827, 80.2707);
        saveOrUpdateTeam("TEAM-CHN-N-004", "Search & Rescue Team - North Station", "STA-CHN-N-001", "TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING", "HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT", 13.0827, 80.2707);

        // South Teams
        saveOrUpdateTeam("TEAM-CHN-S-001", "Flood Rescue Team - South Station", "STA-CHN-S-002", "FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION", "MOTORIZED_DINGHY,LIFE_JACKETS", 13.0360, 80.2675);
        saveOrUpdateTeam("TEAM-CHN-S-002", "Emergency Medical Team - South Station", "STA-CHN-S-002", "MEDICAL,TRIAGE,TRAUMA_CARE,FIRST_AID", "AMBULANCE,FIRST_AID_KIT,DEFIBRILLATOR", 13.0360, 80.2675);
        saveOrUpdateTeam("TEAM-CHN-S-003", "Fire Response Team - South Station", "STA-CHN-S-002", "FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION", "FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS", 13.0360, 80.2675);
        saveOrUpdateTeam("TEAM-CHN-S-004", "Search & Rescue Team - South Station", "STA-CHN-S-002", "TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING", "HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT", 13.0360, 80.2675);

        // East Teams
        saveOrUpdateTeam("TEAM-CHN-E-001", "Flood Rescue Team - East Station", "STA-CHN-E-003", "FLOOD,SWIFT_WATER_RESCUE,COASTAL_EXTRACTION", "HIGH_SPEED_RESCUE_BOAT,LIFE_JACKETS", 13.1143, 80.2974);
        saveOrUpdateTeam("TEAM-CHN-E-002", "Fire Response Team - East Station", "STA-CHN-E-003", "FIRE,FIRE_SUPPRESSION,PORT_EXTRICATION", "FIRE_TENDER,FOAM_CANNON", 13.1143, 80.2974);
        saveOrUpdateTeam("TEAM-CHN-E-003", "Emergency Medical Team - East Station", "STA-CHN-E-003", "MEDICAL,TRIAGE,TRAUMA_CARE,PARAMEDIC", "AMBULANCE,OXYGEN_KIT,TRIAGE_KIT", 13.1143, 80.2974);
        saveOrUpdateTeam("TEAM-CHN-E-004", "Search & Rescue Team - East Station", "STA-CHN-E-003", "TRAPPED,MISSING,PORT_SAR,COLLAPSED_CONTAINER_SEARCH", "HYDRAULIC_SPREADERS,SEARCH_CAM", 13.1143, 80.2974);

        // West Teams
        saveOrUpdateTeam("TEAM-CHN-W-001", "Flood Rescue Team - West Station", "STA-CHN-W-004", "FLOOD,SWIFT_WATER_RESCUE,CANAL_EXTRACTION", "PONTOON_BOAT,LIFE_LINES", 13.1147, 80.1548);
        saveOrUpdateTeam("TEAM-CHN-W-002", "Fire Response Team - West Station", "STA-CHN-W-004", "FIRE,INDUSTRIAL_FIRE,CHEMICAL_EXTRICATION", "FIRE_TRUCK,FOAM_SUPPRESSION", 13.1147, 80.1548);
        saveOrUpdateTeam("TEAM-CHN-W-003", "Emergency Medical Team - West Station", "STA-CHN-W-004", "MEDICAL,TRIAGE,TRAUMA_CARE,INDUSTRIAL_FIRST_AID", "AMBULANCE,CRITICAL_CARE_KIT", 13.1147, 80.1548);
        saveOrUpdateTeam("TEAM-CHN-W-004", "Search & Rescue Team - West Station", "STA-CHN-W-004", "TRAPPED,MISSING,INDUSTRIAL_SAR,CONFINED_SPACE_SEARCH", "RESCUE_WINCH,CUTTING_TORCH,SEARCH_CAM", 13.1147, 80.1548);

        // North Users
        saveOrUpdateUser("USR-RSC-N-01", "flood.north@amenedge.test", "Flood@12345", "North Flood Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-001", "FLOOD,SWIFT_WATER_RESCUE");
        saveOrUpdateUser("USR-RSC-N-02", "fire.north@amenedge.test", "Fire@12345", "North Fire Response Officer", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-002", "FIRE,EXTRICATION");
        saveOrUpdateUser("USR-RSC-N-03", "medical.north@amenedge.test", "Medical@12345", "North Medical Paramedic", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-003", "MEDICAL,TRIAGE");
        saveOrUpdateUser("USR-RSC-N-04", "sar.north@amenedge.test", "Sar@12345", "North Search & Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-N-001", "TEAM-CHN-N-004", "TRAPPED,MISSING,URBAN_SAR");
        saveOrUpdateUser("USR-LDR-N-01", "leader.north@amenedge.test", "Leader@12345", "Commander North (Anna Nagar)", Role.STATION_LEADER, "STA-CHN-N-001", null, "TACTICAL_COMMAND");

        // South Users
        saveOrUpdateUser("USR-RSC-S-01", "flood.south@amenedge.test", "Flood@12345", "South Flood Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-001", "FLOOD,SWIFT_WATER_RESCUE");
        saveOrUpdateUser("USR-RSC-S-02", "medical.south@amenedge.test", "Medical@12345", "South Medical Paramedic", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-002", "MEDICAL,TRIAGE");
        saveOrUpdateUser("USR-RSC-S-03", "fire.south@amenedge.test", "Fire@12345", "South Fire Response Officer", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-003", "FIRE,EXTRICATION");
        saveOrUpdateUser("USR-RSC-S-04", "sar.south@amenedge.test", "Sar@12345", "South Search & Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-S-002", "TEAM-CHN-S-004", "TRAPPED,MISSING,URBAN_SAR");
        saveOrUpdateUser("USR-LDR-S-01", "leader.south@amenedge.test", "Leader@12345", "Commander South (Tambaram)", Role.STATION_LEADER, "STA-CHN-S-002", null, "TACTICAL_COMMAND");

        // East Users
        saveOrUpdateUser("USR-RSC-E-01", "flood.east@amenedge.test", "Flood@12345", "East Flood Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-001", "FLOOD,COASTAL_EXTRACTION");
        saveOrUpdateUser("USR-RSC-E-02", "fire.east@amenedge.test", "Fire@12345", "East Fire Response Officer", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-002", "FIRE,PORT_EXTRICATION");
        saveOrUpdateUser("USR-RSC-E-03", "medical.east@amenedge.test", "Medical@12345", "East Medical Paramedic", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-003", "MEDICAL,TRIAGE");
        saveOrUpdateUser("USR-RSC-E-04", "sar.east@amenedge.test", "Sar@12345", "East Search & Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-E-003", "TEAM-CHN-E-004", "TRAPPED,MISSING,PORT_SAR");
        saveOrUpdateUser("USR-LDR-E-01", "leader.east@amenedge.test", "Leader@12345", "Commander East (Royapuram)", Role.STATION_LEADER, "STA-CHN-E-003", null, "TACTICAL_COMMAND");

        // West Users
        saveOrUpdateUser("USR-RSC-W-01", "flood.west@amenedge.test", "Flood@12345", "West Flood Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-001", "FLOOD,CANAL_EXTRACTION");
        saveOrUpdateUser("USR-RSC-W-02", "fire.west@amenedge.test", "Fire@12345", "West Fire Response Officer", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-002", "FIRE,CHEMICAL_EXTRICATION");
        saveOrUpdateUser("USR-RSC-W-03", "medical.west@amenedge.test", "Medical@12345", "West Medical Paramedic", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-003", "MEDICAL,TRIAGE");
        saveOrUpdateUser("USR-RSC-W-04", "sar.west@amenedge.test", "Sar@12345", "West Search & Rescue Officer", Role.RESCUE_MEMBER, "STA-CHN-W-004", "TEAM-CHN-W-004", "TRAPPED,MISSING,INDUSTRIAL_SAR");
        saveOrUpdateUser("USR-LDR-W-01", "leader.west@amenedge.test", "Leader@12345", "Commander West (Ambattur)", Role.STATION_LEADER, "STA-CHN-W-004", null, "TACTICAL_COMMAND");

        // Governance & Public
        saveOrUpdateUser("USR-SUP-01", "supervisor@amenedge.test", "Super@12345", "District Supervisor Priya Raman", Role.REGIONAL_SUPERVISOR, null, null, "INCIDENT_COMMAND,CROSS_STATION_COORDINATION");
        saveOrUpdateUser("USR-ADM-01", "admin@amenedge.test", "Admin@12345", "System Admin Kumar", Role.ORG_ADMIN, null, null, "ADMIN_GOVERNANCE,AUDIT_AUDITOR");
        saveOrUpdateUser("USR-CTZ-01", "citizen@amenedge.test", "Citizen@12345", "Verified Citizen Arun", Role.CITIZEN, null, null, null);
    }

    private void saveOrUpdateTeam(String id, String name, String stationId, String capabilities, String equipment, double lat, double lng) {
        teamRepository.findById(id).ifPresentOrElse(
                team -> {
                    team.setName(name);
                    team.setStationId(stationId);
                    team.setCapabilities(capabilities);
                    team.setEquipment(equipment);
                    team.setStatus(TeamStatus.AVAILABLE);
                    team.setActiveIncidentCount(0);
                    teamRepository.save(team);
                },
                () -> {
                    Team team = new Team(id, name, stationId, null, TeamStatus.AVAILABLE, capabilities, equipment, lat, lng);
                    teamRepository.save(team);
                }
        );
    }

    private void saveOrUpdateUser(String id, String username, String rawPassword, String fullName, Role role, String stationId, String teamId, String skills) {
        userRepository.findByUsername(username).ifPresentOrElse(
                user -> {
                    user.setPasswordHash(passwordEncoder.encode(rawPassword));
                    user.setFullName(fullName);
                    user.setRole(role);
                    user.setStationId(stationId);
                    user.setTeamId(teamId);
                    user.setSkills(skills);
                    userRepository.save(user);
                },
                () -> {
                    User user = new User(id, username, passwordEncoder.encode(rawPassword), fullName, role, stationId);
                    user.setTeamId(teamId);
                    user.setSkills(skills);
                    userRepository.save(user);
                }
        );
    }
}
