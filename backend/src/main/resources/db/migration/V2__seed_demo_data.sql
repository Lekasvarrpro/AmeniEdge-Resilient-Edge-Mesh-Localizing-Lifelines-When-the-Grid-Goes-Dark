-- AmeniEdge Seed Data for Multi-Station Demonstration Scenario
-- BCrypt hash for 'password123': $2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u

-- 1. Regions
INSERT INTO regions (id, name, description) VALUES
('REG-CHN-01', 'Chennai Metropolitan Disaster Zone', 'Coastal district prone to monsoonal cyclonic flooding and storm surge')
ON CONFLICT (id) DO NOTHING;

-- 2. Stations
INSERT INTO stations (id, name, region_id, latitude, longitude, coverage_radius_meters, status) VALUES
('STA-CHN-N-001', 'Station North Command (Royapuram)', 'REG-CHN-01', 13.0827, 80.2707, 6000, 'ONLINE'),
('STA-CHN-S-002', 'Station South Command (Mylapore)', 'REG-CHN-01', 13.0360, 80.2675, 5000, 'ONLINE')
ON CONFLICT (id) DO NOTHING;

-- 3. Users across all 6 roles
INSERT INTO users (id, username, password_hash, full_name, role, station_id, phone, skills) VALUES
('USR-ADM-001', 'admin', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Executive Director Sharma', 'ORG_ADMIN', NULL, '+91-98400-00001', 'ADMIN_GOVERNANCE,AUDIT_AUDITOR'),
('USR-SUP-001', 'supervisor', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'District Supervisor Priya Raman', 'REGIONAL_SUPERVISOR', NULL, '+91-98400-00002', 'INCIDENT_COMMAND,CROSS_STATION_COORDINATION'),
('USR-LDR-001', 'leader_north', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Commander Vikram Seth (North)', 'STATION_LEADER', 'STA-CHN-N-001', '+91-98400-00003', 'TACTICAL_COMMAND,RESCUEFIT_DISPATCH'),
('USR-LDR-002', 'leader_south', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Commander Ananya Roy (South)', 'STATION_LEADER', 'STA-CHN-S-002', '+91-98400-00004', 'TACTICAL_COMMAND,RESCUEFIT_DISPATCH'),
('USR-RSC-001', 'rescue_alpha', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Officer Rajesh Kumar', 'RESCUE_MEMBER', 'STA-CHN-N-001', '+91-98400-00005', 'SWIFT_WATER_RESCUE,BOAT_OPERATOR,FIRST_AID'),
('USR-RSC-002', 'rescue_beta', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Officer Suresh Mani', 'RESCUE_MEMBER', 'STA-CHN-N-001', '+91-98400-00006', 'STRUCTURAL_COLLAPSE,TRIAGE,DEBRIS_REMOVAL'),
('USR-VOL-001', 'volunteer_maya', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Maya Venkat', 'VOLUNTEER', 'STA-CHN-N-001', '+91-98400-00007', 'EMT_BASIC,SHELTER_MANAGEMENT'),
('USR-CTZ-001', 'citizen_arun', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhiM58h5kR1q07mE4r41M4k/XyDCOh4u', 'Arun Krishnan (Citizen)', 'CITIZEN', NULL, '+91-98400-00008', NULL)
ON CONFLICT (id) DO NOTHING;

-- 4. Teams
INSERT INTO teams (id, name, station_id, leader_id, status, capabilities, equipment, current_latitude, current_longitude, active_incident_count) VALUES
('TEAM-CHN-N-001', 'Swift Water Alpha', 'STA-CHN-N-001', 'USR-RSC-001', 'AVAILABLE', 'SWIFT_WATER_RESCUE,BOAT_OPERATION,FIRST_AID', 'INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES', 13.0850, 80.2690, 0),
('TEAM-CHN-N-002', 'Urban Search & Extrication Beta', 'STA-CHN-N-001', 'USR-RSC-002', 'AVAILABLE', 'STRUCTURAL_SEARCH,TRIAGE,DEBRIS_CLEARING', 'HYDRAULIC_CUTTERS,THERMAL_IMAGER,STRETCHERS', 13.0810, 80.2730, 0),
('TEAM-CHN-N-003', 'Heavy Evacuation Charlie', 'STA-CHN-N-001', NULL, 'BUSY', 'SWIFT_WATER_RESCUE,TRANSPORT', 'HIGH_CLEARANCE_TRUCK,MEGAPHONE', 13.0900, 80.2600, 1),
('TEAM-CHN-S-001', 'Mylapore Coastal Rescue Delta', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'SWIFT_WATER_RESCUE,DIVING,TRAUMA_CARE', 'MOTORIZED_DINGHY,DEFIBRILLATOR', 13.0370, 80.2680, 0)
ON CONFLICT (id) DO NOTHING;

-- 5. Bulletins
INSERT INTO bulletins (id, title, content, severity, station_id, published_by) VALUES
('BLT-001', 'Station North Wi-Fi Operational - Emergency Mesh Active', 'Cellular towers offline across North Chennai. Station North Wi-Fi (SSID: AmeniEdge-Station-North-SOS) is active on emergency generator backup. Submit SOS or visit St. Mary Relief Camp.', 'INFO', 'STA-CHN-N-001', 'USR-LDR-001'),
('BLT-002', 'Urgent Flood Alert: River Otteri Overflowing', 'Otteri Nullah water levels exceeding danger mark by 1.8m. Evacuate low-lying ground floors immediately.', 'DANGER', 'STA-CHN-N-001', 'USR-LDR-001')
ON CONFLICT (id) DO NOTHING;

-- 6. Initial Incidents
INSERT INTO incidents (id, client_reference_id, station_id, category, priority, status, affected_people, latitude, longitude, location_landmark, details, contact_name, contact_phone, has_immediate_danger, assigned_team_id) VALUES
('INC-1001', 'e9c8e1a1-3b74-4b57-bc01-9a70659a0001', 'STA-CHN-N-001', 'FLOOD', 'P1_CRITICAL', 'RECEIVED', 4, 13.0895, 80.2715, 'Basin Bridge 2nd Cross, Near Water Tank', 'Water reached 1st floor balcony. 2 elderly and 2 children stranded without drinking water.', 'Karthik Raja', '+91-98401-11111', TRUE, NULL),
('INC-1002', 'e9c8e1a1-3b74-4b57-bc01-9a70659a0002', 'STA-CHN-N-001', 'MEDICAL', 'P1_CRITICAL', 'ASSIGNED', 1, 13.0840, 80.2650, 'Royapuram Police Station Road #12', '72yo diabetic woman with breathing difficulty. Power failure stopped oxygen unit.', 'Revathi S', '+91-98402-22222', TRUE, 'TEAM-CHN-N-003'),
('INC-1003', 'e9c8e1a1-3b74-4b57-bc01-9a70659a0003', 'STA-CHN-N-001', 'OTHER', 'P3_ROUTINE', 'TRIAGED', 0, 13.0780, 80.2740, 'Walltax Road Intersection', 'Massive banyan tree fallen across both lanes. Fire tender cannot pass.', 'Traffic Warden Ravi', '+91-98403-33333', FALSE, NULL)
ON CONFLICT (id) DO NOTHING;
