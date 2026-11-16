-- V7: Seed Missing Fire and Search & Rescue Departments for South Station (STA-CHN-S-002)

-- 1. Insert South Station Fire and SAR Teams
INSERT INTO teams (id, name, station_id, leader_id, status, capabilities, equipment, current_latitude, current_longitude, active_incident_count)
VALUES
('TEAM-CHN-S-003', 'Fire Response Team - South Station', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION', 'FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS', 13.0360, 80.2675, 0),
('TEAM-CHN-S-004', 'Search & Rescue Team - South Station', 'STA-CHN-S-002', NULL, 'AVAILABLE', 'TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING', 'HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT', 13.0360, 80.2675, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  station_id = EXCLUDED.station_id,
  capabilities = EXCLUDED.capabilities,
  equipment = EXCLUDED.equipment,
  status = 'AVAILABLE',
  active_incident_count = 0;

-- 2. Insert Department Capacities for South Station Fire and SAR
INSERT INTO department_capacity (id, team_id, station_id, department_name, category, total_personnel, available_personnel, deployed_personnel, returning_personnel, off_duty_personnel)
VALUES
('CAP-CHN-S-003', 'TEAM-CHN-S-003', 'STA-CHN-S-002', 'Fire Response Department - South Station', 'FIRE', 140, 140, 0, 0, 0),
('CAP-CHN-S-004', 'TEAM-CHN-S-004', 'STA-CHN-S-002', 'Search & Rescue Department - South Station', 'TRAPPED', 160, 160, 0, 0, 0)
ON CONFLICT (id) DO UPDATE SET
  department_name = EXCLUDED.department_name,
  available_personnel = EXCLUDED.total_personnel,
  deployed_personnel = 0,
  returning_personnel = 0;

-- 3. Insert User Accounts for South Station Fire and SAR Responders
-- Passwords: Fire@12345 and Sar@12345
INSERT INTO users (id, username, password_hash, full_name, role, station_id, team_id, capabilities, created_at, updated_at)
VALUES
('USR-RSC-S-03', 'fire.south@amenedge.test', '$2a$10$wT0lqG8xG7mJ4k5V8u6RKe1u2M8yK7aH8x9u7k8q2p0M1z2l3a4b.', 'South Fire Response Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-003', 'FIRE,FIRE_SUPPRESSION,EXTRICATION', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('USR-RSC-S-04', 'sar.south@amenedge.test', '$2a$10$zY9u7k8q2p0M1z2l3a4b.wT0lqG8xG7mJ4k5V8u6RKe1u2M8yK7aH.', 'South Search & Rescue Officer', 'RESCUE_MEMBER', 'STA-CHN-S-002', 'TEAM-CHN-S-004', 'TRAPPED,MISSING,STRUCTURAL_SEARCH', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (username) DO UPDATE SET
  station_id = EXCLUDED.station_id,
  team_id = EXCLUDED.team_id,
  role = EXCLUDED.role;

