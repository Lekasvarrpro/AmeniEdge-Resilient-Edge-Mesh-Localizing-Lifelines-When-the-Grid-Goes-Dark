# AmeniEdge
> **Resilient Edge Mesh. Localizing Lifelines When the Grid Goes Dark.**

AmeniEdge is an offline-first emergency reporting and rescue coordination platform with a multi-station command hierarchy. Engineered for acute grid failure, hurricane storm surge, and telecommunications collapse, AmeniEdge ensures that citizens can submit SOS calls, rescue teams can execute missions, and local stations can dispatch assets without requiring an active internet connection.

---

## 1. System Architecture & Two-Layer Edge Mesh

- **Autonomous Station Edge Layer (Local Island Mode)**:
  - Powered Linux device (Raspberry Pi 4/5 or field laptop) emitting a local Wi-Fi Access Point (`hostapd` + `dnsmasq`) with captive portal redirection.
  - Zero-webfont React 18 + Vite PWA precached by Workbox into client browser storage.
  - Autonomous Java 21 + Spring Boot 3 edge service (REST + STOMP WebSockets).
  - Embedded H2/PostgreSQL database with sync event journals and client idempotency.
  - Local Leaflet OpenStreetMap raster tile cache (`GET /api/v1/maps/tiles/{z}/{x}/{y}`).
  - **RescueFit Engine**: Rules-based dispatch matching teams by skills, equipment, workload, and proximity with 100% human-readable explainability.
- **Central Regional Layer**:
  - Central Spring Boot API with PostGIS spatial engine, mutual TLS inter-station sync harmonizer, and cryptographic audit vault.
  - Multi-station conflict detection and regional resource escalation.

---

## 2. Monorepo Structure

```
AmeniEdge/
├── backend/                # Java 21 + Spring Boot 3 Engine
│   ├── src/main/java/com/ameniedge/
│   │   ├── auth/           # Stateless JWT, SecurityConfig, UserPrincipal
│   │   ├── users/          # User entities, roles, profile management
│   │   ├── organization/   # Regions, Stations, Teams, Capabilities, Gear
│   │   ├── incidents/      # Lifecycle machine (RECEIVED -> ASSIGNED -> RESOLVED)
│   │   ├── assignments/    # Responder task assignments, accept/decline logic
│   │   ├── rescuefit/      # Rules-based explainable dispatch engine
│   │   ├── sync/           # Store-and-forward sync protocol, HMAC, conflict rules
│   │   ├── maps/           # Local tile controller, shelter & hazard layers
│   │   ├── bulletins/      # Verified civil defense broadcasts
│   │   ├── volunteers/     # Shift check-in/out, skill directory
│   │   ├── audit/          # Immutable append-only audit trail
│   │   └── notifications/  # STOMP WebSocket endpoints & Health diagnostics
│   ├── src/main/resources/
│   │   ├── application.yml # Multi-profile config (dev, station-edge, central)
│   │   └── db/migration/   # Flyway SQL migrations (V1 schema, V2 seed demo data)
│   └── pom.xml
├── frontend/               # React 18 + TypeScript + Vite PWA
│   ├── src/
│   │   ├── app/            # App shell, role switcher, theme toggle
│   │   ├── components/ui/  # WCAG 2.1 AA accessible primitives (Button, SOSButton, Card, etc.)
│   │   ├── features/       # SOS, Triage, RescueFit, Responder Stepper, Offline Map, Admin
│   │   ├── lib/            # Dexie IndexedDB (outbox), API client, offline synchronizer
│   │   └── styles/         # CSS tokens (light, dark, high-contrast sunlight)
│   ├── vite.config.ts      # Workbox service worker precache & tile caching
│   └── playwright.config.ts# Responsive viewport matrix (320px to 1440px)
├── infra/                  # Deployment & Hardware Provisioning
│   ├── docker-compose.station.yml # Station Edge autonomous stack
│   ├── docker-compose.central.yml # Regional central hub stack
│   ├── hostapd.conf        # Wi-Fi AP configuration
│   ├── dnsmasq.conf        # Captive portal DNS wildcard spoofing
│   ├── setup_station_ap.sh # Linux station auto-provisioning script
│   └── nginx-edge.conf     # Edge reverse proxy & captive probe redirects
├── map-data/               # Offline Leaflet Map Data & Tooling
│   ├── tiles/              # Pre-packaged 256x256 offline emergency PNG tiles
│   ├── shelters.geojson    # Evacuation centers & relief camps
│   ├── hazards.geojson     # Active flood inundation & downed power lines
│   └── generate_offline_tiles.cjs # Offline tile generator & seeder
└── docs/                   # Architectural & System Specifications
    ├── SYSTEM_DESIGN.md    # 9 core architectural artifacts & sequence diagrams
    ├── UI_DESIGN.md        # Mobile-first design tokens, wireframes & a11y budgets
    ├── ARCHITECTURE.md     # Role permissions matrix & incident state machine
    ├── DECISIONS.md        # Architecture Decision Records (ADR 001 - 006)
    ├── TESTING.md          # Test matrices, Playwright projects & scenarios
    ├── LIMITATIONS.md      # Physical boundaries, GPS constraints, honesty rules
    ├── DEMO_WALKTHROUGH.md # Step-by-step flood scenario demonstration script
    └── openapi.yaml        # Full OpenAPI 3.0 specification
```

---

## 3. Quickstart & Local Development

### Prerequisites
- Node.js 20+ and Java 21+
- Docker and Docker Compose (optional for containerized run)

### Running Backend
```bash
cd backend
mvn clean test-compile
mvn spring-boot:run
```
*Backend runs at `http://localhost:8080`. API documentation available at `http://localhost:8080/swagger-ui.html`.*

### Running Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:5173`. Proxies `/api/v1` and `/ws` to port 8080.*

### Running with Docker Compose
```bash
docker compose up --build
```

---

## 4. Role Accounts & Seed Credentials

All seed accounts share the development password: `password123`

| Role | Username | Station / District | Primary Responsibilities |
|---|---|---|---|
| **Citizen (Guest)** | *(No login required)* | Any | One-tap SOS, track 3-stage delivery, offline maps & first-aid guides |
| **Rescue Member** | `rescue_alpha` | `STA-CHN-N-001` (Team Alpha) | Accept/decline missions, update status stepper (En route -> On site -> Resolved) |
| **Station Leader** | `leader_north` | `STA-CHN-N-001` (Station North) | Prioritized triage queue, inspect RescueFit recommendations, dispatch teams |
| **Station Leader** | `leader_south` | `STA-CHN-S-002` (Station South) | Manage South station operations & independent mesh queue |
| **Regional Supervisor**| `supervisor` | Central District | Multi-station overview, cross-station escalations, conflict arbitration |
| **Org Administrator** | `admin` | Organization HQ | System governance, station keys, cryptographic audit logs |

---

## 5. Verification & Testing

### Backend Unit & Integration Tests (JUnit 5 + Mockito)
```bash
cd backend
mvn test
```
*Executes tests for RescueFit qualification & explainability, Incident state machine transitions, and Store-and-forward sync deduplication & conflict detection.*

### Frontend Unit Tests (Vitest + React Testing Library)
```bash
cd frontend
npm run test:unit
```
*Verifies 3-stage ProgressTracker rendering, design system tokens, and outbox persistence.*

### Mobile Responsive Integrity (Playwright)
```bash
cd frontend
npx playwright test
```
*Verifies 7 mandatory viewports (320x568, 360x800, 390x844, 412x915, 768x1024, 1024x768, 1440x900) ensuring zero horizontal scroll, touch targets >= 48px, and sticky action bar visibility.*

---

## 6. System Limitations & Honesty Disclosure

- **Prototype Status**: AmeniEdge is an experimental engineering prototype. It is not an accredited substitute for official emergency services (911/112).
- **Wi-Fi Mesh Reality**: Standard Wi-Fi access points do not form an automatic mesh without specialized routing or physical courier data mules between disconnected stations.
- **GPS Constraints**: GPS reception requires line-of-sight to satellites and may degrade or fail in collapsed reinforced concrete structures. Manual landmark input is provided as a non-blocking fallback.
- **Aspirational Targets**: Any reference to "99.99% availability" represents an aspirational engineering target to validate, not a guaranteed service level.
