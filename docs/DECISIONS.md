# AmeniEdge Architecture Decisions Record (ADR)

## Status Legend
- **PROPOSED**: Under discussion
- **ACCEPTED**: Confirmed decision implemented in current codebase
- **SUPERSEDED**: Replaced by a subsequent decision

---

## ADR-001: Monorepo Structure and Technology Stack
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: AmeniEdge requires coordinated evolution between a low-latency offline PWA, an edge station backend, a regional central server, deployment configs, and geospatial tile caches.
- **Decision**: Scaffold a clean monorepo layout:
  - `/frontend`: React 19 + TypeScript + Vite PWA with Dexie (IndexedDB), TanStack Query, Zustand, Leaflet, and custom accessible UI design tokens.
  - `/backend`: Java 21+ Spring Boot 3.3+ REST and WebSocket API, Flyway migrations, Spring Security with stateless JWT + offline edge session tokens, and RescueFit explainable dispatch engine.
  - `/infra`: Docker Compose multi-service topologies (Station Edge Stack vs. Regional Central Stack), hostapd/dnsmasq captive portal configurations, and Nginx reverse proxies.
  - `/docs`: Complete architectural, UI, testing, failure mode, and limitations specifications.
  - `/map-data`: Offline OpenStreetMap tile tooling, MBTiles/directory tile server scripts, and pre-packaged shelter/hazard GeoJSON data.
- **Consequences**: Single source of truth, simplified contract testing, unified Docker Compose orchestration, and deterministic local builds.

---

## ADR-002: Dual Database Strategy (Edge vs. Central)
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: Stations must boot instantly on constrained Linux hardware (e.g., Raspberry Pi 4/5, ruggedized field laptops) without requiring heavy cloud infrastructure, while central regional servers run enterprise PostgreSQL + PostGIS.
- **Decision**: Standardize on PostgreSQL with PostGIS centrally and provide H2/PostgreSQL database compatibility via Spring Data JPA and Flyway for Station Nodes. Both share exact entity models, transactional guarantees, and identical sync outbox schemas.
- **Consequences**: Field deployments can run lightweight embedded databases or containerized PostgreSQL on the local station without code branch divergence.

---

## ADR-003: Offline-First Three-Stage Report Lifecycle and Storage
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: Panicked citizens in disaster zones face intermittent Wi-Fi and cell drops. The system must never drop an SOS report and must provide unambiguous delivery truth.
- **Decision**: Every SOS report is assigned a client-generated UUID `client_reference_id` and immediately written to IndexedDB (`outbox` and `reports` stores). The UI reflects a strict 3-stage progress tracker:
  1. `SAVED_LOCAL` (Saved on this device - outbox queued)
  2. `RECEIVED_STATION` (Received and committed by Station)
  3. `ACKNOWLEDGED_RESPONDER` (Triaged and assigned/acknowledged by responder)
- **Consequences**: Zero report loss during network dropouts; idempotent background sync via service worker or foreground retry with exponential backoff and jitter.

---

## ADR-004: RescueFit Explainable Rules-Based Dispatch
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: Lives depend on timely and appropriate rescue assignments. Black-box machine learning can introduce dangerous hallucinations, bias, or silent task drops in high-stakes flood, fire, or trapped casualty emergencies.
- **Decision**: RescueFit operates as an explainable two-tier engine:
  - **Tier 1 (Hard Eligibility Filters)**: Mandatory skill verification (e.g., swift-water rescue for flood), necessary equipment check (e.g., inflatable rescue boat, extrication gear), team active availability status, and geographical station jurisdiction.
  - **Tier 2 (Soft Ranking & Scoring)**: Proximity/ETA calculation, current responder active workload, unit capacity, and operational fatigue.
  - **Explainability**: Every eligible team has an explicit positive justification (e.g., "Swift-water certified, 4 crew, equipped with motorized zodiac, ETA 7m, 0 active incidents"). Every excluded team has an explicit negative rationale (e.g., "Excluded: lacks swift-water certification and high-water vehicle").
  - **Station Leader Supremacy**: The human station leader always reviews the ranking and makes the final assignment. ML models may only offer non-binding category suggestions, never autonomous suppression or autonomous dispatch.
- **Consequences**: Full transparency, legal auditability, and responder safety.

---

## ADR-005: Store-and-Forward Sync Protocol with Conflict Resolution
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: Stations A and B may be completely severed by terrain or power grid failures. A courier device (physical "data mule" drive or mobile transceiver) or intermittent satellite link may bridge them later.
- **Decision**: All local state mutations produce immutable `sync_events` records carrying `event_id`, `station_id`, `entity_type`, `entity_id`, `operation`, `payload`, `vector_clock`/`logical_sequence`, and cryptographic HMAC signatures.
  - Stations authenticate mutually using pre-shared station keys / TLS client certificates.
  - When reconnecting, idempotency checks discard duplicate events.
  - For concurrent divergent updates (e.g., Station A assigns Team Alpha to Incident X while Station B assigns Team Bravo to Incident X), both events are preserved in the immutable audit timeline; the incident is flagged as `CONFLICT_DETECTED` with an escalation alert for regional supervisor or station leader arbitration.
- **Consequences**: Guarantees causal ordering, zero silent overwrites, and explicit human conflict resolution.

---

## ADR-006: Phone-First Zero-Webfont High-Contrast UI System
- **Date**: 2026-10-23
- **Status**: ACCEPTED
- **Context**: 90%+ of victim interactions and field deployments occur on smartphones (often wet screens, direct sunlight, low battery, low-end Android hardware).
- **Decision**:
  - Pure system font stack (`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`) with zero remote or external font downloads.
  - CSS Custom Properties design system with strict WCAG 2.1 AA contrast ratios (4.5:1 minimum for normal text, 3:1 for graphical UI elements).
  - Tri-modal theming: Light, Dark (OLED battery saving), and Sunlight High-Contrast mode.
  - Touch target minimum: 48x48px (SOS button minimum 160px / 40% viewport width).
  - Every status pairs color with an SVG icon and explicit text label.
- **Consequences**: Sub-1.5s cold cache boot, instant legibility in harsh environments, and no layout shift.

---

## ADR-007: Dark Bento Grid Command Dashboards and Modular Components
- **Date**: 2026-10-24
- **Status**: ACCEPTED
- **Context**: Incident commanders, station leaders, regional supervisors, and system administrators require high-density, low-glare tactical situational awareness interfaces during night operations and multi-monitor operations without altering the clean citizen public portals.
- **Decision**: Implement a Dark Bento grid UI layout using CSS variables (`--color-dash-bg: #090B10`, `--color-dash-card: #121620`, `--color-dash-surface: #19202E`, `--color-dash-border: #1F2737`, `--color-dash-accent-blue: #2563EB`) with reusable components:
  - `Sidebar.tsx`: Brand icon, collapsible drawer for mobile, sector indicators, user role pill, and bottom mesh connection status.
  - `Topbar.tsx`: Sector selection, quick search, layer filter button, and primary gradient dispatch action.
  - `StatCard.tsx`: Metric KPI values with trend indicator pills, sub-status chips, and responsive SVG glowing waveform sparklines.
  - `ChartCard.tsx`: Operational capacity circular SVG gauge meter and category breakdown bar charts.
  - `ActivityList.tsx`: RescueFit AI Insights feed with glowing gradients, carousel indicators, and quick action buttons.
  - `DataTableCard.tsx`: Dark-styled dense tabular views with status badges, priority markers, and category iconography.
  - Fully responsive from 320px up with zero horizontal overflow, drawer navigation on mobile, and >= 48px touch targets.
- **Consequences**: Standardized command center ergonomics across station, regional, and administrative roles while leaving citizen portals cleanly untouched.

---

## ADR-008: Rescue Team Assignment Lifecycle, Membership Authorization, and Mandatory Reason Decline Protocol
- **Date**: 2026-10-24
- **Status**: ACCEPTED
- **Context**: In emergency response, rescue team dispatches cannot silently fail or leave units unaccounted for. Accepting an assignment must synchronously update the incident progression (`ASSIGNED` -> `ACCEPTED` -> `EN_ROUTE` -> `ON_SITE` -> `ASSISTING` -> `RESOLVED`), and declining must be auditable, require operational justification, and immediately release the incident back to the triage queue.
- **Decision**:
  - **Endpoints**: `POST /api/v1/assignments/{id}/accept` and `POST /api/v1/assignments/{id}/decline`.
  - **Authorization**: Validates that the calling user is a member of the assigned team or possesses `ROLE_STATION_LEADER` / `ROLE_ADMIN` (throws 403 `AccessDeniedException` if unauthorized).
  - **Validation**: Declines require an explicit reason from predefined chips (`Too far`, `No equipment`, `Already busy`, `Unsafe`, `Other` + optional detailed text). Requests missing reasons return 400 Bad Request.
  - **Idempotency**: Repeated accept calls return the existing active assignment safely with 200 OK without re-triggering side effects.
  - **State Machine Synchronization**:
    - On Accept: Assignment status becomes `ACCEPTED`; team status transitions to `BUSY`. Incident status synchronizes to `ACCEPTED`.
    - On Decline: Assignment status becomes `DECLINED` with `reason` and timestamp stored; incident status reverts to `TRIAGED` (unassigned) and appears back in station leader triage queue with the decline reason logged.
  - **Offline-First Fallback**: Frontend queues transitions in Dexie/IndexedDB outbox if edge station link is temporarily interrupted, ensuring operational continuity.
- **Consequences**: Elimination of silent dropouts, full legal chain-of-custody for triage failures, and seamless coordinator-to-field synchronization.


