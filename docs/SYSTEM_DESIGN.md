# AmeniEdge: System Design Specification

## 1. System Overview and Architectural Vision
**AmeniEdge** is an offline-first emergency reporting and rescue coordination platform designed for multi-tier disaster response operations when public telecommunications, cellular towers, and regional power grids fail.

The platform follows a **Two-Layer Edge Mesh Hierarchy**:
1. **Local Station Edge Layer (Autonomous Island Mode)**: Operates 100% disconnected from the internet. Each station runs an independent micro-data center on rugged hardware (Raspberry Pi 4/5 or field laptop) providing an autonomous Wi-Fi Access Point, local DNS captive portal, local Web PWA, local Spring Boot REST/WebSocket engine, local embedded/containerized database, and local OpenStreetMap vector/raster tile cache.
2. **Central Regional Layer (Global Coordination & Synchronization)**: Orchestrates inter-station escalations, regional resource logistics, high-capacity PostGIS geospatial analysis, multi-station synchronizations, and verified administrative governance.

---

## 2. Component Diagram

```mermaid
flowchart TD
    subgraph ClientDevices["Field Clients (Smartphones & Field Terminals)"]
        CP["Citizen PWA<br/>(One-Tap SOS, 3-Stage Tracker, Offline Guides)"]
        RP["Rescue Team PWA<br/>(Task Stepper, Offline Map, Status Broadcaster)"]
        LD["Station Leader Dashboard<br/>(Triage Queue, RescueFit Engine, Local Map)"]
        SD["Regional Supervisor Dashboard<br/>(Multi-Station GIS, Conflict Review)"]
        AD["Admin Governance Portal<br/>(RBAC, Station Keys, Audit Log Review)"]
    end

    subgraph StationEdge["Local Station Edge Stack (Autonomous Deployment)"]
        AP["Local Wi-Fi Access Point<br/>(hostapd 2.4/5GHz)"]
        DNS["Captive Portal & DNS<br/>(dnsmasq wildcard redirect)"]
        Proxy["Reverse Proxy & SSL<br/>(Nginx / Gateway)"]
        TileSvc["Local Offline Tile Engine<br/>(OSM Leaflet Tile Cache)"]
        StationAPI["Station Spring Boot Engine<br/>(REST + STOMP WebSocket)"]
        RescueFitLocal["RescueFit Engine<br/>(Local Roster & Rules Matrix)"]
        StationDB[("Station Local Database<br/>(H2 / PostgreSQL)")]
        SyncOutbox[("Sync Outbox & Audit Journal<br/>(Immutable Event Log)")]
    end

    subgraph CentralRegional["Regional Central Cloud / Command Stack"]
        CentralProxy["Regional Edge Gateway<br/>(Nginx Reverse Proxy & TLS)"]
        CentralAPI["Regional Spring Boot Engine<br/>(REST, WebSocket, Inter-Station Broker)"]
        CentralDB[("Regional Master Database<br/>(PostgreSQL 16 + PostGIS)")]
        CentralSync["Sync Harmonizer<br/>(Vector Clock & Conflict Resolver)"]
        AuditVault[("Cryptographic Audit Journal")]
    end

    CP -->|"Local Wi-Fi (Captive Portal)"| AP
    RP -->|"Local Wi-Fi / LAN"| AP
    LD -->|"Station Console LAN"| Proxy
    
    AP --> DNS
    DNS --> Proxy
    Proxy --> StationAPI
    Proxy --> TileSvc
    StationAPI --> RescueFitLocal
    StationAPI --> StationDB
    StationDB --> SyncOutbox

    SyncOutbox -.->|"Intermittent Satellite / UHF / Courier Mule Link"| CentralSync
    CentralSync --> CentralAPI
    CentralAPI --> CentralDB
    CentralAPI --> AuditVault

    SD -->|"Regional VPN / WAN"| CentralProxy
    AD -->|"Regional VPN / WAN"| CentralProxy
    CentralProxy --> CentralAPI
```

---

## 3. Deployment Topology

### A. Autonomous Station Edge Deployment
The Station node is packed into an all-in-one deployable unit (e.g., Pelican case with Raspberry Pi 5 + battery backup, or an off-grid field laptop):
- **Physical Wi-Fi Interface (`wlan0`)**: Configured with `hostapd` emitting an open SSID (e.g., `AmeniEdge-Station-North-SOS`).
- **DHCP & DNS (`dnsmasq`)**: Subnet `192.168.4.0/24`. All DNS requests (`*`) resolve to `192.168.4.1`.
- **Captive Portal Rules (`iptables` / `nftables`)**: HTTP traffic (port 80) is intercepted and HTTP 302-redirected to `http://192.168.4.1/sos`.
- **Docker Compose Stack**:
  1. `ameniedge-edge-proxy`: Nginx on port 80/443, proxying frontend static assets, `/api/v1/*` to backend, `/ws/*` for WebSocket, and `/api/v1/maps/tiles/*` to the tile directory.
  2. `ameniedge-edge-backend`: Spring Boot 3 service running with profile `station-edge`.
  3. `ameniedge-edge-db`: Embedded H2 file store or containerized lightweight PostgreSQL.
  4. `ameniedge-tile-cache`: Local directory of Leaflet-compatible XYZ tiles covering the local district.

### B. Regional Central Cloud Deployment
- **Docker Compose / Kubernetes Stack**:
  1. `ameniedge-central-proxy`: TLS termination, WAF, rate-limiting.
  2. `ameniedge-central-backend`: Spring Boot 3 running profile `central-regional`.
  3. `ameniedge-central-db`: High-availability PostgreSQL 16 with PostGIS extension.
  4. `ameniedge-central-sync`: Mutual-TLS (mTLS) sync receiver for station packet sync.

---

## 4. Backend Module Boundaries (Spring Boot Clean Architecture)

The backend code is strictly structured into modular domain packages within `com.ameniedge`:

```
com.ameniedge
├── common              # Base entities, audit tracking, exception hierarchy, error payloads
├── auth                # Authentication, JWT handling, mTLS station token verification, Argon2/BCrypt
├── users               # User identities, credentials, profile information
├── organization        # Multi-tier hierarchy: Regions, Stations, Teams, Capabilities, Equipment
├── incidents           # Lifecycle state machine, SOS intake, triage, priority scoring
├── assignments         # Responder dispatch assignments, acknowledgement, operational status
├── rescuefit           # Explainable rule-based dispatch engine, qualification matrix, ETA scoring
├── sync                # Store-and-forward outbox, vector clocking, conflict detection, station handshakes
├── maps                # Offline OSM tile server controller, shelter & hazard spatial layers
├── bulletins           # Verified official alerts, civil defense broadcasts
├── volunteers          # Community responder rostering, shift check-in/out, skill registry
├── attachments         # Evidence uploads, mime validation, EXIF sanitation, offline chunks
├── audit               # Immutable append-only audit trail and compliance logging
└── notifications       # STOMP WebSocket topics and simulated SMS/emergency broadcasts
```

**Module Rule**: Cross-domain interactions occur strictly through explicit service interfaces (`IncidentService`, `RescueFitEngine`, `SyncService`), never by direct cross-repository queries or leaky abstractions.

---

## 5. Frontend Architecture and Client State Management

```
frontend/
├── public/
│   ├── manifest.json       # PWA Manifest with maskable icons and standalone display
│   ├── sw.js               # Service Worker with Workbox precaching and offline fallback
│   └── tiles/              # Offline seed tiles for default operational district
├── src/
│   ├── app/                # Root App, Providers (Auth, QueryClient, Theme, Toast), Router
│   ├── components/
│   │   └── ui/             # Accessible Design System Primitives (Button, SOSButton, Card, Sheet, etc.)
│   ├── features/
│   │   ├── sos/            # Citizen emergency report step-wizard, one-tap trigger, 3-stage tracker
│   │   ├── incidents/      # Station incident queue, triage panel, filter controls
│   │   ├── dispatch/       # RescueFit explainable recommendation drawer, assignment confirm
│   │   ├── teams/          # Responder status stepper, glove-friendly big buttons, assignment cards
│   │   ├── supervisor/     # Regional overview, cross-station escalation, multi-node GIS
│   │   ├── maps/           # Leaflet offline map component, custom SVG markers, layer toggle sheets
│   │   ├── sync/           # Connectivity & sync top bar, outbox inspector, retry diagnostics
│   │   └── admin/          # RBAC tables, station key generator, audit trail viewer
│   ├── hooks/              # Custom hooks: useNetworkStatus, useGeolocation, useOutbox, useAudioHaptic
│   ├── lib/
│   │   ├── api/            # Axios / Fetch client with offline interceptors and auth headers
│   │   ├── db/             # Dexie.js IndexedDB schema (outbox, reports, tiles, cache)
│   │   ├── offline/        # Outbox synchronization engine with exponential backoff & jitter
│   │   ├── i18n/           # Internationalization dictionaries (English, Spanish, Hindi, etc.)
│   │   └── a11y/           # Focus traps, announcePolite, screen reader helpers
│   └── styles/
│       ├── tokens.css      # CSS custom properties (color roles, elevation, spacing grid, typography)
│       └── main.css        # Reset, fluid viewport heights, safe-area-inset rules
```

---

## 6. Sequence Diagrams

### (a) Citizen SOS Submission (Online / Station Connected)
```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Phone
    participant UI as Citizen PWA
    participant IDB as IndexedDB (Outbox)
    participant StationAPI as Station Spring Boot
    participant DB as Station Database
    participant WS as WebSocket STOMP

    Citizen->>UI: Taps SOS Button (1-tap or confirm)
    UI->>IDB: Write report to outbox (`SAVED_LOCAL`)
    UI->>Citizen: Display "Stage 1: Saved on device"
    UI->>StationAPI: POST /api/v1/incidents (with client_reference_id)
    StationAPI->>DB: Save Incident (status = RECEIVED)
    StationAPI->>WS: Broadcast to `/topic/stations/{id}/incidents`
    StationAPI-->>UI: 201 Created (server incident_id, timestamp)
    UI->>IDB: Update report state to `RECEIVED_STATION`
    UI->>Citizen: Display "Stage 2: Received by station"
```

### (b) Citizen SOS Submission (No Connection, Queued, Later Delivered)
```mermaid
sequenceDiagram
    autonumber
    actor Citizen as Citizen Phone
    participant UI as Citizen PWA
    participant IDB as IndexedDB (Outbox)
    participant Net as Network Monitor
    participant StationAPI as Station Spring Boot

    Citizen->>UI: Press SOS Button while off-grid
    UI->>IDB: Write report to `outbox` (`SAVED_LOCAL`)
    UI->>Citizen: Instant Haptic + "Saved on device (queued)"
    UI->>StationAPI: Attempt POST /api/v1/incidents -> Network Failed
    UI->>Net: Register background retry loop (exponential backoff)
    Note over Citizen,UI: Citizen walks into Station Wi-Fi range
    Net->>UI: Network status changed -> Connected to Station
    UI->>IDB: Fetch pending outbox records
    UI->>StationAPI: POST /api/v1/incidents (replay payload with UUID)
    StationAPI-->>UI: 201 Created (station receipt)
    UI->>IDB: Mark outbox item resolved (`RECEIVED_STATION`)
    UI->>Citizen: Update Tracker to "Stage 2: Received by station"
```

### (c) Station Leader Assignment with RescueFit Explanation
```mermaid
sequenceDiagram
    autonumber
    actor Leader as Station Leader
    participant Dash as Leader Dashboard
    participant API as Station API
    participant RF as RescueFit Engine
    participant DB as Station DB

    Leader->>Dash: Selects Incident INC-0042 (Category: FLOOD)
    Dash->>API: GET /api/v1/incidents/INC-0042/recommendations
    API->>RF: Evaluate teams against INC-0042 requirements
    RF->>RF: Step 1: Hard Filters (Skills, Equip, Status, Jurisdiction)
    RF->>RF: Step 2: Soft Rank (ETA, Current Active Workload)
    RF-->>API: Ranked list with full explainability breakdown
    API-->>Dash: Return Eligible & Excluded Teams with reasons
    Dash->>Leader: Render RescueFit Panel (Team Alpha: 94% fit, Team Beta excluded)
    Leader->>Dash: Approves Team Alpha assignment
    Dash->>API: POST /api/v1/incidents/INC-0042/assignments (Team Alpha)
    API->>DB: Record Assignment (ASSIGNED) & Incident Event
    API-->>Dash: Assignment confirmed
```

### (d) Two-Station Sync with Conflict Detection
```mermaid
sequenceDiagram
    autonumber
    participant StationA as Station A (Node North)
    participant Courier as Sync Courier / Network Bridge
    participant StationB as Station B (Node South)
    participant Regional as Regional Central Hub

    Note over StationA,StationB: Partitioned State: Stations A and B disconnected
    StationA->>StationA: Incident INC-101 assigned to Team Alpha
    StationB->>StationB: Incident INC-101 assigned to Team Beta
    Note over StationA,Regional: Courier or Satellite link restored
    StationA->>Regional: Push SyncEvents packet (Station A HMAC signed)
    StationB->>Regional: Push SyncEvents packet (Station B HMAC signed)
    Regional->>Regional: Compare Vector Clocks & Entity INC-101
    Regional->>Regional: Conflict detected: Concurrent assignments to single incident!
    Regional->>Regional: Preserve both events in immutable audit timeline
    Regional->>Regional: Mark Incident INC-101 as CONFLICT_DETECTED
    Regional-->>StationA: Sync Acknowledged with Conflict Flag
    Regional-->>StationB: Sync Acknowledged with Conflict Flag
    Regional->>Regional: Route to Regional Supervisor Escalation Inbox
```

---

## 7. Offline Queue and Synchronization Design

### The Outbox Schema (IndexedDB)
Every mutating client action (SOS creation, triage, team status change) is stored atomically in IndexedDB table `outbox`:
```typescript
interface OutboxRecord {
  client_reference_id: string; // Client-generated UUIDv4
  endpoint: string;            // e.g. '/api/v1/incidents'
  method: 'POST' | 'PATCH' | 'PUT';
  payload: Record<string, unknown>;
  created_at: number;          // Epoch milliseconds
  attempt_count: number;
  last_attempt_at: number | null;
  status: 'PENDING' | 'SENDING' | 'FAILED' | 'CONFIRMED';
  error_message?: string;
}
```

### Client Delivery Engine
1. **Mutation**: User taps action -> record committed to IndexedDB outbox.
2. **Optimistic UI**: UI immediately updates local state from outbox records.
3. **Dispatcher Loop**:
   - Listens to `online` and `offline` browser events.
   - Pings station health endpoint (`GET /api/v1/health`) every 8 seconds.
   - When healthy, flushes queue sequentially in FIFO order.
   - Includes retry delay with jitter: `delay = min(30000, 1000 * (2 ^ attempts)) + random(0, 500)`.
4. **Idempotency Guarantee**: The backend uses `client_reference_id` as a unique database constraint. Replays return the original success receipt (`HTTP 200/201`) without duplicating entities.

---

## 8. Offline Authentication & Session Continuity

```mermaid
flowchart LR
    subgraph OnlineOrLocal["Station Wi-Fi Available"]
        Creds[Username / Password] --> AuthAPI["POST /api/v1/auth/login"]
        AuthAPI --> TokenIssue["Issue JWT Access Token (1h) + Refresh Token (7d)"]
        TokenIssue --> CacheStore["Cache Encrypted Session in IndexedDB/Storage"]
    end

    subgraph DisconnectedField["Field Disconnection (Zero Signal)"]
        CacheStore --> OfflineGuard["Client Auth Guard Validates Local Session"]
        OfflineGuard --> OfflineWork["Responder continues missions, logs updates to Outbox"]
    end

    subgraph GuestAccess["Citizen Emergency Guest Mode"]
        NoLogin["No Credentials Required"] --> OneTapSOS["One-Tap SOS Submission Enabled Always"]
    end
```

- **Citizens**: Require zero authentication. Guest SOS reporting is unrestricted to guarantee zero friction during acute trauma.
- **Responders and Leaders**: Authenticate against the local station API when in station Wi-Fi range. The client persists session tokens with role and station claims. When leaving coverage, the client runs from cached session metadata.

---

## 9. Failure Mode Analysis

| Component / Subsystem | Failure Scenario | User Experience & System Response | Recovery Procedure |
|---|---|---|---|
| **Station Power** | Power grid blackout or generator failure | Station drops off-line. Citizen app transitions top bar to "Offline (saved on device)". New reports buffer in device IndexedDB outbox. | Station reboots on backup DC battery or solar generator; outbox auto-syncs upon reconnect. |
| **Local Wi-Fi Access Point** | Wi-Fi radio failure or physical antenna damage | Devices disconnect. UI displays "Station Disconnected. Stored locally." | Secondary station node or mobile responder hotspot assumes station identity. |
| **GPS / Geolocation** | Cloud cover, urban canyon, or user denies permission | App detects GPS timeout/denial. Instantly displays fallback: interactive pin on offline map or manual landmark/address text input. Never blocks report. | Accuracy circle expands; manual coordinates recorded. |
| **Map Tile Server** | Corrupted tile file or missing zoom levels | Leaflet falls back to placeholder grid with coordinate overlay. Incident list view remains 100% operational. | Tile pack re-download or fallback to vector bounding box. |
| **Sync Link (Station to Central)** | Terrestrial backhaul cut, satellite link obstructed | Station switches to "Autonomous Island Mode". All local triage, RescueFit dispatch, and team missions proceed normally. | Courier mule drive or restored uplink reconciles queued sync events via causal vector clocks. |
| **Concurrent Dispatched Teams** | Two stations dispatch different teams to same boundary event | Both station leader logs preserved. System flags `CONFLICT_DETECTED` with audible chime on supervisor dashboard. | Regional supervisor clicks "Arbitrate Conflict" to confirm primary responder and notify secondary. |

---

## 10. Real-Time Communication Layer (WebSocket + Polling Fallback)

- **Primary**: Spring WebSocket with STOMP protocol.
  - Topics:
    - `/topic/stations/{stationId}/incidents` (Local incident intake and status changes)
    - `/topic/stations/{stationId}/teams` (Responder telemetry and availability)
    - `/topic/incidents/{incidentId}` (Specific mission updates and notes)
    - `/topic/regional/escalations` (Supervisor alerts and conflict notifications)
- **Fallback**: Adaptive HTTP Long-Polling / Polling every 5–10 seconds whenever WebSocket connection drops.
- **Top Bar Indicator**:
  - `Live (WebSocket Connected)` (Green beacon)
  - `Delayed (HTTP Polling Active)` (Amber beacon)
  - `Offline (Local Outbox Active)` (Neutral gray beacon with pending badge count)

