import React from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import type { LocalReport } from '../../lib/db/index';
import { MdEmergency } from 'react-icons/md';
import { FiAlertTriangle, FiPhone } from 'react-icons/fi';

export interface SOSConfirmationViewProps {
  report: LocalReport;
  onDone: () => void;
  onOpenMap: () => void;
}

export const SOSConfirmationView: React.FC<SOSConfirmationViewProps> = ({
  report,
  onDone,
  onOpenMap,
}) => {
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
        gap: '20px',
      }}
    >
      <div style={{ textAlign: 'center', marginTop: '12px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-danger)',
            color: '#ffffff',
            fontSize: '32px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <MdEmergency aria-hidden="true" />
        </div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginTop: '12px' }}>
          Emergency SOS Logged
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
          Your report is secured. Do not panic. Responders operate on this mesh.
        </p>
      </div>

      {/* 3-Stage Delivery Progress Tracker */}
      <ProgressTracker
        currentStage={report.stage}
        reportId={report.id}
        createdAt={report.created_at}
        syncedAt={report.synced_at}
        serverStatus={report.server_status}
        assignedTeamName={report.assigned_team_name}
      />

      {/* Receiving Department & Station Routing Notice */}
      {(report.routing_notice || report.assigned_team_name) && (
        <Card variant="default" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary)' }}>
              DISPATCH DESTINATION
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
              {report.routing_notice || `Received by ${report.assigned_team_name}`}
            </span>
            {report.station_name && (
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                Coordinating Station: {report.station_name}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Critical Safety Tips */}
      <Card variant="subtle">
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiAlertTriangle style={{ color: 'var(--color-warning)' }} aria-hidden="true" />
          <span>Immediate Safety Protocol:</span>
        </h3>
        <ul style={{ paddingLeft: '20px', fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <li>Stay on highest accessible floor or roof if water is rising.</li>
          <li>Avoid contact with submerged electrical poles or downed wires.</li>
          <li>Switch phone to <strong>Battery Saver Mode</strong>.</li>
          <li>Signal rescuers using a whistle, bright cloth, or flashlight.</li>
        </ul>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <a
          href="tel:112"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '48px',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-danger-bg)',
            color: 'var(--color-danger)',
            border: '2px solid var(--color-danger)',
            textDecoration: 'none',
            fontWeight: 700,
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <FiPhone aria-hidden="true" /> Call 112 (Official Emergency Services)
        </a>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" fullWidth size="lg" onClick={onOpenMap}>
            View on Map
          </Button>
          <Button variant="primary" fullWidth size="lg" onClick={onDone}>
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
};

