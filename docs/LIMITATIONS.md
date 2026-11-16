# AmeniEdge: System Limitations, Technical Boundaries & Honesty Statement

## 1. Prototype Status and Honesty Disclosure
**AmeniEdge is an experimental research and development prototype.**
- It is **not** an accredited commercial emergency dispatch system and must **not** be deployed as an autonomous replacement for official municipal emergency response services (such as 911 in North America, 112 in the European Union and India, or 999 in the United Kingdom).
- Field deployment must always occur in collaboration with authorized civil defense authorities, incident command systems (ICS), and verified emergency management teams.

---

## 2. Networking and Edge Mesh Boundaries

### Wi-Fi Access Point vs. Mesh Reality
- Standard Wi-Fi access points (`hostapd` running on 802.11 b/g/n/ac/ax) **do not automatically mesh**.
- Placing two Station nodes in proximity does not create an ad-hoc multi-hop transport layer unless configured with IEEE 802.11s or Batman-adv mesh protocols on dedicated wireless interfaces.
- Inter-station communication requires either:
  1. A dedicated physical Ethernet or UHF/VHF packet radio backhaul.
  2. Point-to-point directional microwave or Starlink/satellite data links.
  3. A "Physical Data Mule" (a responder carrying an encrypted storage device or mobile transceiver that hops between station Wi-Fi zones to physically carry synchronization batches).

### Station Power and Hardware Constraints
- A station operates only as long as its local power source holds.
- In prolonged grid collapse events, stations require auxiliary lithium iron phosphate (LiFePO4) battery banks or photovoltaic solar generators.
- A sudden power loss without graceful shutdown may result in dirty filesystem states; local station databases must maintain write-ahead logging (WAL) with synchronous commits.

---

## 3. Geospatial, GPS, and Mapping Limitations

### Device GPS Dependence
- GPS location acquisition is entirely reliant on the client device's physical GNSS receiver (GPS, GLONASS, Galileo, BeiDou) and operating system permissions.
- Inside collapsed reinforced concrete structures, basements, or dense urban canyons, GPS accuracy may degrade significantly (from +/- 4 meters to +/- 200 meters) or fail completely.
- AmeniEdge handles this limitation by providing manual location fallback (landmark descriptions and offline map pin dragging), but this relies on victim consciousness and manual input.

### Offline Maps and Vector Tiles
- Map data is limited to the pre-packaged bounding box and zoom levels (typically zoom 0 to 16) cached on the local station. Zooming beyond available cached tiles will display a neutral coordinate grid.
- **Offline Routing**: Route calculation offline depends strictly on pre-compiled road network graphs (e.g. OSRM or Valhalla).
- **Live Traffic and Dynamic Hazards**: Real-time traffic congestion, temporary flood barricades, or sudden bridge collapses are not automatically known to the offline routing engine unless manually flagged as Hazard Polygons by the Station Leader.

---

## 4. Availability and Performance Targets

- **Availability Claims**: Any reference to "99.99% availability" (~52.6 minutes of unplanned downtime per year) represents an **aspirational design benchmark**, not a measured real-world guarantee. Actual uptime is subject to hardware ruggedness, battery endurance, environmental extremes, and operator training.
- **Latency**: Performance targets (< 1.5s cold load for the citizen SOS screen) are measured on modern Chromium and WebKit runtimes over local 2.4/5GHz 802.11n Wi-Fi connections under laboratory simulation. Low-cost legacy devices with degraded flash memory may observe higher latencies.

---

## 5. Security and Cryptographic Trade-offs in Disconnected Zones

- **Station Mutual Authentication**: While TLS protects communications within the station subnet, stations operating disconnected from internet Certificate Authorities must rely on pre-shared trusted station keys or a private regional Root CA.
- **Shared Field Devices**: Responders sharing mobile devices in the field must adhere to rapid PIN/passcode lock procedures to prevent unauthorized status changes.
- **Sensitive Victim Data**: Exact victim coordinates and medical notes are never exposed in public broadcasts or citizen dashboards. They are strictly restricted to authenticated rescue personnel and station commanders.

---

## 6. Automated Mission Lifecycles and Field Verification Honesty Disclosure

- **Simulation vs. Real Field Rescues**: The automated countdown timer and simulated progression (Dispatched -> En Route -> On Site -> Working -> Resolved) provide operational pacing and realistic queue cycling for simulation, testing, and training environments.
- **Limitations of Timers**: In a real disaster, a timer expiring does **not** prove that victims have been extracted, stabilized, or evacuated safely. Real operations encounter unforeseen obstacles, trapped secondary casualties, impassable debris, or worsening weather conditions.
- **Field Confirmation Setting**: AmeniEdge includes an explicit setting: `"Require field confirmation before auto-closing"`. When enabled on a mission, the system suspends automated resolution and requires explicit manual confirmation with an outcome report from the field responder before archiving the assignment and releasing personnel.

