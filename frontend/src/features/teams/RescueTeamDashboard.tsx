import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../lib/api/client';
import './RescueTeamDashboard.css';
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiMapPin,
  FiPhone,
  FiUsers,
  FiClock,
  FiShield,
  FiList,
  FiMap,
  FiBell,
  FiUser,
  FiSettings,
  FiActivity,
  FiCheckCircle,
  FiLogOut,
  FiRadio,
  FiNavigation,
  FiSearch,
  FiArrowRight,
  FiFileText,
  FiDownload,
  FiPlus,
  FiRefreshCw,
  FiGrid,
  FiMail,
  FiVideo,
  FiEdit,
  FiSliders,
} from 'react-icons/fi';
import { MdEmergency } from 'react-icons/md';
import { FaAmbulance, FaTruck } from 'react-icons/fa';

// Tactical Map Component using Leaflet with OSM + Cache fallback
interface TacticalMapProps {
  stationCoords: [number, number];
  incidentCoords: [number, number];
  truckCoords: [number, number];
  progressPercent: number;
  isArrived: boolean;
  distanceKm: number;
  etaSeconds: number;
  speedKmh: number;
  affectedPeople?: number;
  isResolved?: boolean;
  onSimulateArrival: () => void;
}

const TacticalMap: React.FC<TacticalMapProps> = ({
  stationCoords,
  incidentCoords,
  truckCoords,
  progressPercent,
  isArrived,
  distanceKm,
  etaSeconds,
  speedKmh,
  affectedPeople = 1,
  isResolved = false,
  onSimulateArrival,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const truckMarkerRef = useRef<L.Marker | null>(null);
  const incidentMarkerRef = useRef<L.Marker | null>(null);

  const buildIncidentIcon = (peopleCount: number, arrived: boolean, resolved: boolean) => {
    let badgeColor = '#DC2626';
    let statusText = `${peopleCount} people · Help on the way`;
    if (resolved) {
      badgeColor = '#10B981';
      statusText = `${peopleCount} rescued · Safe`;
    } else if (arrived) {
      badgeColor = '#2563EB';
      statusText = `${peopleCount} people · Help on site`;
    }

    return L.divIcon({
      className: 'inc-pin-people',
      html: `<div style="display:flex;flex-direction:column;align-items:center;pointer-events:auto;">
        <div style="background:${badgeColor};color:#fff;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.3);margin-bottom:4px;display:flex;align-items:center;gap:4px;border:1px solid rgba(255,255,255,0.4);">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" height="12px" width="12px" xmlns="http://www.w3.org/2000/svg">
            <path d="M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-512 0c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h66c6.2-47.4 34.8-87.3 75.1-109.4-11.6-11.5-27.5-18.6-45.1-18.6zm208-32c-44.2 0-80 35.8-80 80 0 44.2 35.8 80 80 80s80-35.8 80-80c0-44.2-35.8-80-80-80zm96 176c0-35.3-28.7-64-64-64h-64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h128c17.7 0 32-14.3 32-32v-32z"></path>
          </svg>
          <span>${statusText}</span>
        </div>
        <div style="background:${badgeColor};color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;font-weight:800;font-size:11px;box-shadow:0 3px 10px rgba(0,0,0,0.35);">
          ${peopleCount}
        </div>
      </div>`,
      iconSize: [140, 60],
      iconAnchor: [70, 56],
    });
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      return;
    }

    const midLat = (stationCoords[0] + incidentCoords[0]) / 2;
    const midLng = (stationCoords[1] + incidentCoords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [midLat, midLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    // 3-tier Tile Fallback: 1) Local station tiles -> 2) OSM -> 3) Grid fallback
    const localTileLayer = L.tileLayer('/api/v1/maps/tiles/{z}/{x}/{y}', {
      minZoom: 11,
      maxZoom: 16,
      attribution: '&copy; AmeniEdge Offline Tile Cache',
    }).addTo(map);

    localTileLayer.on('tileerror', () => {
      map.removeLayer(localTileLayer);
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      osmLayer.on('tileerror', () => {
        map.removeLayer(osmLayer);
        if (mapContainerRef.current) {
          mapContainerRef.current.style.backgroundColor = '#E2E8F0';
        }
      });
    });

    // Station Base Marker
    const stationIcon = L.divIcon({
      className: 'sta-pin',
      html: `<div style="background:#2563EB;color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;font-weight:800;font-size:10px;box-shadow:0 2px 8px rgba(37,99,235,0.4)">STA</div>`,
      iconSize: [30, 30],
      iconAnchor: [15, 15],
    });
    L.marker(stationCoords, { icon: stationIcon }).addTo(map).bindPopup('Station Headquarters Base');

    // Incident Marker with People count and dynamic status
    const incMarker = L.marker(incidentCoords, {
      icon: buildIncidentIcon(affectedPeople, isArrived, isResolved),
    }).addTo(map).bindPopup(`Incident Site: ${affectedPeople} people being assisted`);
    incidentMarkerRef.current = incMarker;

    // Route Polyline (dashed)
    L.polyline([stationCoords, incidentCoords], {
      color: '#2563EB',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.85,
    }).addTo(map);

    // Animated Truck Marker
    const truckIcon = L.divIcon({
      className: 'truck-pin',
      html: `<div style="background:#0F172A;color:#FACC15;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.3);font-size:15px;">
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 640 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
          <path d="M624 352h-16V243.9c0-12.7-5.1-24.9-14.1-33.9L494 110.1c-9-9-21.2-14.1-33.9-14.1H416V48c0-26.5-21.5-48-48-48H48C21.5 0 0 21.5 0 48v320c0 26.5 21.5 48 48 48h16c0 53 43 96 96 96s96-43 96-96h128c0 53 43 96 96 96s96-43 96-96h48c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zM160 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm320 0c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48zm80-208H464V160h30.1l77.9 77.9V256z"></path>
        </svg>
      </div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    truckMarkerRef.current = L.marker(truckCoords, { icon: truckIcon }).addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      truckMarkerRef.current = null;
      incidentMarkerRef.current = null;
    };
  }, []);

  // Update dynamic incident marker status
  useEffect(() => {
    if (incidentMarkerRef.current) {
      incidentMarkerRef.current.setIcon(buildIncidentIcon(affectedPeople, isArrived, isResolved));
    }
  }, [affectedPeople, isArrived, isResolved]);

  // Update truck position dynamically
  useEffect(() => {
    if (truckMarkerRef.current) {
      truckMarkerRef.current.setLatLng(truckCoords);
    }
  }, [truckCoords]);

  const formatMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="rescue-leaflet-container">
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Telemetry HUD Badge */}
      <div className="rescue-map-hud">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#2563EB' }}>
          <FaTruck />
          <span>{isArrived ? 'ON SITE' : 'EN ROUTE'}</span>
        </div>
        <span style={{ color: '#CBD5E1' }}>|</span>
        <div className="rescue-map-hud-item">
          Dist: <strong>{distanceKm.toFixed(1)} km</strong>
        </div>
        <span style={{ color: '#CBD5E1' }}>|</span>
        <div className="rescue-map-hud-item">
          Speed: <strong>{speedKmh} km/h</strong>
        </div>
        <span style={{ color: '#CBD5E1' }}>|</span>
        <div className="rescue-map-hud-item">
          ETA: <strong>{formatMinSec(etaSeconds)}</strong>
        </div>
      </div>

      {/* Manual fast-test simulation button */}
      {!isArrived && (
        <button
          onClick={onSimulateArrival}
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: '#FFFFFF',
            color: '#1E293B',
            fontSize: '11px',
            fontWeight: 700,
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          title="Simulate immediate vehicle arrival at scene"
        >
          <FiNavigation style={{ color: '#2563EB' }} />
          <span>Simulate Arrival</span>
        </button>
      )}

      {/* Arrival Banner */}
      {isArrived && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '10px',
            backgroundColor: '#059669',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 800,
            padding: '6px 12px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <FiCheckCircle />
          <span>Vehicle on-site. Field operations in progress.</span>
        </div>
      )}
    </div>
  );
};

export interface AlertQueueItem {
  incidentId: string;
  assignmentId?: string;
  stationId: string;
  stationName?: string;
  departmentName?: string;
  distanceKm?: number;
  forwardedFrom?: string;
  teamId?: string;
  category: string;
  priority: string;
  priorityScore: number;
  scoreExplanation?: string;
  affectedPeople: number;
  latitude?: number;
  longitude?: number;
  locationLandmark?: string;
  details?: string;
  contactName?: string;
  contactPhone?: string;
  vulnerablePresent: boolean;
  inHazardZone: boolean;
  requiredPersonnel: number;
  workTimeSeconds: number;
  assignmentStatus: string;
  lifecycleState: string;
  queueStatus: string;
  createdAt?: string;
  declineReason?: string;
  outcomeNote?: string;
  routingNotice?: string;
}

export interface CompletedMissionItem {
  missionId: string;
  category: string;
  casualties: string;
  duration: string;
  personnel: string;
  result: 'Well done' | 'Declined' | 'Completed';
  notes: string;
}

export interface DepartmentCapacityData {
  teamId: string;
  departmentName: string;
  totalPersonnel: number;
  availablePersonnel: number;
  deployedPersonnel: number;
  returningPersonnel: number;
}

export interface RescueTeamDashboardProps {
  onOpenMap?: () => void;
}

export const RescueTeamDashboard: React.FC<RescueTeamDashboardProps> = () => {
  const navigate = useNavigate();

  // Fresh initial state: start empty per user requirements
  const [alerts, setAlerts] = useState<AlertQueueItem[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [completedHistory, setCompletedHistory] = useState<CompletedMissionItem[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'OLDEST' | 'NEWEST'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [chainOfCustody, setChainOfCustody] = useState<any[]>([]);
  const [showCustody, setShowCustody] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // User identity and station configuration
  const userStr = localStorage.getItem('ameniedge_user');
  const user = userStr ? JSON.parse(userStr) : null;
  const currentTeamId = user?.teamId || localStorage.getItem('ameniedge_team_id') || 'TEAM-CHN-N-001';
  const currentStationId = user?.stationId || localStorage.getItem('ameniedge_station_id') || (
    currentTeamId.includes('-S-') ? 'STA-CHN-S-002' :
    currentTeamId.includes('-E-') ? 'STA-CHN-E-003' :
    currentTeamId.includes('-W-') ? 'STA-CHN-W-004' :
    'STA-CHN-N-001'
  );

  const getStationDisplayName = (stId: string) => {
    switch (stId) {
      case 'STA-CHN-S-002': return 'South Station - Tambaram';
      case 'STA-CHN-E-003': return 'East Station - Royapuram';
      case 'STA-CHN-W-004': return 'West Station - Ambattur';
      case 'STA-CHN-N-001':
      default: return 'North Station - Anna Nagar';
    }
  };
  const currentStationDisplayName = getStationDisplayName(currentStationId);

  const getStationCoords = (stId: string): [number, number] => {
    switch (stId) {
      case 'STA-CHN-S-002': return [12.9249, 80.1000];
      case 'STA-CHN-E-003': return [13.1143, 80.2974];
      case 'STA-CHN-W-004': return [13.1147, 80.1548];
      case 'STA-CHN-N-001':
      default: return [13.0827, 80.2707];
    }
  };
  const stationCoords: [number, number] = getStationCoords(currentStationId);

  const resolveDefaultDeptName = (tId: string, stName: string) => {
    const shortStation = stName.split(' - ')[0]; // e.g. "North Station"
    if (tId.includes('-001')) return `Flood Rescue Team - ${shortStation}`;
    if (tId.includes('-002')) {
      if (tId.includes('-S-')) return `Emergency Medical Team - ${shortStation}`;
      return `Fire Response Team - ${shortStation}`;
    }
    if (tId.includes('-003')) {
      if (tId.includes('-S-')) return `Fire Response Team - ${shortStation}`;
      return `Emergency Medical Team - ${shortStation}`;
    }
    if (tId.includes('-004')) return `Search & Rescue Team - ${shortStation}`;
    return `Emergency Rescue Department - ${shortStation}`;
  };

  const defaultDeptName = user?.teamName || localStorage.getItem('ameniedge_team_name') || resolveDefaultDeptName(currentTeamId, currentStationDisplayName);

  const [capacity, setCapacity] = useState<DepartmentCapacityData>({
    teamId: currentTeamId,
    departmentName: defaultDeptName,
    totalPersonnel: 120,
    availablePersonnel: 120,
    deployedPersonnel: 0,
    returningPersonnel: 0,
  });

  // Diagnostics & Connectivity State
  const [connectivityStatus, setConnectivityStatus] = useState<'Live' | 'Delayed' | 'Offline'>('Live');
  const [showDiagnostics, setShowDiagnostics] = useState<boolean>(false);
  const [diagnosticReports, setDiagnosticReports] = useState<any[]>([]);

  // Demo speed multiplier (default 1x as strictly required!)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const [requireFieldConfirmation, setRequireFieldConfirmation] = useState<boolean>(false);

  // Active mission telemetry
  const [truckProgress, setTruckProgress] = useState<number>(0);
  const [isArrived, setIsArrived] = useState<boolean>(false);
  const [telemetryDistance, setTelemetryDistance] = useState<number>(2.5);
  const [telemetryEta, setTelemetryEta] = useState<number>(225);
  const [workTimeRemaining, setWorkTimeRemaining] = useState<number>(180);

  // Modals
  const [showDeclineModal, setShowDeclineModal] = useState<boolean>(false);
  const [declineReasonChip, setDeclineReasonChip] = useState<string>('');
  const [declineReasonText, setDeclineReasonText] = useState<string>('');
  const [showProblemModal, setShowProblemModal] = useState<boolean>(false);
  const [problemReasonChip, setProblemReasonChip] = useState<string>('');
  const [problemReasonText, setProblemReasonText] = useState<string>('');
  const [isLoadingAction, setIsLoadingAction] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  // Diagnostics Fetcher
  const fetchDiagnostics = async () => {
    try {
      const res = await api.get<any[]>('/incidents');
      if (Array.isArray(res)) {
        setDiagnosticReports(res.slice(0, 10));
      }
    } catch {}
  };

  useEffect(() => {
    if (showDiagnostics) {
      fetchDiagnostics();
    }
  }, [showDiagnostics]);

  // 1. Fetch alerts & capacity on mount and poll
  const fetchAlertsAndCapacity = async () => {
    try {
      const uStr = localStorage.getItem('ameniedge_user');
      const u = uStr ? JSON.parse(uStr) : null;
      const tId = u?.teamId || localStorage.getItem('ameniedge_team_id') || currentTeamId;

      const tStart = Date.now();
      // Alerts
      const alertData = await api.get<AlertQueueItem[]>(`/alerts?teamId=${tId}`);
      const duration = Date.now() - tStart;
      setConnectivityStatus(duration > 3500 ? 'Delayed' : 'Live');
      setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      if (Array.isArray(alertData)) {
        setAlerts(alertData);
        setSelectedAlertId((prev) => {
          if (prev && alertData.some((a) => a.incidentId === prev)) {
            return prev;
          }
          return alertData.length > 0 ? alertData[0].incidentId : null;
        });
      }

      // Capacity
      try {
        const capData = await api.get<DepartmentCapacityData>(`/departments/${tId}/capacity`);
        if (capData && capData.totalPersonnel) {
          setCapacity(capData);
        }
      } catch {}
    } catch (err) {
      // Offline fallback
      setConnectivityStatus('Offline');
    }
  };

  useEffect(() => {
    fetchAlertsAndCapacity();
    const interval = setInterval(fetchAlertsAndCapacity, 5000);
    return () => clearInterval(interval);
  }, []);

  const selectedAlert = alerts.find((a) => a.incidentId === selectedAlertId) || (alerts.length > 0 ? alerts[0] : null);

  // 1b. Fetch chain of custody events for selected alert
  useEffect(() => {
    if (!selectedAlert?.incidentId) {
      setChainOfCustody([]);
      return;
    }
    api.get<any[]>(`/incidents/${selectedAlert.incidentId}/events`)
      .then((data) => {
        if (Array.isArray(data)) setChainOfCustody(data);
      })
      .catch(() => setChainOfCustody([]));
  }, [selectedAlert?.incidentId]);

  // 2. Telemetry polling for active mission
  useEffect(() => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    const isEnRoute = selectedAlert.lifecycleState === 'EN_ROUTE' || selectedAlert.assignmentStatus === 'ACCEPTED';
    const isOnSite = selectedAlert.lifecycleState === 'ON_SITE';

    if (isOnSite) {
      setIsArrived(true);
      setTruckProgress(100);
    }

    if (!isEnRoute && !isOnSite) return;

    const pollTelemetry = async () => {
      try {
        const tel = await api.get<any>(`/missions/${selectedAlert.assignmentId}/track`);
        if (tel) {
          setTruckProgress(tel.progressPercent || 0);
          setTelemetryDistance(tel.distanceRemainingKm !== undefined ? tel.distanceRemainingKm : tel.distanceKm);
          setTelemetryEta(tel.etaSeconds || 0);
          if (tel.isArrived) {
            setIsArrived(true);
          }
        }
      } catch {}
    };

    pollTelemetry();
    const trackInterval = setInterval(pollTelemetry, 2000);
    return () => clearInterval(trackInterval);
  }, [selectedAlert?.assignmentId, selectedAlert?.lifecycleState]);

  // 3. Work Timer Countdown for ON_SITE state
  useEffect(() => {
    if (!selectedAlert || selectedAlert.lifecycleState !== 'ON_SITE') return;
    const timer = setInterval(() => {
      setWorkTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCompletedHistory((prevHist) => [
            {
              missionId: '#' + (selectedAlert.incidentId?.replace('INC-', '') || '1004'),
              category: selectedAlert.category + ' Response',
              casualties: (selectedAlert.affectedPeople || 1) + ' Persons',
              duration: '3m 00s',
              personnel: (selectedAlert.requiredPersonnel || 8) + ' Members',
              result: 'Well done',
              notes: 'Field mission completed safely. Civilians evacuated.',
            },
            ...prevHist,
          ]);
          fetchAlertsAndCapacity();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedAlert?.lifecycleState]);

  // Actions
  const handleAcceptMission = async () => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    setIsLoadingAction(true);
    try {
      await api.post(`/assignments/${selectedAlert.assignmentId}/accept`, {
        demoSpeedMultiplier: speedMultiplier,
        fieldConfirmationRequired: requireFieldConfirmation,
      });
      triggerToast('Mission accepted! Squad dispatched and vehicle tracking engaged.');
      await fetchAlertsAndCapacity();
    } catch (err: any) {
      // In offline dev demo: advance state locally
      selectedAlert.lifecycleState = 'EN_ROUTE';
      selectedAlert.assignmentStatus = 'ACCEPTED';
      setAlerts([...alerts]);
      triggerToast('Mission accepted! Squad dispatched (Local Simulation).');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeclineMission = async () => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    const fullReason = [declineReasonChip, declineReasonText].filter(Boolean).join(' - ');
    if (!fullReason.trim()) {
      triggerToast('A mandatory reason is required to decline an emergency dispatch');
      return;
    }
    setIsLoadingAction(true);
    try {
      await api.post(`/assignments/${selectedAlert.assignmentId}/decline`, {
        reason: fullReason,
      });
      setCompletedHistory((prev) => [
        {
          missionId: '#' + (selectedAlert.incidentId?.replace('INC-', '') || '1004'),
          category: selectedAlert.category + ' Response',
          casualties: (selectedAlert.affectedPeople || 1) + ' Persons',
          duration: '-',
          personnel: '0 Members',
          result: 'Declined',
          notes: fullReason,
        },
        ...prev,
      ]);
      setShowDeclineModal(false);
      setDeclineReasonChip('');
      setDeclineReasonText('');
      triggerToast('Dispatch declined. Personnel released back to standby pool.');
      await fetchAlertsAndCapacity();
    } catch (err: any) {
      // Offline fallback: mark declined
      selectedAlert.lifecycleState = 'DECLINED';
      selectedAlert.declineReason = fullReason;
      setCompletedHistory((prev) => [
        {
          missionId: '#' + (selectedAlert.incidentId?.replace('INC-', '') || '1004'),
          category: selectedAlert.category + ' Response',
          casualties: (selectedAlert.affectedPeople || 1) + ' Persons',
          duration: '-',
          personnel: '0 Members',
          result: 'Declined',
          notes: fullReason,
        },
        ...prev,
      ]);
      setAlerts([...alerts]);
      setShowDeclineModal(false);
      triggerToast('Dispatch declined and recorded.');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleReportProblem = async () => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    const fullReason = [problemReasonChip, problemReasonText].filter(Boolean).join(' - ');
    if (!fullReason.trim()) {
      triggerToast('Please provide details of the operational problem');
      return;
    }
    setIsLoadingAction(true);
    try {
      await api.post(`/assignments/${selectedAlert.assignmentId}/report-problem`, {
        reason: fullReason,
      });
      setShowProblemModal(false);
      setProblemReasonChip('');
      setProblemReasonText('');
      triggerToast('Operational problem transmitted to Station Command');
      await fetchAlertsAndCapacity();
    } catch (err: any) {
      setShowProblemModal(false);
      triggerToast('Operational problem recorded (Local mode).');
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleExtendTime = async (seconds: number) => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    try {
      await api.post(`/assignments/${selectedAlert.assignmentId}/extend-time`, {
        additionalSeconds: seconds,
      });
      setWorkTimeRemaining((prev) => prev + seconds);
      triggerToast(`Work timer extended by ${seconds} seconds`);
    } catch (err: any) {
      setWorkTimeRemaining((prev) => prev + seconds);
      triggerToast(`Work timer extended by ${seconds} seconds (Simulated)`);
    }
  };

  const handleSimulateArrival = async () => {
    if (!selectedAlert || !selectedAlert.assignmentId) return;
    try {
      await api.patch(`/assignments/${selectedAlert.assignmentId}/telemetry`, {
        progress: 1.0,
        arrived: true,
      });
    } catch {}
    setIsArrived(true);
    setTruckProgress(100);
    selectedAlert.lifecycleState = 'ON_SITE';
    setAlerts([...alerts]);
    triggerToast('Vehicle arrived on-site.');
  };

  const filteredAlerts = alerts
    .filter((a) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        a.incidentId?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.locationLandmark?.toLowerCase().includes(q) ||
        a.contactName?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (filterMode === 'OLDEST') {
        return (a.createdAt || '').localeCompare(b.createdAt || '');
      }
      if (filterMode === 'NEWEST') {
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      }
      return (b.priorityScore || 0) - (a.priorityScore || 0);
    });

  const incLat = selectedAlert?.latitude || 13.089;
  const incLng = selectedAlert?.longitude || 80.279;
  const incidentCoords: [number, number] = [incLat, incLng];
  const truckCurLat = stationCoords[0] + (incidentCoords[0] - stationCoords[0]) * (truckProgress / 100);
  const truckCurLng = stationCoords[1] + (incidentCoords[1] - stationCoords[1]) * (truckProgress / 100);

  const availablePercent = Math.round(
    (capacity.availablePersonnel / Math.max(1, capacity.totalPersonnel)) * 100
  );

  return (
    <div className="rescue-root">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="rescue-toast">
          <FiAlertTriangle style={{ color: '#F59E0B' }} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Left Narrow Icon Sidebar */}
      <aside className="rescue-nav-sidebar">
        <div>
          <div className="rescue-logo-tile" onClick={() => navigate('/')} title="AmeniEdge Emergency Mesh">
            <FiShield />
          </div>

          <nav className="rescue-nav-list">
            <button
              onClick={() => navigate('/team')}
              className="rescue-nav-btn active"
              title="Patient & Rescue Alerts Queue"
              aria-label="Alerts Queue"
            >
              <FiGrid />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="rescue-nav-btn"
              title="Station Leader View"
              aria-label="Station Leader View"
            >
              <FiList />
            </button>
            <button
              onClick={() => navigate('/regional')}
              className="rescue-nav-btn"
              title="Tactical Map"
              aria-label="Tactical Map"
            >
              <FiMap />
            </button>
            <button
              onClick={() => navigate('/admin')}
              className="rescue-nav-btn"
              title="Admin Portal"
              aria-label="Admin Portal"
            >
              <FiSettings />
            </button>
          </nav>
        </div>

        <div className="rescue-nav-bottom">
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="rescue-nav-btn"
            style={{ color: '#EF4444' }}
            title="Log Out"
            aria-label="Log Out"
          >
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* 2. Secondary Queue Column ("Patient Queue" / Rescue Alerts) */}
      <section className="rescue-queue-panel">
        <div className="rescue-queue-header">
          <div className="rescue-queue-title-row">
            <h2>Rescue Alerts</h2>
            <span className="rescue-queue-count-pill">{filteredAlerts.length} Active</span>
          </div>

          {/* Filter tabs: All, Oldest, Newest */}
          <div className="rescue-filter-tabs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`rescue-filter-tab-btn ${filterMode === 'ALL' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setFilterMode('OLDEST')}
              className={`rescue-filter-tab-btn ${filterMode === 'OLDEST' ? 'active' : ''}`}
            >
              Oldest
            </button>
            <button
              onClick={() => setFilterMode('NEWEST')}
              className={`rescue-filter-tab-btn ${filterMode === 'NEWEST' ? 'active' : ''}`}
            >
              Newest
            </button>
          </div>

          {/* Search Box */}
          <div className="rescue-search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search category, ID or caller..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rescue-search-input"
            />
          </div>
        </div>

        {/* Alerts List */}
        <div className="rescue-queue-list">
          {filteredAlerts.length === 0 ? (
            <div style={{ padding: '48px 16px', textAlign: 'center', color: '#64748B' }}>
              <FiCheckCircle style={{ fontSize: '36px', color: '#10B981', margin: '0 auto 10px' }} />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', margin: '0 0 6px 0' }}>No Active Alerts</h4>
              <p style={{ fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
                All quiet in this sector. Standby for citizen emergency dispatches.
              </p>
            </div>
          ) : (
            filteredAlerts.map((item) => {
              const isSelected = item.incidentId === selectedAlertId;
              return (
                <div
                  key={item.incidentId}
                  onClick={() => setSelectedAlertId(item.incidentId)}
                  className={`rescue-queue-item ${isSelected ? 'selected' : ''}`}
                >
                  {/* Category Circle Icon */}
                  <div
                    className="rescue-queue-avatar"
                    style={{
                      backgroundColor: item.category === 'FLOOD' ? '#EFF6FF' : '#FEF2F2',
                      color: item.category === 'FLOOD' ? '#2563EB' : '#DC2626',
                    }}
                  >
                    {item.category === 'FLOOD' ? <FaAmbulance /> : <MdEmergency />}
                  </div>

                  {/* Content */}
                  <div className="rescue-queue-info">
                    <div className="rescue-queue-name-row">
                      <h3 className="rescue-queue-name">{item.contactName || `${item.category} Incident`}</h3>
                      <span
                        className={`rescue-priority-pill ${
                          item.priority?.includes('P1')
                            ? 'critical'
                            : item.priority?.includes('P2')
                            ? 'urgent'
                            : 'routine'
                        }`}
                      >
                        {item.priority?.replace('P1_', '').replace('P2_', '').replace('P3_', '')}
                      </span>
                    </div>

                    <p className="rescue-queue-sub">
                      <FiMapPin style={{ marginRight: '2px', verticalAlign: 'text-bottom' }} />
                      {item.locationLandmark || 'Sector Area'}
                      {item.distanceKm ? ` (${item.distanceKm} km away)` : ''}
                    </p>

                    <div style={{ fontSize: '11px', color: '#2563EB', fontWeight: 600, marginTop: '2px' }}>
                      {item.stationName || currentStationDisplayName} • {item.departmentName || `${item.category} Rescue`}
                    </div>

                    {item.forwardedFrom && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                          Forwarded from {item.forwardedFrom}
                        </span>
                      </div>
                    )}

                    {item.routingNotice && (
                      <div style={{ marginTop: '4px', fontSize: '11px', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '3px 6px', borderRadius: '4px', border: '1px solid #BAE6FD', lineHeight: 1.3 }}>
                        {item.routingNotice}
                      </div>
                    )}

                    {alerts.some((other) => other.incidentId !== item.incidentId && other.category === item.category && (other.locationLandmark?.toLowerCase() === item.locationLandmark?.toLowerCase() || (item.latitude && other.latitude && Math.abs(item.latitude - other.latitude) < 0.003 && Math.abs((item.longitude || 0) - (other.longitude || 0)) < 0.003))) && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#B45309', backgroundColor: '#FEF3C7', padding: '2px 6px', borderRadius: '4px' }}>
                          Possible duplicate incident
                        </span>
                      </div>
                    )}

                    <div className="rescue-queue-meta">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#64748B' }}>
                        <FiUsers /> {item.affectedPeople} affected
                      </span>
                      <span style={{ fontWeight: 700, color: '#2563EB' }}>Score: {item.priorityScore?.toFixed(0)}</span>
                    </div>
                  </div>

                  <div className="rescue-queue-arrow">
                    <FiArrowRight />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 3. Main Workspace Area */}
      <main className="rescue-main-area">
        {/* Topbar */}
        <header className="rescue-topbar">
          <nav className="rescue-breadcrumbs" aria-label="Breadcrumbs">
            <span className="rescue-breadcrumb-root">Rescue Command</span>
            <span className="rescue-breadcrumb-sep">/</span>
            <span style={{ fontWeight: 700, color: '#0F172A' }}>{capacity.departmentName}</span>
            <span className="rescue-breadcrumb-sep">/</span>
            <span className="rescue-breadcrumb-current">
              {selectedAlert ? selectedAlert.contactName || `Mission #${selectedAlert.incidentId}` : 'Standby'}
            </span>
          </nav>

          <div className="rescue-topbar-right">
            {/* Live Status Chip: Live / Delayed / Offline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '6px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 8px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 700,
                  backgroundColor: connectivityStatus === 'Live' ? '#ECFDF5' : connectivityStatus === 'Delayed' ? '#FFFBEB' : '#F1F5F9',
                  color: connectivityStatus === 'Live' ? '#059669' : connectivityStatus === 'Delayed' ? '#D97706' : '#64748B',
                  border: `1px solid ${connectivityStatus === 'Live' ? '#A7F3D0' : connectivityStatus === 'Delayed' ? '#FDE68A' : '#CBD5E1'}`,
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: connectivityStatus === 'Live' ? '#10B981' : connectivityStatus === 'Delayed' ? '#F59E0B' : '#94A3B8',
                  }}
                />
                {connectivityStatus}
              </span>
              <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                last updated {lastRefreshedAt}
              </span>
            </div>

            <button
              onClick={() => setShowDiagnostics((prev) => !prev)}
              className="rescue-icon-action-btn"
              title="Toggle Live Routing Diagnostics"
              aria-label="Toggle Live Routing Diagnostics"
              style={{ color: showDiagnostics ? '#2563EB' : undefined }}
            >
              <FiActivity />
            </button>

            <button
              onClick={() => fetchAlertsAndCapacity()}
              className="rescue-icon-action-btn"
              title="Refresh Queue"
              aria-label="Refresh Queue"
            >
              <FiRefreshCw />
            </button>

            <button
              className="rescue-icon-action-btn"
              title="Alert Notifications"
              aria-label="Alert Notifications"
            >
              <FiBell />
              {filteredAlerts.length > 0 && <span className="rescue-unread-dot" />}
            </button>

            <div className="rescue-user-profile-badge">
              <div className="rescue-user-avatar">
                {user?.fullName ? user.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'RL'}
              </div>
              <div>
                <p className="rescue-user-name">{user?.fullName || 'Rescue Squad Lead'}</p>
                <p className="rescue-user-role">{capacity.departmentName}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Canvas Body */}
        <div className="rescue-content-canvas">
          {/* 4. Top Profile Header Banner Card (Jerome Bellingham Banner Adaptation) */}
          <section className="rescue-profile-banner">
            <div className="rescue-profile-left">
              <div className="rescue-profile-avatar-large">
                <FiUser />
              </div>
              <div className="rescue-profile-name-group">
                <h1>
                  <span>{selectedAlert ? selectedAlert.contactName || (`Mission #${selectedAlert.incidentId}`) : capacity.departmentName}</span>
                  <span className="rescue-member-pill">{selectedAlert ? 'ACTIVE DISPATCH' : 'ALL UNITS STANDBY'}</span>
                </h1>
                <p className="rescue-profile-subtitle">
                  {capacity.departmentName} | {currentStationDisplayName} | VHF: 156.800 MHz (Ch 16) - Connected
                </p>
              </div>
            </div>

            <div className="rescue-banner-right">
              {/* Communication Icons matching template banner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button className="rescue-icon-action-btn" title="Send Field Dispatch Note" aria-label="Send Note">
                  <FiMail />
                </button>
                <button className="rescue-icon-action-btn" title="Call Emergency Contact" aria-label="Call Contact">
                  <FiPhone />
                </button>
                <button className="rescue-icon-action-btn" title="VHF Radio Broadcast" aria-label="VHF Broadcast">
                  <FiRadio />
                </button>
                <button className="rescue-icon-action-btn" title="Drone Video Feed" aria-label="Drone Video">
                  <FiVideo />
                </button>
                <button className="rescue-icon-action-btn" title="Edit Dispatch Details" aria-label="Edit Details">
                  <FiEdit />
                </button>
              </div>

              {/* Headcount Pool */}
              <div className="rescue-headcount-strip">
                <div className="rescue-headcount-stat">
                  <span className="rescue-stat-label">Total</span>
                  <span className="rescue-stat-val">{capacity.totalPersonnel}</span>
                </div>
                <div className="rescue-headcount-sep" />
                <div className="rescue-headcount-stat">
                  <span className="rescue-stat-label" style={{ color: '#059669' }}>Available</span>
                  <span className="rescue-stat-val" style={{ color: '#059669' }}>{capacity.availablePersonnel}</span>
                </div>
                <div className="rescue-headcount-sep" />
                <div className="rescue-headcount-stat">
                  <span className="rescue-stat-label" style={{ color: '#2563EB' }}>Deployed</span>
                  <span className="rescue-stat-val" style={{ color: '#2563EB' }}>{capacity.deployedPersonnel}</span>
                </div>
                <div className="rescue-headcount-sep" />
                <div className="rescue-headcount-stat">
                  <span className="rescue-stat-label" style={{ color: '#7C3AED' }}>Returning</span>
                  <span className="rescue-stat-val" style={{ color: '#7C3AED' }}>{capacity.returningPersonnel || 0}</span>
                </div>
              </div>

              {/* Demo Speed Multiplier: default 1x */}
              <div className="rescue-demo-speed-box">
                <span className="rescue-demo-speed-label">Speed:</span>
                <button
                  onClick={() => setSpeedMultiplier(1.0)}
                  className={`rescue-speed-btn ${speedMultiplier === 1.0 ? 'active' : ''}`}
                >
                  1x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(5.0)}
                  className={`rescue-speed-btn ${speedMultiplier === 5.0 ? 'active' : ''}`}
                >
                  5x
                </button>
                <button
                  onClick={() => setSpeedMultiplier(10.0)}
                  className={`rescue-speed-btn ${speedMultiplier === 10.0 ? 'active' : ''}`}
                >
                  10x
                </button>
              </div>
            </div>
          </section>

          {/* 5. Bento Grid Layout matching Jerome Bellingham */}
          {selectedAlert ? (
            <div className="rescue-bento-grid">
              {/* Card 1: Basic Informational (Row 1 Col 1) */}
              <div className="rescue-card">
                <div className="rescue-card-title">
                  <span>Basic Informational</span>
                  <FiUser style={{ color: '#94A3B8' }} />
                </div>

                <div className="rescue-info-list">
                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Victim / Contact Name</span>
                    <p className="rescue-info-value">{selectedAlert.contactName || 'Anonymous Resident'}</p>
                  </div>

                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Phone Number</span>
                    <p className="rescue-info-value">
                      <FiPhone style={{ color: '#2563EB' }} />
                      <span>{selectedAlert.contactPhone || '+91 98401 23456'}</span>
                    </p>
                  </div>

                  <div className="rescue-info-row">
                    <span className="rescue-info-label">GPS & Landmark</span>
                    <p className="rescue-info-value">
                      <FiMapPin style={{ color: '#DC2626' }} />
                      <span>{selectedAlert.locationLandmark}</span>
                    </p>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Coordinates: {incLat.toFixed(4)}, {incLng.toFixed(4)}
                    </span>
                  </div>

                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Why This Alert Reached You</span>
                    <div style={{ fontSize: '11px', color: '#0369A1', backgroundColor: '#F0F9FF', padding: '6px 10px', borderRadius: '6px', border: '1px solid #BAE6FD', marginTop: '2px', lineHeight: 1.4 }}>
                      {selectedAlert.routingNotice || `Routed to ${capacity.departmentName}: nearest station with available personnel`}
                    </div>
                  </div>

                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Priority Score Rationale</span>
                    <div className="rescue-score-rationale-box">
                      {selectedAlert.scoreExplanation || 'Base (30) + 4 affected (+20) = 50.0'}
                    </div>
                  </div>

                  {/* Chain of Custody Expandable Timeline */}
                  <div className="rescue-info-row" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', marginTop: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="rescue-info-label" style={{ margin: 0 }}>Chain of Custody ({chainOfCustody.length})</span>
                      <button
                        onClick={() => setShowCustody(!showCustody)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          padding: '2px 6px',
                        }}
                      >
                        {showCustody ? 'Hide Log' : 'View Audit Trail'}
                      </button>
                    </div>

                    {showCustody && (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                        {chainOfCustody.length === 0 ? (
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>No recorded lifecycle events yet</span>
                        ) : (
                          chainOfCustody.map((evt, idx) => (
                            <div
                              key={evt.id || idx}
                              style={{
                                fontSize: '11px',
                                padding: '4px 8px',
                                backgroundColor: '#F8FAFC',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1E293B' }}>
                                <span>{evt.eventType}</span>
                                <span style={{ color: '#64748B', fontWeight: 500 }}>
                                  {evt.timestamp ? new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                                </span>
                              </div>
                              <div style={{ color: '#64748B', marginTop: '2px' }}>
                                Actor: {evt.actorRole || 'SYSTEM'} ({evt.actorId || 'Edge node'})
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Card 2: Tactical Navigation Map & Active Dispatch (Row 1 Col 2) */}
              <div className="rescue-card rescue-map-card">
                <div className="rescue-card-title">
                  <span>Tactical Navigation Route</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: selectedAlert.lifecycleState === 'ON_SITE' ? '#D1FAE5' : '#EFF6FF',
                        color: selectedAlert.lifecycleState === 'ON_SITE' ? '#059669' : '#2563EB',
                      }}
                    >
                      {selectedAlert.lifecycleState}
                    </span>
                  </div>
                </div>

                <TacticalMap
                  stationCoords={stationCoords}
                  incidentCoords={incidentCoords}
                  truckCoords={[truckCurLat, truckCurLng]}
                  progressPercent={truckProgress}
                  isArrived={isArrived}
                  distanceKm={telemetryDistance}
                  etaSeconds={telemetryEta}
                  speedKmh={40}
                  affectedPeople={selectedAlert?.affectedPeople || 1}
                  isResolved={selectedAlert?.lifecycleState === 'RESOLVED' || selectedAlert?.assignmentStatus === 'COMPLETED'}
                  onSimulateArrival={handleSimulateArrival}
                />

                {/* Mission Accept / Decline Actions */}
                <div className="rescue-actions-row">
                  {selectedAlert.lifecycleState === 'OFFERED' ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <button
                        onClick={handleAcceptMission}
                        disabled={isLoadingAction}
                        className="rescue-btn-accept"
                      >
                        <FiCheck />
                        <span>Accept Dispatch ({selectedAlert.requiredPersonnel || 8} Members)</span>
                      </button>
                      <button
                        onClick={() => setShowDeclineModal(true)}
                        disabled={isLoadingAction}
                        className="rescue-btn-decline"
                      >
                        <FiX />
                        <span>Decline</span>
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                      <button
                        onClick={() => setShowProblemModal(true)}
                        className="rescue-btn-problem"
                      >
                        <FiAlertTriangle />
                        <span>Report Field Problem</span>
                      </button>
                      {selectedAlert.lifecycleState === 'ON_SITE' && (
                        <button
                          onClick={() => handleExtendTime(60)}
                          className="rescue-btn-extend"
                        >
                          <FiPlus />
                          <span>Extend Work (+1m)</span>
                        </button>
                      )}
                    </div>
                  )}

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', cursor: 'pointer', marginTop: '6px' }}>
                    <input
                      type="checkbox"
                      checked={requireFieldConfirmation}
                      onChange={(e) => setRequireFieldConfirmation(e.target.checked)}
                      style={{ accentColor: '#2563EB' }}
                    />
                    <span>Require field confirmation before auto-closing</span>
                  </label>
                </div>
              </div>

              {/* Right Stack (Row 1 Col 3): Data of Assurance & Member Dentalica */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Card 3: Data of Assurance Gradient Card */}
                <div className="rescue-card-assurance">
                  <div>
                    <p className="rescue-assurance-label">Emergency Incident Token</p>
                    <div className="rescue-assurance-code">234-234-232-32</div>
                  </div>
                  <div className="rescue-assurance-foot">
                    <span>ETA Limit: 23:45 UTC</span>
                    <span style={{ fontWeight: 800 }}>Channel 16 Live</span>
                  </div>
                </div>

                {/* Card 4: Member Dentalica (Capacity Gauge) */}
                <div className="rescue-card rescue-card-capacity">
                  <div className="rescue-card-title">
                    <span>Department Capacity</span>
                    <FiSliders style={{ color: '#94A3B8' }} />
                  </div>
                  <div className="rescue-capacity-body">
                    <div className="rescue-capacity-ring-container">
                      <svg style={{ transform: 'rotate(-90deg)', width: '80px', height: '80px' }} viewBox="0 0 36 36">
                        <path
                          strokeWidth="3.5"
                          stroke="#F1F5F9"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          strokeDasharray={`${availablePercent}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="#2563EB"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="rescue-capacity-number">{availablePercent}%</span>
                    </div>
                    <div className="rescue-capacity-details">
                      <h3 className="rescue-capacity-count">{capacity.availablePersonnel} / {capacity.totalPersonnel} Members</h3>
                      <p className="rescue-capacity-sub">{capacity.deployedPersonnel} deployed on missions</p>
                      <div>
                        <span className="rescue-capacity-pill">Next unit: Immediate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Appointment Schedule (Progression Timeline Stepper) */}
              <div className="rescue-card rescue-card-stepper">
                <div className="rescue-card-title">
                  <span>Mission Progression Schedule</span>
                  {selectedAlert.lifecycleState === 'ON_SITE' && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiClock /> Work Timer: {Math.floor(workTimeRemaining / 60)}m {workTimeRemaining % 60}s
                    </span>
                  )}
                </div>

                <div className="rescue-stepper-list">
                  <div className="rescue-step-item">
                    <span className={`rescue-step-bullet ${selectedAlert.lifecycleState !== 'OFFERED' ? 'completed' : ''}`} />
                    <span className="rescue-step-date">Milestone 1</span>
                    <h4 className="rescue-step-title">Dispatched & Team Assigned</h4>
                    <p className="rescue-step-desc">{selectedAlert.requiredPersonnel || 8} personnel deployed from Base</p>
                  </div>

                  <div className="rescue-step-item">
                    <span className={`rescue-step-bullet ${selectedAlert.lifecycleState === 'EN_ROUTE' ? 'current' : isArrived ? 'completed' : ''}`} />
                    <span className="rescue-step-date">Milestone 2</span>
                    <h4 className="rescue-step-title">En Route to Incident Site</h4>
                    <p className="rescue-step-desc">Vehicle traveling at 40 km/h along route</p>
                  </div>

                  <div className="rescue-step-item">
                    <span className={`rescue-step-bullet ${isArrived ? 'completed' : ''}`} />
                    <span className="rescue-step-date">Milestone 3</span>
                    <h4 className="rescue-step-title">Arrived On Scene & Triage</h4>
                    <p className="rescue-step-desc">Automatic arrival trigger at scene</p>
                  </div>

                  <div className="rescue-step-item">
                    <span className={`rescue-step-bullet ${selectedAlert.queueStatus === 'COMPLETED' ? 'completed' : ''}`} />
                    <span className="rescue-step-date">Milestone 4</span>
                    <h4 className="rescue-step-title">Mission Resolved & Returning</h4>
                    <p className="rescue-step-desc">Casualties secured; squad returns to base</p>
                  </div>
                </div>
              </div>

              {/* Row 2: History Dental (Completed Missions History Table - Span 2) */}
              <div className="rescue-card rescue-card-table">
                <div className="rescue-card-title">
                  <span>Completed Missions History</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Autonomous Audit Record</span>
                </div>

                <table className="rescue-table">
                  <thead>
                    <tr>
                      <th>Mission ID</th>
                      <th>Category</th>
                      <th>Casualties</th>
                      <th>Duration</th>
                      <th>Personnel</th>
                      <th>Result</th>
                      <th>Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#94A3B8' }}>
                          No completed missions yet in this shift. Autonomous log will populate upon mission completion.
                        </td>
                      </tr>
                    ) : (
                      completedHistory.map((item) => (
                        <tr key={item.missionId}>
                          <td style={{ fontWeight: 800 }}>{item.missionId}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: item.result === 'Declined' ? '#DC2626' : '#2563EB' }}>
                              {item.result === 'Declined' ? <FiAlertTriangle /> : <FaAmbulance />} {item.category}
                            </span>
                          </td>
                          <td>{item.casualties}</td>
                          <td>{item.duration}</td>
                          <td>{item.personnel}</td>
                          <td>
                            <span className={`rescue-table-pill ${item.result === 'Declined' ? 'declined' : 'success'}`}>
                              {item.result}
                            </span>
                          </td>
                          <td style={{ color: item.result === 'Declined' ? '#DC2626' : '#64748B' }}>{item.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Row 2: Agreement of Document (SOP Directives) */}
              <div className="rescue-card">
                <div className="rescue-card-title">
                  <span>Agreement of Document</span>
                  <FiFileText style={{ color: '#94A3B8' }} />
                </div>

                <div className="rescue-doc-list">
                  <div className="rescue-doc-item">
                    <div className="rescue-doc-left">
                      <FiFileText className="rescue-doc-icon" />
                      <div>
                        <h4 className="rescue-doc-name">Standard_Operating_Procedure_Evacuation.pdf</h4>
                        <p className="rescue-doc-size">1.8 mb</p>
                      </div>
                    </div>
                    <button className="rescue-doc-dl-btn" aria-label="Download Document">
                      <FiDownload />
                    </button>
                  </div>

                  <div className="rescue-doc-item">
                    <div className="rescue-doc-left">
                      <FiFileText className="rescue-doc-icon" />
                      <div>
                        <h4 className="rescue-doc-name">Medical_Triage_and_Field_Protocol.pdf</h4>
                        <p className="rescue-doc-size">1.2 mb</p>
                      </div>
                    </div>
                    <button className="rescue-doc-dl-btn" aria-label="Download Document">
                      <FiDownload />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standby State Bento Grid */
            <div className="rescue-bento-grid">
              {/* Standby Card 1: Base Station Operations */}
              <div className="rescue-card">
                <div className="rescue-card-title">
                  <span>Base Station Operations</span>
                  <FiShield style={{ color: '#2563EB' }} />
                </div>
                <div className="rescue-info-list">
                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Assigned Station</span>
                    <p className="rescue-info-value">{currentStationDisplayName}</p>
                  </div>
                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Department</span>
                    <p className="rescue-info-value">{capacity.departmentName}</p>
                  </div>
                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Telemetry Status</span>
                    <p className="rescue-info-value">
                      <FiRadio style={{ color: '#059669' }} />
                      <span>156.800 MHz (Ch 16) - Mesh Operational</span>
                    </p>
                  </div>
                  <div className="rescue-info-row">
                    <span className="rescue-info-label">Standby Readiness</span>
                    <p className="rescue-info-value" style={{ color: '#059669', fontWeight: 700 }}>
                      <FiCheckCircle style={{ color: '#059669' }} /> Ready for Immediate Dispatch
                    </p>
                  </div>
                </div>
              </div>

              {/* Standby Card 2: Sector Tactical Map */}
              <div className="rescue-card" style={{ padding: '0', overflow: 'hidden' }}>
                <div style={{ height: '240px', width: '100%' }}>
                  <TacticalMap
                    stationCoords={stationCoords}
                    incidentCoords={stationCoords}
                    truckCoords={stationCoords}
                    progressPercent={0}
                    isArrived={false}
                    distanceKm={0}
                    etaSeconds={0}
                    speedKmh={0}
                    onSimulateArrival={() => {}}
                  />
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>Base Sector Coverage Active</span>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>0 Active Dispatches</span>
                </div>
              </div>

              {/* Standby Card 3: Data of Assurance Gradient Card */}
              <div className="rescue-card-assurance">
                <div>
                  <p className="rescue-assurance-label">Emergency Incident Token</p>
                  <div className="rescue-assurance-code">STANDBY-MONITORING</div>
                </div>
                <div className="rescue-assurance-foot">
                  <span>Sector Status: Normal Ops</span>
                  <span style={{ fontWeight: 800 }}>Channel 16 Live</span>
                </div>
              </div>

              {/* Standby Card 4: Department Capacity (Capacity Gauge) */}
              <div className="rescue-card rescue-card-capacity">
                <div className="rescue-card-title">
                  <span>Department Capacity</span>
                  <FiSliders style={{ color: '#94A3B8' }} />
                </div>
                <div className="rescue-capacity-body">
                  <div className="rescue-capacity-ring-container">
                    <svg style={{ transform: 'rotate(-90deg)', width: '80px', height: '80px' }} viewBox="0 0 36 36">
                      <path
                        strokeWidth="3.5"
                        stroke="#F1F5F9"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeDasharray={`${availablePercent}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="#2563EB"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="rescue-capacity-number">{availablePercent}%</span>
                  </div>
                  <div className="rescue-capacity-details">
                    <h3 className="rescue-capacity-count">{capacity.availablePersonnel} / {capacity.totalPersonnel} Members</h3>
                    <p className="rescue-capacity-sub">All squad personnel present & ready</p>
                    <span className="rescue-capacity-tag">Next unit: Immediate</span>
                  </div>
                </div>
              </div>

              {/* Standby Card 5: Completed Missions History Table (Span 2) */}
              <div className="rescue-card rescue-card-table">
                <div className="rescue-card-title">
                  <span>Completed Missions History</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>Autonomous Audit Record</span>
                </div>
                <table className="rescue-table">
                  <thead>
                    <tr>
                      <th>Mission ID</th>
                      <th>Category</th>
                      <th>Casualties</th>
                      <th>Duration</th>
                      <th>Personnel</th>
                      <th>Result</th>
                      <th>Notes / Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '28px', color: '#94A3B8' }}>
                          No completed missions yet in this shift. Autonomous log will populate upon mission completion.
                        </td>
                      </tr>
                    ) : (
                      completedHistory.map((item) => (
                        <tr key={item.missionId}>
                          <td style={{ fontWeight: 800 }}>{item.missionId}</td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: item.result === 'Declined' ? '#DC2626' : '#2563EB' }}>
                              {item.result === 'Declined' ? <FiAlertTriangle /> : <FaAmbulance />} {item.category}
                            </span>
                          </td>
                          <td>{item.casualties}</td>
                          <td>{item.duration}</td>
                          <td>{item.personnel}</td>
                          <td>
                            <span className={`rescue-table-pill ${item.result === 'Declined' ? 'declined' : 'success'}`}>
                              {item.result}
                            </span>
                          </td>
                          <td style={{ color: item.result === 'Declined' ? '#DC2626' : '#64748B' }}>{item.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Standby Card 6: SOP Directives */}
              <div className="rescue-card">
                <div className="rescue-card-title">
                  <span>Agreement of Document</span>
                  <FiFileText style={{ color: '#94A3B8' }} />
                </div>
                <div className="rescue-doc-list">
                  <div className="rescue-doc-item">
                    <div className="rescue-doc-left">
                      <FiFileText className="rescue-doc-icon" />
                      <div>
                        <h4 className="rescue-doc-name">Standard_Operating_Procedure_Evacuation.pdf</h4>
                        <p className="rescue-doc-size">1.8 mb</p>
                      </div>
                    </div>
                    <button className="rescue-doc-dl-btn" aria-label="Download Document">
                      <FiDownload />
                    </button>
                  </div>
                  <div className="rescue-doc-item">
                    <div className="rescue-doc-left">
                      <FiFileText className="rescue-doc-icon" />
                      <div>
                        <h4 className="rescue-doc-name">Medical_Triage_and_Field_Protocol.pdf</h4>
                        <p className="rescue-doc-size">1.2 mb</p>
                      </div>
                    </div>
                    <button className="rescue-doc-dl-btn" aria-label="Download Document">
                      <FiDownload />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Decline Mission Modal with Mandatory Reason Chips */}
      {showDeclineModal && (
        <div className="rescue-modal-overlay">
          <div className="rescue-modal-card">
            <h3 className="rescue-modal-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#DC2626' }}>
                <FiAlertTriangle /> Decline Emergency Dispatch
              </span>
              <button
                onClick={() => setShowDeclineModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                aria-label="Close"
              >
                <FiX />
              </button>
            </h3>

            <p className="rescue-modal-desc">
              A specific reason is strictly required before declining. This alert will return to the triage queue for re-assignment.
            </p>

            <div>
              <p style={{ fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>Select Operational Reason:</p>
              <div className="rescue-chip-group">
                {[
                  'Route blocked / Bridge collapsed',
                  'Boat / heavy machinery required',
                  'Hazmat / chemical risk',
                  'Station personnel fully committed',
                  'Lacks specialized medical equipment',
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setDeclineReasonChip(chip)}
                    className={`rescue-reason-chip ${declineReasonChip === chip ? 'selected' : ''}`}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Detailed Justification:</label>
              <textarea
                rows={3}
                placeholder="Explain why team cannot accept..."
                value={declineReasonText}
                onChange={(e) => setDeclineReasonText(e.target.value)}
                className="rescue-modal-textarea"
              />
            </div>

            <div className="rescue-modal-actions">
              <button onClick={() => setShowDeclineModal(false)} className="rescue-modal-cancel">
                Cancel
              </button>
              <button
                onClick={handleDeclineMission}
                disabled={isLoadingAction || (!declineReasonChip && !declineReasonText.trim())}
                className="rescue-modal-confirm"
              >
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Operational Problem Modal */}
      {showProblemModal && (
        <div className="rescue-modal-overlay">
          <div className="rescue-modal-card">
            <h3 className="rescue-modal-title">
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#B45309' }}>
                <FiAlertTriangle /> Report Field Problem
              </span>
              <button
                onClick={() => setShowProblemModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                aria-label="Close"
              >
                <FiX />
              </button>
            </h3>

            <p className="rescue-modal-desc">
              Notify Station Leader of unexpected complications or hazards encountered on scene.
            </p>

            <div className="rescue-chip-group">
              {[
                'Impassable debris / road cut off',
                'Additional casualties discovered',
                'Secondary live wire hazard',
                'Equipment malfunction',
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setProblemReasonChip(chip)}
                  className={`rescue-reason-chip ${problemReasonChip === chip ? 'selected' : ''}`}
                  style={{
                    backgroundColor: problemReasonChip === chip ? '#FEF3C7' : '#F8FAFC',
                    color: problemReasonChip === chip ? '#B45309' : '#475569',
                    borderColor: problemReasonChip === chip ? '#FDE68A' : '#E2E8F0',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              placeholder="Describe on-site situation..."
              value={problemReasonText}
              onChange={(e) => setProblemReasonText(e.target.value)}
              className="rescue-modal-textarea"
            />

            <div className="rescue-modal-actions">
              <button onClick={() => setShowProblemModal(false)} className="rescue-modal-cancel">
                Cancel
              </button>
              <button
                onClick={handleReportProblem}
                disabled={isLoadingAction || (!problemReasonChip && !problemReasonText.trim())}
                className="rescue-modal-confirm"
                style={{ backgroundColor: '#D97706' }}
              >
                Submit Problem Report
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Collapsible Diagnostics Panel (Visible on toggle) */}
      {showDiagnostics && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '45vh',
            backgroundColor: '#0F172A',
            color: '#F8FAFC',
            borderTop: '2px solid #334155',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              padding: '10px 16px',
              backgroundColor: '#1E293B',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #334155',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiActivity style={{ color: '#38BDF8' }} />
              <span style={{ fontWeight: 700, fontSize: '13px' }}>
                Emergency Routing & Allocation Diagnostics (Live Trace)
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={fetchDiagnostics}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11px',
                }}
              >
                <FiRefreshCw /> Refresh Trace
              </button>
              <button
                onClick={() => setShowDiagnostics(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#F8FAFC',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
              >
                <FiX />
              </button>
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '12px 16px', flex: 1 }}>
            {diagnosticReports.length === 0 ? (
              <p style={{ margin: '16px 0', textAlign: 'center', color: '#94A3B8', fontSize: '12px' }}>
                No active or historical reports found in edge database.
              </p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ color: '#94A3B8', textAlign: 'left', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '6px' }}>Incident ID</th>
                    <th style={{ padding: '6px' }}>Category</th>
                    <th style={{ padding: '6px' }}>Region</th>
                    <th style={{ padding: '6px' }}>Station</th>
                    <th style={{ padding: '6px' }}>Assigned Team</th>
                    <th style={{ padding: '6px' }}>State</th>
                    <th style={{ padding: '6px' }}>Routing Rationale</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticReports.map((diag) => (
                    <tr key={diag.id} style={{ borderBottom: '1px solid #1E293B' }}>
                      <td style={{ padding: '6px', fontWeight: 700, color: '#38BDF8' }}>{diag.id}</td>
                      <td style={{ padding: '6px' }}>{diag.category}</td>
                      <td style={{ padding: '6px' }}>{diag.region || 'Auto-GPS'}</td>
                      <td style={{ padding: '6px' }}>{diag.stationId}</td>
                      <td style={{ padding: '6px', color: '#34D399' }}>{diag.assignedTeamId || 'Unassigned'}</td>
                      <td style={{ padding: '6px' }}>{diag.assignmentState || diag.status}</td>
                      <td style={{ padding: '6px', color: '#CBD5E1' }}>{diag.routingNotice || 'Standard optimal route'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

