-- Migration V5: Purge all demo incidents, assignments, and mission history;
-- Rename stations and teams to clear distinct geographic identities;
-- Reset all personnel and team availability counters.

ALTER TABLE assignments ADD COLUMN IF NOT EXISTS forwarded_from VARCHAR(255);

-- 1. Wipe all incident-related transactional data
DELETE FROM vehicle_tracks;
DELETE FROM mission_personnel_allocations;
DELETE FROM mission_estimates;
DELETE FROM assignments;
DELETE FROM incident_events;
DELETE FROM incidents;
DELETE FROM mission_stats_history;

-- Remove audit log entries for incidents
DELETE FROM audit_logs WHERE entity_type = 'INCIDENT';

-- 2. Rename Stations to clear, distinct names
UPDATE stations
SET name = 'North Station - Anna Nagar',
    latitude = 13.0827,
    longitude = 80.2707,
    coverage_radius_meters = 6000
WHERE id = 'STA-CHN-N-001';

UPDATE stations
SET name = 'South Station - Tambaram',
    latitude = 13.0360,
    longitude = 80.2675,
    coverage_radius_meters = 6000
WHERE id = 'STA-CHN-S-002';

-- 3. Rename Teams to explicit department + station identities
UPDATE teams
SET name = 'Flood Rescue Team - North Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION,WATER_EXTRACTION',
    equipment = 'INFLATABLE_ZODIAC_BOAT,LIFE_JACKETS,ROPES',
    current_latitude = 13.0827,
    current_longitude = 80.2707
WHERE id = 'TEAM-CHN-N-001';

UPDATE teams
SET name = 'Fire Response Team - North Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'FIRE,FIRE_SUPPRESSION,EXTRICATION,SMOKE_VENTILATION',
    equipment = 'FIRE_ENGINE,THERMAL_IMAGER,BREATHING_APPARATUS',
    current_latitude = 13.0827,
    current_longitude = 80.2707
WHERE id = 'TEAM-CHN-N-002';

UPDATE teams
SET name = 'Emergency Medical Team - North Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'MEDICAL,TRIAGE,TRAUMA_CARE,EMT,PARAMEDIC',
    equipment = 'AMBULANCE,OXYGEN_KIT,DEFIBRILLATOR,TRAUMA_KIT',
    current_latitude = 13.0827,
    current_longitude = 80.2707
WHERE id = 'TEAM-CHN-N-003';

UPDATE teams
SET name = 'Search & Rescue Team - North Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'TRAPPED,MISSING,STRUCTURAL_SEARCH,URBAN_SAR,DEBRIS_CLEARING',
    equipment = 'HYDRAULIC_CUTTERS,SEARCH_CAM,HEAVY_ROPES,K9_UNIT',
    current_latitude = 13.0827,
    current_longitude = 80.2707
WHERE id = 'TEAM-CHN-N-004';

UPDATE teams
SET name = 'Flood Rescue Team - South Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'FLOOD,SWIFT_WATER_RESCUE,BOAT_OPERATION',
    equipment = 'MOTORIZED_DINGHY,LIFE_JACKETS',
    current_latitude = 13.0360,
    current_longitude = 80.2675
WHERE id = 'TEAM-CHN-S-001';

UPDATE teams
SET name = 'Emergency Medical Team - South Station',
    status = 'AVAILABLE',
    active_incident_count = 0,
    capabilities = 'MEDICAL,TRIAGE,TRAUMA_CARE,FIRST_AID',
    equipment = 'AMBULANCE,FIRST_AID_KIT,DEFIBRILLATOR',
    current_latitude = 13.0360,
    current_longitude = 80.2675
WHERE id = 'TEAM-CHN-S-002';

-- 4. Update Department Capacity with new names and reset counters
UPDATE department_capacity
SET department_name = 'Flood Rescue Department - North Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-N-001';

UPDATE department_capacity
SET department_name = 'Fire Response Department - North Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-N-002';

UPDATE department_capacity
SET department_name = 'Emergency Medical Department - North Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-N-003';

UPDATE department_capacity
SET department_name = 'Search & Rescue Department - North Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-N-004';

UPDATE department_capacity
SET department_name = 'Flood Rescue Department - South Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-S-001';

UPDATE department_capacity
SET department_name = 'Emergency Medical Department - South Station',
    available_personnel = total_personnel,
    deployed_personnel = 0,
    returning_personnel = 0,
    off_duty_personnel = 0
WHERE id = 'CAP-CHN-S-002';
