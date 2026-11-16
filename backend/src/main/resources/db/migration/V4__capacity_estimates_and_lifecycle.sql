-- Migration V4: Department Capacity, Headcount Rules, Priority Rules, Vehicle Tracks, Estimates, and Mission Lifecycle

-- 1. Department Capacity (Personnel Pools)
CREATE TABLE IF NOT EXISTS department_capacity (
    id VARCHAR(64) PRIMARY KEY,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    station_id VARCHAR(64) NOT NULL REFERENCES stations(id),
    department_name VARCHAR(128) NOT NULL,
    category VARCHAR(64) NOT NULL,
    total_personnel INT NOT NULL DEFAULT 100,
    available_personnel INT NOT NULL DEFAULT 100,
    deployed_personnel INT NOT NULL DEFAULT 0,
    returning_personnel INT NOT NULL DEFAULT 0,
    off_duty_personnel INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_personnel_balance CHECK (available_personnel + deployed_personnel + returning_personnel + off_duty_personnel = total_personnel)
);

-- Seed Personnel Pools as specified:
-- Flood North: 120, Fire North: 150, Medical North: 100, Search & Rescue North: 200
-- Flood South: 100, Medical South: 120
INSERT INTO department_capacity (id, team_id, station_id, department_name, category, total_personnel, available_personnel, deployed_personnel, returning_personnel, off_duty_personnel) VALUES
('CAP-CHN-N-001', 'TEAM-CHN-N-001', 'STA-CHN-N-001', 'Flood Rescue Department', 'FLOOD', 120, 120, 0, 0, 0),
('CAP-CHN-N-002', 'TEAM-CHN-N-002', 'STA-CHN-N-001', 'Fire Response Department', 'FIRE', 150, 150, 0, 0, 0),
('CAP-CHN-N-003', 'TEAM-CHN-N-003', 'STA-CHN-N-001', 'Emergency Medical Department', 'MEDICAL', 100, 100, 0, 0, 0),
('CAP-CHN-N-004', 'TEAM-CHN-N-004', 'STA-CHN-N-001', 'Search & Rescue Department', 'TRAPPED', 200, 200, 0, 0, 0),
('CAP-CHN-S-001', 'TEAM-CHN-S-001', 'STA-CHN-S-002', 'Flood Rescue Department South', 'FLOOD', 100, 100, 0, 0, 0),
('CAP-CHN-S-002', 'TEAM-CHN-S-002', 'STA-CHN-S-002', 'Emergency Medical Department South', 'MEDICAL', 120, 120, 0, 0, 0)
ON CONFLICT (id) DO UPDATE SET
    total_personnel = EXCLUDED.total_personnel,
    available_personnel = EXCLUDED.available_personnel,
    deployed_personnel = EXCLUDED.deployed_personnel,
    returning_personnel = EXCLUDED.returning_personnel,
    off_duty_personnel = EXCLUDED.off_duty_personnel;

-- 2. Add columns to incidents for deterministic scoring & lifecycle
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS priority_score DOUBLE PRECISION DEFAULT 50.0;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS score_explanation TEXT;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS vulnerable_present BOOLEAN DEFAULT FALSE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS in_hazard_zone BOOLEAN DEFAULT FALSE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS required_personnel INT DEFAULT 8;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS work_time_seconds INT DEFAULT 180;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS work_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS work_completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS queue_status VARCHAR(32) DEFAULT 'PENDING';

-- 3. Add columns to assignments for lifecycle & headcount
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS allocated_personnel INT DEFAULT 0;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS lifecycle_state VARCHAR(32) DEFAULT 'OFFERED';
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS field_confirmation_required BOOLEAN DEFAULT FALSE;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS problem_reason TEXT;
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS work_extended_seconds INT DEFAULT 0;

-- 4. Vehicle Tracks for Real-Pace Navigation & Server-Resuming Interpolation
CREATE TABLE IF NOT EXISTS vehicle_tracks (
    id VARCHAR(64) PRIMARY KEY,
    assignment_id VARCHAR(64) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    route_polyline TEXT NOT NULL,
    start_latitude DOUBLE PRECISION NOT NULL,
    start_longitude DOUBLE PRECISION NOT NULL,
    target_latitude DOUBLE PRECISION NOT NULL,
    target_longitude DOUBLE PRECISION NOT NULL,
    current_latitude DOUBLE PRECISION NOT NULL,
    current_longitude DOUBLE PRECISION NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    speed_kmh DOUBLE PRECISION NOT NULL DEFAULT 40.0,
    total_distance_km DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    eta_seconds INT NOT NULL DEFAULT 225,
    demo_speed_multiplier DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    status VARCHAR(32) NOT NULL DEFAULT 'EN_ROUTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Mission Personnel Allocations
CREATE TABLE IF NOT EXISTS mission_personnel_allocations (
    id VARCHAR(64) PRIMARY KEY,
    assignment_id VARCHAR(64) NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    team_id VARCHAR(64) NOT NULL REFERENCES teams(id),
    allocated_count INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'DEPLOYED',
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    return_start_time TIMESTAMP WITH TIME ZONE,
    return_complete_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Mission Estimates
CREATE TABLE IF NOT EXISTS mission_estimates (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    department_id VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    travel_distance_km DOUBLE PRECISION NOT NULL,
    travel_time_seconds INT NOT NULL,
    work_time_seconds INT NOT NULL,
    return_time_seconds INT NOT NULL,
    total_estimated_seconds INT NOT NULL,
    estimated_start_time TIMESTAMP WITH TIME ZONE,
    based_on_history_count INT DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Mission Stats History (for Rolling Average Learning)
CREATE TABLE IF NOT EXISTS mission_stats_history (
    id VARCHAR(64) PRIMARY KEY,
    department_id VARCHAR(64) NOT NULL,
    category VARCHAR(64) NOT NULL,
    people_affected INT NOT NULL DEFAULT 1,
    actual_travel_seconds INT NOT NULL,
    actual_work_seconds INT NOT NULL,
    actual_return_seconds INT NOT NULL,
    outcome VARCHAR(64) NOT NULL DEFAULT 'SUCCESSFUL_EXTRACTION',
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed 5 realistic baseline mission records per department to initialize rolling averages
INSERT INTO mission_stats_history (id, department_id, category, people_affected, actual_travel_seconds, actual_work_seconds, actual_return_seconds, outcome, completed_at) VALUES
('HIST-FLD-01', 'TEAM-CHN-N-001', 'FLOOD', 2, 240, 180, 230, 'SUCCESSFUL_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('HIST-FLD-02', 'TEAM-CHN-N-001', 'FLOOD', 4, 300, 240, 290, 'SUCCESSFUL_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '5 hours'),
('HIST-FLD-03', 'TEAM-CHN-N-001', 'FLOOD', 1, 180, 150, 175, 'SUCCESSFUL_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('HIST-FLD-04', 'TEAM-CHN-N-001', 'FLOOD', 3, 270, 210, 260, 'SUCCESSFUL_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '12 hours'),
('HIST-FLD-05', 'TEAM-CHN-N-001', 'FLOOD', 5, 360, 300, 340, 'SUCCESSFUL_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '18 hours'),
('HIST-FIR-01', 'TEAM-CHN-N-002', 'FIRE', 2, 210, 280, 200, 'FIRE_SUPPRESSED', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
('HIST-FIR-02', 'TEAM-CHN-N-002', 'FIRE', 4, 260, 340, 250, 'FIRE_SUPPRESSED', CURRENT_TIMESTAMP - INTERVAL '7 hours'),
('HIST-FIR-03', 'TEAM-CHN-N-002', 'FIRE', 1, 190, 240, 185, 'FIRE_SUPPRESSED', CURRENT_TIMESTAMP - INTERVAL '10 hours'),
('HIST-FIR-04', 'TEAM-CHN-N-002', 'FIRE', 3, 230, 310, 220, 'FIRE_SUPPRESSED', CURRENT_TIMESTAMP - INTERVAL '14 hours'),
('HIST-FIR-05', 'TEAM-CHN-N-002', 'FIRE', 6, 310, 420, 295, 'FIRE_SUPPRESSED', CURRENT_TIMESTAMP - INTERVAL '20 hours'),
('HIST-MED-01', 'TEAM-CHN-N-003', 'MEDICAL', 1, 160, 120, 150, 'TRIAGED_AND_STABILIZED', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
('HIST-MED-02', 'TEAM-CHN-N-003', 'MEDICAL', 2, 200, 160, 190, 'TRIAGED_AND_STABILIZED', CURRENT_TIMESTAMP - INTERVAL '6 hours'),
('HIST-MED-03', 'TEAM-CHN-N-003', 'MEDICAL', 1, 150, 110, 140, 'TRIAGED_AND_STABILIZED', CURRENT_TIMESTAMP - INTERVAL '9 hours'),
('HIST-MED-04', 'TEAM-CHN-N-003', 'MEDICAL', 3, 240, 200, 220, 'TRIAGED_AND_STABILIZED', CURRENT_TIMESTAMP - INTERVAL '13 hours'),
('HIST-MED-05', 'TEAM-CHN-N-003', 'MEDICAL', 2, 190, 150, 180, 'TRIAGED_AND_STABILIZED', CURRENT_TIMESTAMP - INTERVAL '17 hours'),
('HIST-SAR-01', 'TEAM-CHN-N-004', 'TRAPPED', 2, 260, 320, 250, 'DEBRIS_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '3 hours'),
('HIST-SAR-02', 'TEAM-CHN-N-004', 'TRAPPED', 3, 310, 390, 300, 'DEBRIS_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '8 hours'),
('HIST-SAR-03', 'TEAM-CHN-N-004', 'TRAPPED', 1, 210, 240, 200, 'DEBRIS_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '11 hours'),
('HIST-SAR-04', 'TEAM-CHN-N-004', 'TRAPPED', 4, 350, 450, 330, 'DEBRIS_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '16 hours'),
('HIST-SAR-05', 'TEAM-CHN-N-004', 'TRAPPED', 2, 270, 330, 260, 'DEBRIS_EXTRACTION', CURRENT_TIMESTAMP - INTERVAL '22 hours')
ON CONFLICT (id) DO NOTHING;

