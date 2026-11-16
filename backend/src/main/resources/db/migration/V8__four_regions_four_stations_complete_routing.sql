-- V8: Seed All 4 Regions (North, South, East, West), 4 Stations, 16 Emergency Departments, and Pre-Seeded Logins
-- Ensures consistent region and state columns, team memberships, and zero initial clutter

-- 1. Schema Extensions for Region and State Query Compatibility
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS region VARCHAR(32);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS routing_notice TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS state VARCHAR(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(128);
ALTER TABLE teams ADD COLUMN IF NOT EXISTS department VARCHAR(255);

UPDATE users SET email = username WHERE email IS NULL;
UPDATE teams SET department = name WHERE department IS NULL;
UPDATE assignments SET state = lifecycle_state WHERE state IS NULL;

-- 2. Clean start: Purge transactional incidents and assignments
DELETE FROM incident_events;
DELETE FROM vehicle_tracks;
DELETE FROM mission_personnel_allocations;
DELETE FROM assignments;
DELETE FROM incidents;

-- 3. Seed 4 Geographic Regions
INSERT INTO regions (id, name, description)
VALUES
('REG-CHN-N', 'North Region', 'Greater Chennai North Sector (Anna Nagar, Kolathur, Kilpauk)'),
('REG-CHN-S', 'South Region', 'Greater Chennai South Sector (Tambaram, Mylapore, Adyar)'),
('REG-CHN-E', 'East Region', 'Greater Chennai East Sector (Royapuram, Chennai Port, George Town)'),
('REG-CHN-W', 'West Region', 'Greater Chennai West Sector (Ambattur, Avadi, Poonamallee)')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 4. Seed 4 Command Stations
INSERT INTO stations (id, name, region_id, latitude, longitude, coverage_radius_meters, status)
VALUES
('STA-CHN-N-001', 'North Station - Anna Nagar', 'REG-CHN-N', 13.0827, 80.2707, 6000, 'ONLINE'),
('STA-CHN-S-002', 'South Station - Tambaram', 'REG-CHN-S', 13.0360, 80.2675, 6000, 'ONLINE'),
('STA-CHN-E-003', 'East Station - Royapuram', 'REG-CHN-E', 13.1143, 80.2974, 6000, 'ONLINE'),
('STA-CHN-W-004', 'West Station - Ambattur', 'REG-CHN-W', 13.1147, 80.1548, 6000, 'ONLINE')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  region_id = EXCLUDED.region_id,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- 5. Seed 16 Specialized Rescue Teams (4 Departments x 4 Stations)
INSERT INTO teams (id, name, department, station_id, leader_id, status, capabilities, equipment, current_latitude, current_longitude, active_incident_count)
VALUES
-- North Station Teams
('TEAM-CHN-N-001', 'Flood Rescue Team - North Station', 'Flood Rescue', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION,WATER_EXTRACTION', 'INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES', 13.0827, 80.2707, 0),
('TEAM-CHN-N-002', 'Fire Response Team - North Station', 'Fire Response', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION', 'FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS', 13.0827, 80.2707, 0),
('TEAM-CHN-N-003', 'Emergency Medical Team - North Station', 'Emergency Medical', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,EMT,PARAMEDIC', 'AMBULANCE,OXYGEN_KIT,DEFIBRILLATOR,TRAUMA_KIT', 13.0827, 80.2707, 0),
('TEAM-CHN-N-004', 'Search & Rescue Team - North Station', 'Search & Rescue', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING', 'HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT', 13.0827, 80.2707, 0),

-- South Station Teams
('TEAM-CHN-S-001', 'Flood Rescue Team - South Station', 'Flood Rescue', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION', 'MOTORIZED_DINGHY,LIFE_JACKETS', 13.0360, 80.2675, 0),
('TEAM-CHN-S-002', 'Emergency Medical Team - South Station', 'Emergency Medical', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,FIRST_AID', 'AMBULANCE,FIRST_AID_KIT,DEFIBRILLATOR', 13.0360, 80.2675, 0),
('TEAM-CHN-S-003', 'Fire Response Team - South Station', 'Fire Response', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION', 'FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS', 13.0360, 80.2675, 0),
('TEAM-CHN-S-004', 'Search & Rescue Team - South Station', 'Search & Rescue', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING', 'HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT', 13.0360, 80.2675, 0),

-- East Station Teams
('TEAM-CHN-E-001', 'Flood Rescue Team - East Station', 'Flood Rescue', 'STA-CHN-E-003', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,COASTAL_EXTRACTION', 'HIGH_SPEED_RESCUE_BOAT,LIFE_JACKETS', 13.1143, 80.2974, 0),
('TEAM-CHN-E-002', 'Fire Response Team - East Station', 'Fire Response', 'STA-CHN-E-003', NULL, 'AVAILABLE', 'FIRE,FIRE_SUPPRESSION,PORT_EXTRICATION', 'FIRE_TENDER,FOAM_CANNON', 13.1143, 80.2974, 0),
('TEAM-CHN-E-003', 'Emergency Medical Team - East Station', 'Emergency Medical', 'STA-CHN-E-003', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,PARAMEDIC', 'AMBULANCE,OXYGEN_KIT,TRIAGE_KIT', 13.1143, 80.2974, 0),
('TEAM-CHN-E-004', 'Search & Rescue Team - East Station', 'Search & Rescue', 'STA-CHN-E-003', NULL, 'AVAILABLE', 'TRAPPED,MISSING,PORT_SAR,COLLAPSED_CONTAINER_SEARCH', 'HYDRAULIC_SPREADERS,SEARCH_CAM', 13.1143, 80.2974, 0),

-- West Station Teams
('TEAM-CHN-W-001', 'Flood Rescue Team - West Station', 'Flood Rescue', 'STA-CHN-W-004', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,CANAL_EXTRACTION', 'PONTOON_BOAT,LIFE_LINES', 13.1147, 80.1548, 0),
('TEAM-CHN-W-002', 'Fire Response Team - West Station', 'Fire Response', 'STA-CHN-W-004', NULL, 'AVAILABLE', 'FIRE,INDUSTRIAL_FIRE,CHEMICAL_EXTRICATION', 'FIRE_TRUCK,FOAM_SUPPRESSION', 13.1147, 80.1548, 0),
('TEAM-CHN-W-003', 'Emergency Medical Team - West Station', 'Emergency Medical', 'STA-CHN-W-004', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,INDUSTRIAL_FIRST_AID', 'AMBULANCE,CRITICAL_CARE_KIT', 13.1147, 80.1548, 0),
('TEAM-CHN-W-004', 'Search & Rescue Team - West Station', 'Search & Rescue', 'STA-CHN-W-004', NULL, 'AVAILABLE', 'TRAPPED,MISSING,INDUSTRIAL_SAR,CONFINED_SPACE_SEARCH', 'RESCUE_WINCH,CUTTING_TORCH,SEARCH_CAM', 13.1147, 80.1548, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  department = EXCLUDED.department,
  station_id = EXCLUDED.station_id,
  capabilities = EXCLUDED.capabilities,
  equipment = EXCLUDED.equipment,
  status = 'AVAILABLE',
  active_incident_count = 0;

-- 6. Seed Department Capacities
INSERT INTO department_capacity (id, team_id, station_id, department_name, category, total_personnel, available_personnel, deployed_personnel, returning_personnel, off_duty_personnel)
VALUES
('CAP-CHN-N-001', 'TEAM-CHN-N-001', 'STA-CHN-N-001', 'Flood Rescue Department - North Station', 'FLOOD', 120, 120, 0, 0, 0),
('CAP-CHN-N-002', 'TEAM-CHN-N-002', 'STA-CHN-N-001', 'Fire Response Department - North Station', 'FIRE', 150, 150, 0, 0, 0),
('CAP-CHN-N-003', 'TEAM-CHN-N-003', 'STA-CHN-N-001', 'Emergency Medical Department - North Station', 'MEDICAL', 100, 100, 0, 0, 0),
('CAP-CHN-N-004', 'TEAM-CHN-N-004', 'STA-CHN-N-001', 'Search & Rescue Department - North Station', 'TRAPPED', 200, 200, 0, 0, 0),

('CAP-CHN-S-001', 'TEAM-CHN-S-001', 'STA-CHN-S-002', 'Flood Rescue Department - South Station', 'FLOOD', 100, 100, 0, 0, 0),
('CAP-CHN-S-002', 'TEAM-CHN-S-002', 'STA-CHN-S-002', 'Emergency Medical Department - South Station', 'MEDICAL', 120, 120, 0, 0, 0),
('CAP-CHN-S-003', 'TEAM-CHN-S-003', 'STA-CHN-S-002', 'Fire Response Department - South Station', 'FIRE', 140, 140, 0, 0, 0),
('CAP-CHN-S-004', 'TEAM-CHN-S-004', 'STA-CHN-S-002', 'Search & Rescue Department - South Station', 'TRAPPED', 160, 160, 0, 0, 0),

('CAP-CHN-E-001', 'TEAM-CHN-E-001', 'STA-CHN-E-003', 'Flood Rescue Department - East Station', 'FLOOD', 110, 110, 0, 0, 0),
('CAP-CHN-E-002', 'TEAM-CHN-E-002', 'STA-CHN-E-003', 'Fire Response Department - East Station', 'FIRE', 130, 130, 0, 0, 0),
('CAP-CHN-E-003', 'TEAM-CHN-E-003', 'STA-CHN-E-003', 'Emergency Medical Department - East Station', 'MEDICAL', 90, 90, 0, 0, 0),
('CAP-CHN-E-004', 'TEAM-CHN-E-004', 'STA-CHN-E-003', 'Search & Rescue Department - East Station', 'TRAPPED', 150, 150, 0, 0, 0),

('CAP-CHN-W-001', 'TEAM-CHN-W-001', 'STA-CHN-W-004', 'Flood Rescue Department - West Station', 'FLOOD', 115, 115, 0, 0, 0),
('CAP-CHN-W-002', 'TEAM-CHN-W-002', 'STA-CHN-W-004', 'Fire Response Department - West Station', 'FIRE', 145, 145, 0, 0, 0),
('CAP-CHN-W-003', 'TEAM-CHN-W-003', 'STA-CHN-W-004', 'Emergency Medical Department - West Station', 'MEDICAL', 95, 95, 0, 0, 0),
('CAP-CHN-W-004', 'TEAM-CHN-W-004', 'STA-CHN-W-004', 'Search & Rescue Department - West Station', 'TRAPPED', 175, 175, 0, 0, 0)
ON CONFLICT (id) DO UPDATE SET
  department_name = EXCLUDED.department_name,
  total_personnel = EXCLUDED.total_personnel,
  available_personnel = EXCLUDED.total_personnel,
  deployed_personnel = 0,
  returning_personnel = 0;

-- 7. Seed Pre-Seeded Responder & Governance Logins (Passwords verified via BCrypt)
-- Flood@12345: $2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a
-- Fire@12345: $2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO
-- Medical@12345: $2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.
-- Sar@12345: $2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry
-- Leader@12345: $2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u
-- Super@12345: $2a$10$z1wdOKlxg2jJrgwlKWi8Nu2TKKABUV.MbyXn1Vp9spqb2GTa3mUk.
-- Admin@12345: $2a$10$yBcHAA7d5EtdwhC/XzaWM.8XOIMlxt6tI1y1C9909agec8K2mQhTG
-- Citizen@12345: $2a$10$F2iyiwFMv6USF5N0wSPY2u6diSVailii0V5IicUY7RQbBGx5mg8Eq

INSERT INTO users (id, username, email, password_hash, full_name, role, station_id, team_id, skills, created_at, updated_at)
VALUES
-- North Responders
('USR-RSC-N-01', 'flood.north@amenedge.test', 'flood.north@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'North Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-001', 'FLOOD,SWIFT_WATER_RESCUE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-N-02', 'fire.north@amenedge.test', 'fire.north@amenedge.test', '$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO', 'North Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-002', 'FIRE,EXTRICATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-N-03', 'medical.north@amenedge.test', 'medical.north@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'North Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-003', 'MEDICAL,TRIAGE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-N-04', 'sar.north@amenedge.test', 'sar.north@amenedge.test', '$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry', 'North Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-004', 'TRAPPED,MISSING,URBAN_SAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-LDR-N-01', 'leader.north@amenedge.test', 'leader.north@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander North (Anna Nagar)', 'STATION_LEADER', 'STA-CHN-N-001', NULL, 'TACTICAL_COMMAND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- South Responders
('USR-RSC-S-01', 'flood.south@amenedge.test', 'flood.south@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'South Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-001', 'FLOOD,SWIFT_WATER_RESCUE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-S-02', 'medical.south@amenedge.test', 'medical.south@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'South Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-002', 'MEDICAL,TRIAGE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-S-03', 'fire.south@amenedge.test', 'fire.south@amenedge.test', '$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO', 'South Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-003', 'FIRE,EXTRICATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-S-04', 'sar.south@amenedge.test', 'sar.south@amenedge.test', '$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry', 'South Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-004', 'TRAPPED,MISSING,URBAN_SAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-LDR-S-01', 'leader.south@amenedge.test', 'leader.south@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander South (Tambaram)', 'STATION_LEADER', 'STA-CHN-S-002', NULL, 'TACTICAL_COMMAND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- East Responders
('USR-RSC-E-01', 'flood.east@amenedge.test', 'flood.east@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'East Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-E-003', 'TEAM-CHN-E-001', 'FLOOD,COASTAL_EXTRACTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-E-02', 'fire.east@amenedge.test', 'fire.east@amenedge.test', '$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO', 'East Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-E-003', 'TEAM-CHN-E-002', 'FIRE,PORT_EXTRICATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-E-03', 'medical.east@amenedge.test', 'medical.east@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'East Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-E-003', 'TEAM-CHN-E-003', 'MEDICAL,TRIAGE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-E-04', 'sar.east@amenedge.test', 'sar.east@amenedge.test', '$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry', 'East Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-E-003', 'TEAM-CHN-E-004', 'TRAPPED,MISSING,PORT_SAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-LDR-E-01', 'leader.east@amenedge.test', 'leader.east@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander East (Royapuram)', 'STATION_LEADER', 'STA-CHN-E-003', NULL, 'TACTICAL_COMMAND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- West Responders
('USR-RSC-W-01', 'flood.west@amenedge.test', 'flood.west@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'West Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-W-004', 'TEAM-CHN-W-001', 'FLOOD,CANAL_EXTRACTION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-W-02', 'fire.west@amenedge.test', 'fire.west@amenedge.test', '$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO', 'West Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-W-004', 'TEAM-CHN-W-002', 'FIRE,CHEMICAL_EXTRICATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-W-03', 'medical.west@amenedge.test', 'medical.west@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'West Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-W-004', 'TEAM-CHN-W-003', 'MEDICAL,TRIAGE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-W-04', 'sar.west@amenedge.test', 'sar.west@amenedge.test', '$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry', 'West Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-W-004', 'TEAM-CHN-W-004', 'TRAPPED,MISSING,INDUSTRIAL_SAR', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-LDR-W-01', 'leader.west@amenedge.test', 'leader.west@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander West (Ambattur)', 'STATION_LEADER', 'STA-CHN-W-004', NULL, 'TACTICAL_COMMAND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Governance and Public
('USR-SUP-01', 'supervisor@amenedge.test', 'supervisor@amenedge.test', '$2a$10$z1wdOKlxg2jJrgwlKWi8Nu2TKKABUV.MbyXn1Vp9spqb2GTa3mUk.', 'District Supervisor Priya Raman', 'REGIONAL_SUPERVISOR', NULL, NULL, 'INCIDENT_COMMAND', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-ADM-01', 'admin@amenedge.test', 'admin@amenedge.test', '$2a$10$yBcHAA7d5EtdwhC/XzaWM.8XOIMlxt6tI1y1C9909agec8K2mQhTG', 'System Admin Kumar', 'ORG_ADMIN', NULL, NULL, 'ADMIN_GOVERNANCE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-CTZ-01', 'citizen@amenedge.test', 'citizen@amenedge.test', '$2a$10$F2iyiwFMv6USF5N0wSPY2u6diSVailii0V5IicUY7RQbBGx5mg8Eq', 'Verified Citizen Arun', 'CITIZEN', NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET
  station_id = EXCLUDED.station_id,
  team_id = EXCLUDED.team_id,
  role = EXCLUDED.role,
  password_hash = EXCLUDED.password_hash,
  email = EXCLUDED.email;

-- 8. Seed Team Memberships Mapping
INSERT INTO team_memberships (id, team_id, user_id, role_in_team)
VALUES
('TM-N-01', 'TEAM-CHN-N-001', 'USR-RSC-N-01', 'RESPONDER'),
('TM-N-02', 'TEAM-CHN-N-002', 'USR-RSC-N-02', 'RESPONDER'),
('TM-N-03', 'TEAM-CHN-N-003', 'USR-RSC-N-03', 'RESPONDER'),
('TM-N-04', 'TEAM-CHN-N-004', 'USR-RSC-N-04', 'RESPONDER'),

('TM-S-01', 'TEAM-CHN-S-001', 'USR-RSC-S-01', 'RESPONDER'),
('TM-S-02', 'TEAM-CHN-S-002', 'USR-RSC-S-02', 'RESPONDER'),
('TM-S-03', 'TEAM-CHN-S-003', 'USR-RSC-S-03', 'RESPONDER'),
('TM-S-04', 'TEAM-CHN-S-004', 'USR-RSC-S-04', 'RESPONDER'),

('TM-E-01', 'TEAM-CHN-E-001', 'USR-RSC-E-01', 'RESPONDER'),
('TM-E-02', 'TEAM-CHN-E-002', 'USR-RSC-E-02', 'RESPONDER'),
('TM-E-03', 'TEAM-CHN-E-003', 'USR-RSC-E-03', 'RESPONDER'),
('TM-E-04', 'TEAM-CHN-E-004', 'USR-RSC-E-04', 'RESPONDER'),

('TM-W-01', 'TEAM-CHN-W-001', 'USR-RSC-W-01', 'RESPONDER'),
('TM-W-02', 'TEAM-CHN-W-002', 'USR-RSC-W-02', 'RESPONDER'),
('TM-W-03', 'TEAM-CHN-W-003', 'USR-RSC-W-03', 'RESPONDER'),
('TM-W-04', 'TEAM-CHN-W-004', 'USR-RSC-W-04', 'RESPONDER')
ON CONFLICT (id) DO UPDATE SET
  team_id = EXCLUDED.team_id,
  user_id = EXCLUDED.user_id;

