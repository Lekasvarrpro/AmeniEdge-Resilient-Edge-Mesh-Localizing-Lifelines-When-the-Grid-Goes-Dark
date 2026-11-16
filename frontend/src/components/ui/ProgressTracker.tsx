import React, { useState, useEffect } from 'react';
import {
  FiCheck,
  FiClock,
  FiTruck,
  FiMapPin,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from 'react-icons/fi';
import { api } from '../../lib/api/client';
import type { ReportStage } from '../../lib/db/index';

export interface TrackerPayload {
  incidentId?: string;
  clientReferenceId?: string;
  category?: string;
  affectedPeople?: number;
  deliveryState?: 'SAVED_ON_DEVICE' | 'RECEIVED_BY_STATION';
  assignmentState?: 'NONE' | 'OFFERED' | 'ACCEPTED' | 'DECLINED';
  missionState?: 'WAITING' | 'EN_ROUTE' | 'ON_SITE' | 'WORKING' | 'RESOLVED';
  syncState?: 'PENDING_SYNC' | 'SYNCED';
  savedAt?: string | number | null;
  receivedAt?: string | number | null;
  offeredAt?: string | number | null;
  acceptedAt?: string | number | null;
  dispatchedAt?: string | number | null;
  arrivedAt?: string | number | null;
  resolvedAt?: string | number | null;
  stationId?: string | null;
  stationName?: string | null;
  departmentName?: string | null;
  teamId?: string | null;
  teamName?: string | null;
  declineReason?: string | null;
  reassigning?: boolean;
  distanceKm?: number | null;
  etaSeconds?: number | null;
  truckProgress?: number | null;
  truckLatitude?: number | null;
  truckLongitude?: number | null;
  workTimeRemainingSeconds?: number | null;
}

export interface ProgressTrackerProps {
  currentStage?: ReportStage;
  reportId?: string;
  createdAt?: number;
  syncedAt?: number;
  serverStatus?: string;
  assignedTeamName?: string;
  initialTracker?: TrackerPayload;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStage,
  reportId,
  createdAt,
  syncedAt,
  serverStatus,
  assignedTeamName,
  initialTracker,
}) => {
  const [tracker, setTracker] = useState<TrackerPayload | null>(initialTracker || null);
  const [waitingElapsedSeconds, setWaitingElapsedSeconds] = useState<number>(0);

  // Poll live tracker status from backend if reportId is present
  useEffect(() => {
    if (!reportId) return;

    let isMounted = true;
    const fetchTracker = async () => {
      try {
        const res = await api.get<TrackerPayload>(`/incidents/${reportId}/tracker`);
        if (isMounted && res) {
          setTracker(res);
        }
      } catch {
        // Fall back gracefully to local state if offline
      }
    };

    fetchTracker();
    const interval = setInterval(fetchTracker, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [reportId]);

  // Live timer for "Waiting for a rescue team"
  useEffect(() => {
    const offeredTime = tracker?.offeredAt || tracker?.receivedAt || syncedAt;
    if (!offeredTime || tracker?.assignmentState === 'ACCEPTED' || tracker?.acceptedAt) {
      return;
    }

    const startMs = typeof offeredTime === 'string' ? new Date(offeredTime).getTime() : offeredTime;
    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((Date.now() - startMs) / 1000));
      setWaitingElapsedSeconds(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [tracker?.offeredAt, tracker?.receivedAt, tracker?.assignmentState, tracker?.acceptedAt, syncedAt]);

  const formatTime = (ts: string | number | null | undefined): string | null => {
    if (!ts) return null;
    try {
      const d = typeof ts === 'number' ? new Date(ts) : new Date(ts);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return null;
    }
  };

  const formatDuration = (totalSec: number): string => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Derive granular state
  const isReceived = Boolean(
    tracker?.receivedAt ||
    syncedAt ||
    tracker?.deliveryState === 'RECEIVED_BY_STATION' ||
    currentStage === 'RECEIVED_STATION' ||
    currentStage === 'ACKNOWLEDGED_RESPONDER'
  );

  const isAccepted = Boolean(
    tracker?.acceptedAt &&
    tracker?.assignmentState === 'ACCEPTED'
  );

  const isEnRoute = Boolean(
    isAccepted &&
    (tracker?.missionState === 'EN_ROUTE' || tracker?.missionState === 'ON_SITE' || tracker?.missionState === 'WORKING' || tracker?.missionState === 'RESOLVED')
  );

  const isOnSite = Boolean(
    tracker?.arrivedAt &&
    (tracker?.missionState === 'ON_SITE' || tracker?.missionState === 'WORKING' || tracker?.missionState === 'RESOLVED')
  );

  const isResolved = Boolean(
    tracker?.resolvedAt &&
    tracker?.missionState === 'RESOLVED'
  );

  const isDeclined = tracker?.assignmentState === 'DECLINED' || Boolean(tracker?.reassigning);

  const savedTimeStr = formatTime(tracker?.savedAt || createdAt) || 'Saved at submission';
  const receivedTimeStr = formatTime(tracker?.receivedAt || syncedAt);
  const acceptedTimeStr = formatTime(tracker?.acceptedAt);
  const dispatchedTimeStr = formatTime(tracker?.dispatchedAt || tracker?.acceptedAt);
  const arrivedTimeStr = formatTime(tracker?.arrivedAt);
  const resolvedTimeStr = formatTime(tracker?.resolvedAt);

  const stationDisplayName = tracker?.stationName || 'Regional Operations Base';
  const departmentDisplayName = tracker?.departmentName || assignedTeamName || 'Specialist Rescue Unit';
  const teamDisplayName = tracker?.teamName || tracker?.departmentName || assignedTeamName || 'Rescue Team';

  // 7-step data definition
  const steps = [
    {
      num: 1,
      title: '1. Saved on this device',
      isCompleted: true,
      isActive: false,
      timestamp: savedTimeStr,
      subtitle: 'Stored locally in secure encrypted outbox',
      icon: <FiCheck aria-hidden="true" />,
    },
    {
      num: 2,
      title: '2. Received by station',
      isCompleted: isReceived,
      isActive: !isReceived,
      timestamp: isReceived ? receivedTimeStr : null,
      subtitle: isReceived
        ? `Delivered to ${stationDisplayName}`
        : 'Waiting for station mesh link / Wi-Fi heartbeat',
      icon: isReceived ? <FiCheck aria-hidden="true" /> : <FiClock aria-hidden="true" />,
    },
    {
      num: 3,
      title: '3. Waiting for a rescue team',
      isCompleted: isAccepted,
      isActive: isReceived && !isAccepted,
      timestamp: isAccepted ? acceptedTimeStr : (isDeclined ? 'Reassigning' : `Waiting since ${formatDuration(waitingElapsedSeconds)}`),
      subtitle: isDeclined ? (
        <span style={{ color: 'var(--color-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FiAlertTriangle aria-hidden="true" />
          <span>Declined: {tracker?.declineReason || 'Unit occupied'}. Reassigning to next team...</span>
        </span>
      ) : isAccepted ? (
        `Offer accepted by ${teamDisplayName}`
      ) : (
        `Alert routed to ${departmentDisplayName} at ${stationDisplayName}`
      ),
      icon: isAccepted ? <FiCheck aria-hidden="true" /> : (isDeclined ? <FiRefreshCw aria-hidden="true" /> : <FiClock aria-hidden="true" />),
    },
    {
      num: 4,
      title: `4. Accepted by ${isAccepted ? teamDisplayName : departmentDisplayName}`,
      isCompleted: isAccepted,
      isActive: isAccepted && !isEnRoute,
      timestamp: acceptedTimeStr,
      subtitle: isAccepted
        ? `Crew assigned and mission accepted`
        : 'Waiting for rescue unit confirmation',
      icon: isAccepted ? <FiCheck aria-hidden="true" /> : <FiClock aria-hidden="true" />,
    },
    {
      num: 5,
      title: '5. Team on the way',
      isCompleted: isOnSite || isResolved,
      isActive: isEnRoute && !isOnSite,
      timestamp: isEnRoute ? (tracker?.etaSeconds != null && tracker.etaSeconds > 0 ? `ETA: ${formatDuration(tracker.etaSeconds)}` : dispatchedTimeStr) : null,
      subtitle: isEnRoute ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span>
            {tracker?.distanceKm != null ? `${tracker.distanceKm.toFixed(1)} km remaining` : 'Vehicle en route'}
            {tracker?.etaSeconds != null && tracker.etaSeconds > 0 ? ` · ${formatDuration(tracker.etaSeconds)} away` : ''}
          </span>
          {tracker?.truckProgress != null && (
            <div style={{ height: '6px', width: '100%', backgroundColor: 'var(--color-surface-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, tracker.truckProgress))}%`,
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
          )}
        </div>
      ) : (
        'Awaiting deployment dispatch'
      ),
      icon: (isOnSite || isResolved) ? <FiCheck aria-hidden="true" /> : <FiTruck aria-hidden="true" />,
    },
    {
      num: 6,
      title: '6. Team on site / Rescue in progress',
      isCompleted: isResolved,
      isActive: isOnSite && !isResolved,
      timestamp: isOnSite ? (tracker?.workTimeRemainingSeconds != null && tracker.workTimeRemainingSeconds > 0 ? `${tracker.workTimeRemainingSeconds}s remaining` : arrivedTimeStr) : null,
      subtitle: isOnSite ? (
        <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          Rescuers active on scene. Emergency extraction in progress.
          {tracker?.workTimeRemainingSeconds != null && tracker.workTimeRemainingSeconds > 0 ? ` Work timer: ${tracker.workTimeRemainingSeconds}s` : ''}
        </span>
      ) : (
        'Responders will verify upon arrival'
      ),
      icon: isResolved ? <FiCheck aria-hidden="true" /> : <FiActivity aria-hidden="true" />,
    },
    {
      num: 7,
      title: '7. Completed',
      isCompleted: isResolved,
      isActive: false,
      timestamp: resolvedTimeStr,
      subtitle: isResolved
        ? 'Rescue operation concluded successfully'
        : 'Pending on-site resolution',
      icon: isResolved ? <FiCheckCircle aria-hidden="true" /> : <FiCheck aria-hidden="true" />,
    },
  ];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-secondary)', letterSpacing: '0.5px' }}>
          Rescue Mission Lifecycle
        </span>
        {reportId && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
            #{reportId.slice(0, 10)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative' }}>
        {steps.map((st) => {
          let iconBg = 'var(--color-surface-subtle)';
          let iconColor = 'var(--color-text-muted)';
          let borderColor = 'transparent';

          if (st.isCompleted) {
            iconBg = 'var(--color-success)';
            iconColor = '#ffffff';
          } else if (st.isActive) {
            iconBg = 'var(--color-primary)';
            iconColor = '#ffffff';
            borderColor = 'rgba(37, 99, 235, 0.2)';
          }

          return (
            <div
              key={st.num}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative',
                opacity: st.isCompleted || st.isActive ? 1 : 0.65,
              }}
            >
              {/* Step Icon Badge */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: iconBg,
                  color: iconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  flexShrink: 0,
                  boxShadow: st.isActive ? '0 0 0 3px rgba(37, 99, 235, 0.25)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                {st.icon}
              </div>

              {/* Text & Timestamps */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: st.isCompleted || st.isActive ? 700 : 500,
                      color: st.isCompleted ? 'var(--color-text-primary)' : (st.isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)'),
                    }}
                  >
                    {st.title}
                  </span>
                  {st.timestamp && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: st.isCompleted ? 'var(--color-text-secondary)' : 'var(--color-primary)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {st.timestamp}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  {st.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
