# AmeniEdge: Multi-Station Disaster Response Walkthrough & Verification Script

## Demo Scenario: Coastal Monsoon Flood Disaster
- **Location**: Chennai Coastal District (Royapuram to Mylapore)
- **Condition**: Grid blackout, commercial cellular towers severed, fiber backhaul severed.
- **Active Edge Hardware**:
  - **Station North Command (`STA-CHN-N-001`)**: Running autonomous Spring Boot edge stack on battery power with local Wi-Fi SSID `AmeniEdge-Station-North-SOS`.
  - **Station South Command (`STA-CHN-S-002`)**: Autonomous edge node partitioned 8km south.
  - **Regional Central Hub**: Regional Supervisor Node.

---

## Step-by-Step Verification Script

### Phase 1: Disconnect Internet & Confirm Local Island Operation
1. Disconnect upstream WAN or disable internet on the test device.
2. Connect mobile phone / laptop to Station North local Wi-Fi (`192.168.4.1` or `http://localhost:5173`).
3. Verify top connectivity bar indicates:
   ```
   ● Station Connected (Local Mesh)
   ```
4. Verify all initial views, icons, and offline OpenStreetMap tiles render instantly without network latency.

---

### Phase 2: Citizen Emergency SOS Intake (Offline & Queued)
1. In the Citizen Portal (`Role: Citizen`), note the prominent **160px circular SOS Button**.
2. Tap **"Flood / Water"** emergency chip.
3. Tap **"+ Add Details / Victims"**:
   - Step 2: Set casualties to **4 persons** (using the large touch stepper).
   - Step 2: Enable toggle **"Immediate Threat to Life"** (water rising rapidly).
   - Step 3: Note GPS coordinate acquisition and enter landmark: `Basin Bridge 2nd Cross, Roof of Building #4`.
   - Step 4: Review and tap **"🚨 SEND SOS NOW"**.
4. **Instant Verification**:
   - Device displays **Emergency SOS Logged**.
   - Three-Stage Progress Tracker displays:
     - `Stage 1: Saved on this device` (Committed to IndexedDB outbox).
     - `Stage 2: Received by station` (Committed to Station North triage queue with UUID `client_reference_id`).
     - `Stage 3: Acknowledged by responder` (Pending leader assignment).

---

### Phase 3: Station Leader Triage & RescueFit Explainable Dispatch
1. Switch role to **"🎖️ Station Leader (North)"**.
2. In the Triage Queue, locate the incoming Critical (P1) Flood report.
3. Select the incident to open the **RescueFit Dispatch Intelligence Panel**:
   - **Team Alpha (Swift Water Alpha)**:
     - Ranked **#1 (Fit Score 94%)**.
     - Transparent Rationale: *"Verified for FLOOD response. Swift-water certified with aquatic craft. Available status. Estimated ETA: ~7 mins (850m). Telemetry verified live."*
   - **Team Beta (Urban Extrication Beta)**:
     - Flagged **EXCLUDED**: *"Excluded: Lacks mandatory swift-water or boat rescue training. Potential role: Ground triage at water boundary."*
   - **Team Charlie (Heavy Evacuation Charlie)**:
     - Flagged **EXCLUDED**: *"Excluded: Team is currently deployed on active mission (1 active)."*
4. Station Leader taps **"Assign Team"** for **Team Alpha**.
5. Incident status transitions to `ASSIGNED`.

---

### Phase 4: Rescue Team Field Mission Progression
1. Switch role to **"🚑 Rescue Team (Alpha)"**.
2. Note the pinned mission card displaying:
   - Category: Flood Rescue (4 Trapped)
   - Location: `Basin Bridge 2nd Cross`
3. Tap **"✓ ACCEPT MISSION"** (Incident transitions to `ACCEPTED`).
4. Tap **"🚗 DEPART: MARK EN ROUTE"** (Incident transitions to `EN_ROUTE`).
5. Open **"🗺️ Open in Map"** to verify offline route and hazard overlay (e.g. avoided downed power cable at Walltax Rd).
6. Tap **"📍 ARRIVED: MARK ON SITE"** (Incident transitions to `ON_SITE`).
7. Tap **"🏆 RESCUE COMPLETE: RESOLVED"** (Incident transitions to `RESOLVED`).

---

### Phase 5: Citizen Tracker Verification
1. Switch role back to **"👤 Citizen"** and navigate to **"My Reports"**.
2. Verify the 3-Stage Tracker now displays all 3 stages checked:
   - `Stage 1: Saved on device` [✓]
   - `Stage 2: Received by station` [✓]
   - `Stage 3: Acknowledged by responder` [✓] — Team Alpha marked `RESOLVED`.

---

### Phase 6: Multi-Station Sync & Conflict Arbitration
1. Station South connects via physical courier drive or restored UHF packet link.
2. A concurrent assignment to a boundary incident is replayed by Station South.
3. The sync harmonizer detects the divergent vector branch and marks the incident `CONFLICT_DETECTED`.
4. Switch role to **"🌐 Regional Supervisor"**:
   - Red banner alerts: **"Dual-Station Assignment Conflict Detected!"**.
   - Supervisor reviews both station timestamps and clicks **"Designate Team Alpha (North)"** to arbitrate.
   - Conflict is resolved and permanently logged in the **Admin Audit Vault**.
