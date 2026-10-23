import React from 'react';
import type { ReportStage } from '../../lib/db/index';

export interface ProgressTrackerProps {
  currentStage: ReportStage;
  reportId?: string;
  createdAt?: number;
  syncedAt?: number;
  serverStatus?: string;
  assignedTeamName?: string;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  currentStage,
  reportId,
  createdAt,
  syncedAt,
  serverStatus,
  assignedTeamName,
}) => {
  const stages: { key: ReportStage; title: string; subtitle: string; index: number }[] = [
    {
      key: 'SAVED_LOCAL',
      title: '1. Saved on Device',
      subtitle: createdAt ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Persisted locally in outbox',
      index: 1,
    },
    {
      key: 'RECEIVED_STATION',
      title: '2. Received by Station',
      subtitle: syncedAt ? `Delivered at ${new Date(syncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : (currentStage === 'SAVED_LOCAL' ? 'Queued · Waiting for station link' : 'Station intake verified'),
      index: 2,
    },
    {
      key: 'ACKNOWLEDGED_RESPONDER',
      title: '3. Acknowledged by Responder',
      subtitle: assignedTeamName ? `${assignedTeamName} (${serverStatus || 'Assigned'})` : (currentStage === 'SAVED_LOCAL' || currentStage === 'RECEIVED_STATION' ? 'Pending station leader dispatch' : 'Team dispatched'),
      index: 3,
    },
  ];

  const getStageIndex = (stage: ReportStage) => {
    if (stage === 'SAVED_LOCAL') return 1;
    if (stage === 'RECEIVED_STATION') return 2;
    if (stage === 'ACKNOWLEDGED_RESPONDER') return 3;
    return 1;
  };

  const currentIdx = getStageIndex(currentStage);

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
          Delivery Verification
        </span>
        {reportId && (
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-info)' }}>
            #{reportId.slice(0, 10)}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}>
        {stages.map((st) => {
          const isDone = currentIdx >= st.index;
          const isCurrent = currentIdx === st.index;

          let iconBg = 'var(--color-surface-subtle)';
          let iconColor = 'var(--color-text-muted)';
          let iconContent = '○';

          if (isDone) {
            iconBg = 'var(--color-success)';
            iconColor = '#ffffff';
            iconContent = '✓';
          } else if (isCurrent) {
            iconBg = 'var(--color-warning)';
            iconColor = '#ffffff';
            iconContent = '●';
          }

          return (
            <div
              key={st.key}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
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
                  fontSize: '14px',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '2px',
                }}
              >
                {iconContent}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isCurrent || isDone ? 700 : 500,
                    color: isDone ? 'var(--color-text-primary)' : (isCurrent ? 'var(--color-warning)' : 'var(--color-text-muted)'),
                  }}
                >
                  {st.title}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  {st.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
