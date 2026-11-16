-- Migration V3: Wipe seeded incidents/assignments, add truck telemetry, and seed Part 6 rescue team accounts

-- 1. Wipe seeded incidents and assignments to ensure zero preloaded problems
DELETE FROM assignments;
DELETE FROM incident_events;
DELETE FROM incidents;

-- 2. Add truck movement telemetry columns to assignments
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS truck_latitude DOUBLE PRECISION;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS truck_longitude DOUBLE PRECISION;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS truck_progress DOUBLE PRECISION DEFAULT 0.0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS truck_arrived BOOLEAN DEFAULT FALSE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS outcome_note TEXT;

-- 3. Add team_id column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS team_id VARCHAR(64) REFERENCES teams(id);

-- 4. Clean up / update teams to match exact category handling
INSERT INTO teams (id, name, station_id, leader_id, status, capabilities, equipment, current_latitude, current_longitude, active_incident_count) VALUES
('TEAM-CHN-N-001', 'Flood Rescue Team', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION,WATER_EXTRACTION', 'INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES', 13.0827, 80.2707, 0),
('TEAM-CHN-N-002', 'Fire Response Team', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION', 'FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS', 13.0827, 80.2707, 0),
('TEAM-CHN-N-003', 'Medical Team', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,EMT,PARAMEDIC', 'AMBULANCE,OXYGEN_KIT,DEFIBRILLATOR,TRAUMA_KIT', 13.0827, 80.2707, 0),
('TEAM-CHN-N-004', 'Search & Rescue Team', 'STA-CHN-N-001', NULL, 'AVAILABLE', 'TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING', 'HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT', 13.0827, 80.2707, 0),
('TEAM-CHN-S-001', 'Flood Rescue Team', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION', 'MOTORIZED_DINGHY,LIFE_JACKETS', 13.0360, 80.2675, 0),
('TEAM-CHN-S-002', 'Medical Team', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'MEDICAL,TRIAGE,TRAUMA_CARE,FIRST_AID', 'AMBULANCE,FIRST_AID_KIT,DEFIBRILLATOR', 13.0360, 80.2675, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  station_id = EXCLUDED.station_id,
  capabilities = EXCLUDED.capabilities,
  equipment = EXCLUDED.equipment,
  status = 'AVAILABLE',
  active_incident_count = 0;

-- 5. Seed default rescue team logins (Part 6)
-- Station North:
-- flood.north@amenedge.test   / Flood@12345   -> TEAM-CHN-N-001
-- fire.north@amenedge.test    / Fire@12345    -> TEAM-CHN-N-002
-- medical.north@amenedge.test / Medical@12345 -> TEAM-CHN-N-003
-- sar.north@amenedge.test     / Sar@12345     -> TEAM-CHN-N-004
-- leader.north@amenedge.test  / Leader@12345  -> Station Leader North
INSERT INTO users (id, username, password_hash, full_name, role, station_id, team_id, phone, skills) VALUES
('USR-RSC-N-01', 'flood.north@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'North Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-001', '+91-98400-10001', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION'),
('USR-RSC-N-02', 'fire.north@amenedge.test', '$2a$10$USCfeTfTdNZT9gKa4Khy3OliX/G694wzy0W4AMPWlgTwHAW.S6uiO', 'North Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-002', '+91-98400-10002', 'FIRE,FIRE_SUPPRESSION,EXTRICATION'),
('USR-RSC-N-03', 'medical.north@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'North Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-003', '+91-98400-10003', 'MEDICAL,TRIAGE,TRAUMA_CARE'),
('USR-RSC-N-04', 'sar.north@amenedge.test', '$2a$10$Dc5yj1M1Lw6ELbRGtSfcwe.cPorvKCdGSuwxwuR7/sBTOcqLm6Bry', 'North Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-N-001', 'TEAM-CHN-N-004', '+91-98400-10004', 'TRAPPED,MISSING,STRUCTURAL_SEARCH'),
('USR-LDR-N-01', 'leader.north@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander North (Triage)', 'STATION_LEADER', 'STA-CHN-N-001', NULL, '+91-98400-10005', 'TACTICAL_COMMAND,RESCUEFIT_DISPATCH'),

-- Station South:
-- flood.south@amenedge.test   / Flood@12345   -> TEAM-CHN-S-001
-- medical.south@amenedge.test / Medical@12345 -> TEAM-CHN-S-002
-- leader.south@amenedge.test  / Leader@12345  -> Station Leader South
('USR-RSC-S-01', 'flood.south@amenedge.test', '$2a$10$3hrm.QAM4XXn0e9e9/yiUO3N2pLX6CXOS4/25gqLABW4azQ7iJr1a', 'South Flood Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-001', '+91-98400-20001', 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION'),
('USR-RSC-S-02', 'medical.south@amenedge.test', '$2a$10$9iHBpp6YRf.4RL8o8Pucv.N5axCFWc8MIiqtXCYL7PNHJUVGvjkz.', 'South Medical Paramedic', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-002', '+91-98400-20002', 'MEDICAL,TRIAGE,TRAUMA_CARE'),
('USR-LDR-S-01', 'leader.south@amenedge.test', '$2a$10$YkCcUD7Sbs1onEJXm429aunhYmSdGyqxnrXWsqxQQqtXPFKAMS57u', 'Commander South (Triage)', 'STATION_LEADER', 'STA-CHN-S-002', NULL, '+91-98400-20003', 'TACTICAL_COMMAND,RESCUEFIT_DISPATCH'),

-- Supervisor, Admin, Citizen:
('USR-SUP-01', 'supervisor@amenedge.test', '$2a$10$z1wdOKlxg2jJrgwlKWi8Nu2TKKABUV.MbyXn1Vp9spqb2GTa3mUk.', 'District Supervisor Priya Raman', 'REGIONAL_SUPERVISOR', NULL, NULL, '+91-98400-30001', 'INCIDENT_COMMAND,CROSS_STATION_COORDINATION'),
('USR-ADM-01', 'admin@amenedge.test', '$2a$10$yBcHAA7d5EtdwhC/XzaWM.8XOIMlxt6tI1y1C9909agec8K2mQhTG', 'System Admin Kumar', 'ORG_ADMIN', NULL, NULL, '+91-98400-30002', 'ADMIN_GOVERNANCE,AUDIT_AUDITOR'),
('USR-CTZ-01', 'citizen@amenedge.test', '$2a$10$F2iyiwFMv6USF5N0wSPY2u6diSVailii0V5IicUY7RQbBGx5mg8Eq', 'Verified Citizen Arun', 'CITIZEN', NULL, NULL, '+91-98400-30003', NULL)

ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  station_id = EXCLUDED.station_id,
  team_id = EXCLUDED.team_id;

