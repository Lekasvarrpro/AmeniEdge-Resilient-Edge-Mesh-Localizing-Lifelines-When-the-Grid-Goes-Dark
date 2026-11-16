# AmeniEdge: Mobile-First UI/UX Design System Specification

## 1. Design Philosophy: Emergency Field Resilience
AmeniEdge is engineered first and foremost for users operating under acute physical distress: a terrified citizen trapped by floodwaters, or a soaked rescue responder wearing heavy work gloves in direct outdoor sunlight.

### Fundamental Tenets:
1. **Zero-Webfont Offline Speed**: System font stack only. No Google Fonts, Typekit, or external CDNs. Instant cold cache load in < 1.5s on low-end Android 8+ devices.
2. **One-Handed Thumb Zone Architecture**: All critical primary actions (SOS trigger, assignment accept/decline, status step transitions) live permanently in the bottom 35% of the mobile screen.
3. **Redundant Visual Signaling**: Never rely on color alone. Every badge, marker, or alert combines:
   - High-contrast color
   - Recognizable SVG icon
   - Explicit, plain-language text label (e.g., `[!] Critical (P1)`)
4. **Resilient Four-State Guarantee**: Every single component and view implements:
   - `Loading` (Content skeletons matching final dimensions, never raw spinning wheels)
   - `Empty` (Compassionate explanation and immediate next recommended step)
   - `Error` (Plain-language cause and single-tap retry button)
   - `Offline` (Explicit indication of local persistence and queued auto-sync)

---

## 2. Design Tokens (`src/styles/tokens.css`)

### Color Roles and Contrast Matrix (WCAG 2.1 AA Compliant >= 4.5:1 text, >= 3:1 graphical)

| Token Variable | Default Light Theme | Dark Theme (OLED Friendly) | High-Contrast Outdoor Theme | Primary Semantic Role |
|---|---|---|---|---|
| `--color-danger` | `#D92D20` (Red 700) | `#F97066` (Red 400) | `#FF0000` (Pure High Red) | SOS triggers, P1 Critical emergencies, hazards |
| `--color-danger-bg` | `#FEF3F2` (Red 50) | `#4E1111` (Deep Red) | `#FFFFFF` with 4px border | Alert containers, urgent banner backgrounds |
| `--color-warning` | `#B54708` (Amber 700) | `#FDB022` (Amber 400) | `#FFB700` (High Amber) | P2 Urgent incidents, stale telemetry (>15m) |
| `--color-warning-bg` | `#FFFAEB` (Amber 50) | `#3F2205` (Deep Amber) | `#000000` with amber text | Warnings, delayed sync notifications |
| `--color-success` | `#079455` (Green 700) | `#47CD89` (Green 400) | `#00E676` (Neon Green) | Station connected, report confirmed, mission resolved |
| `--color-success-bg` | `#ECFDF3` (Green 50) | `#052E16` (Deep Green) | `#FFFFFF` with green border | Verified receipts, completed milestones |
| `--color-info` | `#175CD3` (Blue 700) | `#70B3FF` (Blue 400) | `#00B0FF` (Vivid Blue) | Public bulletins, shelters, standard logistics |
| `--color-surface` | `#FFFFFF` | `#111827` (Gray 900) | `#FFFFFF` | Primary card and page canvas |
| `--color-surface-subtle` | `#F8FAFC` | `#1E293B` (Gray 800) | `#F0F0F0` | Input backgrounds, disabled zones, table headers |
| `--color-text-primary` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | `#000000` | Headings, core body copy, high legibility text |
| `--color-text-secondary` | `#475569` (Slate 600) | `#94A3B8` (Slate 400) | `#000000` (85% weight) | Metadata timestamps, category subtitles |
| `--color-border` | `#CBD5E1` (Slate 300) | `#334155` (Slate 700) | `#000000` (2px solid) | Card outlines, dividers, input borders |
| `--color-offline-badge` | `#64748B` (Slate 500) | `#475569` (Slate 600) | `#000000` | Device-saved outbox indicator |

### Typography Tokens
```css
:root {
  --font-family-system: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
  
  --font-size-xs: 0.75rem;     /* 12px - metadata badges only */
  --font-size-sm: 0.875rem;    /* 14px - secondary labels */
  --font-size-base: 1.0rem;    /* 16px - standard body, min form input size */
  --font-size-md: 1.125rem;    /* 18px - emphasized titles */
  --font-size-lg: 1.25rem;     /* 20px - card headers */
  --font-size-xl: 1.5rem;      /* 24px - modal & view headers */
  --font-size-2xl: 2.0rem;     /* 32px - emergency counters */
  --font-size-sos: 2.75rem;    /* 44px - SOS button label */

  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-loose: 1.625;
}
```

### Spacing Grid (4px Base Unit)
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px (Default phone horizontal gutter)
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-12`: 48px (Minimum touch target size)

### Touch and Motion Specifications
- **Minimum Interactive Target**: 48 × 48 px with at least 8 px clearance between interactive nodes.
- **SOS Button Dimensions**: Minimum 160 × 160 px (or 42% of mobile viewport width).
- **Reduced Motion**: All animations wrapped in `@media (prefers-reduced-motion: reduce)` disabling transitions to prevent battery consumption and vertigo.

---

## 3. Responsive Breakpoint Matrix

AmeniEdge layouts adapt fluidly across seven standardized breakpoints:

```
  320px         360px        480px          768px           1024px          1280px        1536px
[ Ultra-Small | Standard  | Large Mobile | Tablet Split  | Desktop Command| Large Monitor| Ultra-Wide ]
[ Phone (SE)  | Android   | Foldables    | 2-Pane Drawer | 3-Pane Triage  | Multi-Map    | Operations ]
```

### Viewport and Safe-Area Rules
- Viewport set to `viewport-fit=cover, width=device-width, initial-scale=1.0`.
- Vertical screen containers utilize `height: 100dvh` to ensure mobile browser address bars and software keyboards do not distort sticky bottom action bars.
- Padding rules incorporate device notches: `padding-bottom: max(16px, env(safe-area-inset-bottom))`.
- Strictly **zero horizontal overflow** at all widths >= 320px (`overflow-x: hidden`).

---

## 4. Key Screen Wireframes and Component Blueprints

### A. Citizen Emergency Screen (Phone Viewport)
```
+-----------------------------------------------------+
| [!] AmeniEdge  * Station North Connected * [Sync OK]|  <- Connectivity & Sync Bar
+-----------------------------------------------------+
|                                                     |
|  You are in reach of an operational edge station.   |
|                                                     |
|                  +---------------+                  |
|                  |               |                  |
|                  |     [SOS]     |  <- Minimum 160x160px
|                  |  PRESS & HOLD |     Circular Target
|                  |    (2 sec)    |     Pulsing Haptic
|                  |               |                  |
|                  +---------------+                  |
|                                                     |
|  Quick Category Select:                             |
|  [ [~] Flood ]  [ [+] Medical ]  [ [*] Fire ]       |
|  [ [!] Trapped] [ [?] Missing ]  [ [#] Other ]      |
|                                                     |
|  Estimated GPS: +/- 6 meters (Verified)             |
|                                                     |
|  [ + Add details (People, Location, Photo) ]        |
|                                                     |
+-----------------------------------------------------+
|  [SOS]   [My Reports]   [Map]   [Help/Guide] [Alerts]| <- Sticky Bottom Nav (48px)
+-----------------------------------------------------+
```

### B. Citizen Three-Stage Delivery Confirmation Tracker
```
+-----------------------------------------------------+
|                 EMERGENCY SOS SENT                  |
|              Report ID: #RSC-98214                  |
+-----------------------------------------------------+
|  Stage 1: Saved on this device             [OK]     |
|  ==> 22:24:02 - Stored in secure local outbox       |
|                                                     |
|  Stage 2: Received by Station North        [OK]     |
|  ==> 22:24:05 - Station triage queue entry verified |
|                                                     |
|  Stage 3: Acknowledged by Responder       [...]     |
|  ==> Pending triage dispatch by Station Leader      |
+-----------------------------------------------------+
|  WHAT TO DO NOW:                                    |
|  * Stay on highest available floor or ground        |
|  * Conserve phone battery (Switch to Battery Saver) |
|  * Keep this screen open                            |
+-----------------------------------------------------+
|  [ CALL 112 / EMERGENCY SERVICES ]                 |  <- Secondary fallback action
|  [ + Update Status or Add Victims ]                 |
+-----------------------------------------------------+
```

### C. Rescue Team Mission Dashboard (Field Glove-Friendly)
```
+-----------------------------------------------------+
| Team Alpha-1 (Swift Water)   [ AVAILABLE / ONDUTY v]|
+-----------------------------------------------------+
| CURRENT MISSION: INC-0042 (P1 CRITICAL)             |
| Type: FLOOD RESCUE (2 Trapped on Roof)              |
| Location: 142 River Road, Sector 3 (800m away)      |
| Assigned: 6 mins ago                                |
+-----------------------------------------------------+
| MISSION PROGRESSION STEPPER:                        |
| [X] Dispatched  --> [ ] En Route --> [ ] On Site    |
|                     --> [ ] Assisting --> [ ] Done  |
+-----------------------------------------------------+
| [   MARK: EN ROUTE (NEXT STEP)   ]                  | <- Huge Thumb Button (56px)
+-----------------------------------------------------+
| [ Open Offline Leaflet Map ]   [ Request Support ]  |
+-----------------------------------------------------+
```

### D. Station Leader Triage & RescueFit Dashboard (Desktop / Tablet Command)
```
+---------------------------------------------------------------------------------------+
| AmeniEdge Station Leader | Station North Node | System Status: Isolated Mesh [2 Teams]|
+--------------------------+------------------------------+-----------------------------+
| PRIORITIZED QUEUE (4)    | OFFLINE LEAFLET MAP          | RESCUEFIT RECOMMENDATION    |
|--------------------------|------------------------------|-----------------------------|
| [*] INC-0042 (P1 Critical| [Map display with pins]      | For: INC-0042 (Flood)       |
|     Flood / 2 Trapped    |   [*] INC-0042               |                             |
|     Age: 7m | Unassigned |   [o] Team Alpha (Avail)     | Eligible Teams:             |
|--------------------------|   [x] Team Beta (Missing eq) | 1. Team Alpha (94% Fit)     |
| [!] INC-0043 (P2 Urgent) |                              |    - Swift Water Certified  |
|     Elderly Medical      | Map Layers:                  |    - Zodiac boat equipped   |
|     Age: 14m | Assigned  | [X] Incidents [X] Teams      |    - ETA: 6 mins (800m)     |
|--------------------------| [X] Shelters  [ ] Hazards    |    - Active Load: 0 missions|
| [-] INC-0044 (P3 Routine)|                              |                             |
|     Road Blockage        |                              | Excluded Teams:             |
|     Age: 32m | Triage    |                              | * Team Beta (Lacks boat)    |
|--------------------------|------------------------------|-----------------------------|
| [ + Broadcast Alert ]    | Center: Station North        | [ CONFIRM DISPATCH: TEAM A ]|
+---------------------------------------------------------------------------------------+
```

---

## 5. UI Component Library Specifications (`src/components/ui/`)

1. **`Button`**: Accessible button with variants: `primary`, `secondary`, `danger`, `ghost`, `outline`. Supports `isLoading`, `icon`, `fullWidth`, and full keyboard activation (`Enter`, `Space`).
2. **`SOSButton`**: Large circular trigger with press-and-hold progress ring or double-confirm countdown. Emits haptic vibration (`navigator.vibrate`) on touch.
3. **`ConnectivityBar`**: Persistent viewport banner reporting 5 states: `Online`, `Station Connected`, `Offline (Saved on device)`, `Syncing (N items)`, and `Sync Error`.
4. **`ProgressTracker`**: Visual 3-stage delivery stepper for citizen reports (`Saved on device` -> `Received by station` -> `Acknowledged by responder`).
5. **`BottomSheet`**: Mobile swipe-down sheet with accessible focus trap for filter panels, incident detail, and map overlays.
6. **`DataTable`**: Responsive data table that renders standard rows on desktop/tablet (>= 768px) and automatically transforms into stacked touch cards on phones (< 768px).
7. **`MapShell`**: Leaflet wrapper configured with local tile caching, custom offline pins, attribution, and touch zoom controls.
8. **`StatusBadge` & `PriorityBadge`**: High-contrast badges pairing semantic SVG icon with text label.

---

## 6. Internationalization (i18n) and Accessibility (a11y) Budgets
- **Lighthouse Targets**: Accessibility >= 95, Performance >= 85, PWA >= 90.
- **RTL Support**: Built using CSS logical properties (`margin-inline-start`, `padding-inline`, `text-align: start`).
- **Screen Reader Announcements**: Live region (`aria-live="polite"`) updates for connectivity status transitions and SOS confirmation events.

---

## 7. Dark Bento Grid Command Center & Expanded Rescue Operations Suite

### Bento Grid Design Tokens
- Canvas Background: `--color-dash-bg: #090B10`
- Bento Card Surface: `--color-dash-card: #121620`
- Elevated Control Surface: `--color-dash-surface: #19202E`
- Bento Border: `--color-dash-border: #1F2737`
- High-Intensity Accent: `--color-dash-accent-blue: #2563EB`
- Typography: `#F8FAFC` high-contrast text with muted slate `#94A3B8` secondary labels.

### Modular Command Components (`src/components/dashboard/`)
1. **`Sidebar`**: Left navigation drawer with collapsible mobile toggle, brand badge, user role pill (`STATION_LEADER`, `REGIONAL_SUPERVISOR`, `ORGANIZATION_ADMIN`), dark/light theme switch, and live edge mesh status indicator.
2. **`Topbar`**: Operational sector dropdown pill, quick search input, tactical layer toggles, and high-visibility emergency broadcast button.
3. **`StatCard`**: High-density KPI metric tile featuring value, trend indicator percentage pill, sub-state counter chips, and animated glowing SVG waveform sparkline with target peak marker.
4. **`ChartCard`**: Vector graphics analytics cards including a semi-circular SVG capacity gauge with colored arc milestones and vertical rounded category breakdown bars.
5. **`ActivityList`**: Tactical feed featuring the RescueFit AI Dispatch Intelligence card with blue radial backglow, status pills, and direct dispatch action triggers.
6. **`DataTableCard`**: Dark Bento command table with column sorting, priority badges, category icons, and single-click incident selection.

### Expanded 8-Page Rescue Team Operations Experience (`/team`)
1. **Current Mission (Home)**: Active dispatch card with mission dossier specs, one-click `✓ ACCEPT MISSION` and `Decline` triggers, and a 4-step deployment progress tracker (`ACCEPTED` -> `EN ROUTE` -> `ON SITE` -> `ASSISTING` -> `RESOLVED`).
2. **Assignments Repository**: Filterable tabs for `Pending`, `Active`, `Completed`, and `Declined` dispatches.
3. **Mission Dossier (Detail)**: Full incident briefing with victim details, access route conditions, required specialized equipment, and offline Leaflet coordinate pin.
4. **Tactical Map**: Full-screen offline Leaflet map with incident markers, safety shelters, and water hazard perimeters.
5. **Crew & Gear (Team)**: Roster of active responders, certifications, deployed gear inventory, and one-tap team readiness state toggle (`AVAILABLE`, `BUSY`, `OFF_DUTY`).
6. **Mission Log (History)**: Chronological mission outcome history recording resolution times, rescued count, and decline justifications with timestamps.
7. **Alerts & Bulletins (Notifications)**: Real-time broadcast inbox with severity filters (`CRITICAL`, `WARNING`, `INFO`).
8. **Settings & Profile**: Local storage telemetry controls, offline tile package manager, VHF channel selection, and authenticated logout.


