# AmeniEdge: Comprehensive Testing & Verification Specification

## 1. Quality Assurance Strategy
AmeniEdge enforces quality verification across five core tiers:
1. **Domain Unit Tests**: RBAC verification, incident state transitions, RescueFit rules eligibility & ranking calculations, vector clock comparison, and sync deduplication.
2. **Backend API Integration Tests**: MockMvc / WebTestClient integration covering all REST and STOMP WebSocket endpoints, Flyway migrations, and error contracts.
3. **Frontend Component & Unit Tests**: Vitest + React Testing Library checking UI design tokens, outbox retries, 3-stage state tracker, and offline fallbacks.
4. **Responsive & Mobile Viewport Tests**: Playwright automated visual regression across mandatory phone, tablet, and desktop viewports (320px to 1536px).
5. **Accessibility Verification**: Automated `axe-core` accessibility audits guaranteeing zero violations for WCAG 2.1 AA in light, dark, and high-contrast modes.

---

## 2. Playwright Viewport Matrix

| Viewport Profile | Resolution (WxH) | Target Device Archetype | Critical Test Criteria |
|---|---|---|---|
| `phone-se` | 320 × 568 | iPhone SE / Low-end Android | Zero horizontal scroll, SOS button >= 160px, sticky bottom bar stays visible |
| `phone-standard` | 360 × 800 | Samsung Galaxy A-series | Input focus does not occlude submit buttons, thumb zone reachability |
| `phone-modern` | 390 × 844 | iPhone 14/15/16 | Safe area insets respected, notch clearance, haptic feedback triggers |
| `phone-large` | 412 × 915 | Google Pixel / Galaxy S-Ultra | Fluid typography scaling, card layout stacking |
| `tablet-portrait`| 768 × 1024| iPad 10th Gen | Two-pane split layout, slide-out incident drawer |
| `tablet-landscape`| 1024 × 768| iPad Pro / Surface Go | Multi-column command layout, live Leaflet map rendering |
| `desktop-command`| 1440 × 900| Command Center Console | 3-pane triage queue + GIS map + RescueFit recommendation drawer |

---

## 3. High-Priority Test Scenarios

### Test Suite A: SOS Lifecycle and Offline Outbox
- **TS-A01**: Citizen clicks SOS button (press-and-hold 2s) with network online -> verifies report created with UUID and committed to database as `RECEIVED`.
- **TS-A02**: Citizen submits SOS with network disconnected -> verifies report immediately persisted in IndexedDB `outbox` with status `SAVED_LOCAL`.
- **TS-A03**: Network restored -> verifies outbox background synchronizer automatically flushes pending item and transitions UI to `RECEIVED_STATION`.
- **TS-A04**: Idempotency check -> duplicate submission of same `client_reference_id` returns existing record without duplicating incident.

### Test Suite B: RescueFit Explainable Recommendation Engine
- **TS-B01**: Flood incident with 2 trapped people -> evaluates candidate teams:
  - Team A (Swift-water certified, zodiac boat, available): Marked `ELIGIBLE`, ranked #1 with 94% fit score and explicit explanation.
  - Team B (Close proximity, but lacks swift-water certification and boat): Excluded from primary flood dispatch; flagged as potential perimeter support.
  - Team C (Swift-water certified, but currently deployed on another mission): Excluded with "Active mission in progress".
- **TS-B02**: Human override -> Station Leader manually assigns Team B for secondary support -> audit event logs human override and reason.

### Test Suite C: Multi-Station Sync & Conflict Detection
- **TS-C01**: Two disconnected stations assign different teams to same incident -> sync harmonizer detects concurrent vector clock branch, marks incident `CONFLICT_DETECTED`, and routes to Regional Supervisor inbox.
- **TS-C02**: Station authentication -> reject sync packets signed with unauthorized or expired station credentials.

---

## 4. Rescue Team Mission Accept/Decline & Stepper Verification (Test Suite D)
- **TS-D01 (Accept Mission)**: Rescue member logs into `/team`, views active assignment `ASN-1004`, clicks `✓ ACCEPT MISSION` -> status transitions from `ASSIGNED` to `ACCEPTED` synchronously across assignment and incident models.
- **TS-D02 (Deployment Stepper)**: From `ACCEPTED`, responder clicks stepper progression button -> steps through `EN_ROUTE` -> `ON_SITE` -> `ASSISTING` -> `RESOLVED`.
- **TS-D03 (Decline Without Reason Blocked)**: Responder clicks `Decline` -> reason BottomSheet opens. `Confirm Decline` button is disabled until a reason chip (`Too far`, `No equipment`, `Already busy`, `Unsafe`, `Other`) is selected.
- **TS-D04 (Decline Reason Audit & Re-Triage)**: Responder selects reason chip `Too far` and submits -> assignment status becomes `DECLINED` with reason recorded; incident reverts to `TRIAGED` in Station Leader queue; assignment is recorded in team's `Mission Log` (History tab).
- **TS-D05 (Authorization Guard)**: Backend `POST /assignments/{id}/accept` and `/decline` verifies team membership; returns HTTP 403 Forbidden for non-members.

---

## 5. Automated Verification Results Summary

### Spring Boot JUnit 5 Test Suite (`mvn test`)
- `AssignmentAcceptDeclineTest`: 6 tests passing (accept status transition, decline with reason, decline without reason 400 error, unauthorized team member 403 error, repeat accept idempotency, fallback lookup by incident id).
- `IncidentLifecycleTest`: 3 tests passing (creation, valid state transitions, invalid transition rejection).
- `RescueFitEngineTest`: 1 test passing (eligibility filtering, negative exclusion explanations, weighted scoring).
- `SyncIdempotencyAndConflictTest`: 2 tests passing (event deduplication, concurrent branch conflict detection).
- **Total Backend Tests: 12 passed, 0 failures, 0 errors.**

### Frontend Unit & E2E Test Suite
- `Vitest`: 2 passed (Progress tracker states, accessible badges).
- `Playwright E2E (`frontend/run_e2e_verification.js` & `rescue-accept-decline.spec.ts`):
  1. `[✓] Homepage Zero-Popup 10s Window`: 0 alerts, 0 native dialogs, 0 unexpected modals.
  2. `[✓] Guest SOS Immediate Access (/sos)`: Guest SOS badge visible, emergency SOS ready with 0 auth popups.
  3. `[✓] Protected Route Clean Redirect to /login`: Clean redirect to `/login?redirect=%2Fdashboard`.
  4. `[✓] Login Autofill & Role Switch`: Credentials populate for `leader_north`.
  5. `[✓] Responsive 320px Zero Horizontal Overflow`: `scrollWidth <= innerWidth` at 320px.
  6. `[✓] Rescue Team Accept & Deployment Stepper`: Mission accepted, status transitioned `ACCEPTED` -> `EN_ROUTE`.
  7. `[✓] Rescue Team Decline Reason Validation & Audit Logging`: Decline blocked without chip, accepted with chip, removed from active, recorded in history.
- **Total E2E Tests: 7 passed, 0 failures, 0 errors.**


