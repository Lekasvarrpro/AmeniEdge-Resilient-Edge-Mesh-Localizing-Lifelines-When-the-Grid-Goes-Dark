import React from 'react';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { db, type LocalReport } from '../../lib/db/index';
import { useLiveQuery } from 'dexie-react-hooks';
import { FiClipboard, FiMapPin } from 'react-icons/fi';

export interface MyReportsViewProps {
  onSelectReport: (report: LocalReport) => void;
  onNewSOS: () => void;
}

export const MyReportsView: React.FC<MyReportsViewProps> = ({ onSelectReport, onNewSOS }) => {
  const reports = useLiveQuery(() => db.reports.orderBy('created_at').reverse().toArray());

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: '16px',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>My Emergency Reports</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Stored locally on this device & synced with station
          </p>
        </div>
        <button
          onClick={onNewSOS}
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--color-danger)',
            color: '#ffffff',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            fontWeight: 700,
            fontSize: 'var(--font-size-xs)',
            cursor: 'pointer',
          }}
        >
          + New SOS
        </button>
      </div>

      {!reports || reports.length === 0 ? (
        <Card variant="subtle" style={{ textAlign: 'center', padding: '32px 16px' }}>
          <FiClipboard style={{ fontSize: '32px', color: 'var(--color-text-secondary)', margin: '0 auto' }} aria-hidden="true" />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '8px' }}>
            No Active Emergency Reports
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            When you submit an emergency report, its real-time delivery status will appear here.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {reports.map((rep) => (
            <Card
              key={rep.client_reference_id}
              interactive
              onClick={() => onSelectReport(rep)}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>
                  {rep.category} ({rep.affected_people} affected)
                </span>
                <PriorityBadge priority={rep.priority} />
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiMapPin aria-hidden="true" /> {rep.location_landmark || 'Coordinates available'}
              </div>

              {rep.routing_notice && (
                <div style={{ fontSize: '11px', color: 'var(--color-primary)', fontWeight: 600 }}>
                  {rep.routing_notice}
                </div>
              )}

              <ProgressTracker
                currentStage={rep.stage}
                reportId={rep.id}
                createdAt={rep.created_at}
                syncedAt={rep.synced_at}
                serverStatus={rep.server_status}
                assignedTeamName={rep.assigned_team_name}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

