import React, { useState } from 'react';
import { SOSButton } from '../../components/ui/SOSButton';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { outboxSync } from '../../lib/offline/outbox';
import { db, type LocalReport } from '../../lib/db/index';
import { useLiveQuery } from 'dexie-react-hooks';

export interface SOSHomeViewProps {
  onOpenWizard: (preselectedCategory?: string) => void;
  onViewReport: (report: LocalReport) => void;
  onOpenMap: () => void;
}

export const SOSHomeView: React.FC<SOSHomeViewProps> = ({
  onOpenWizard,
  onViewReport,
  onOpenMap,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('FLOOD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live query for most recent citizen report from Dexie
  const recentReports = useLiveQuery(() => db.reports.orderBy('created_at').reverse().toArray());
  const latestReport = recentReports && recentReports.length > 0 ? recentReports[0] : null;

  const categories = [
    { id: 'FLOOD', label: 'Flood / Water', icon: '🌊' },
    { id: 'MEDICAL', label: 'Medical Alert', icon: '🚑' },
    { id: 'FIRE', label: 'Fire Outbreak', icon: '🔥' },
    { id: 'TRAPPED', label: 'People Trapped', icon: '🏚️' },
    { id: 'MISSING', label: 'Missing Person', icon: '🔍' },
    { id: 'OTHER', label: 'Other Threat', icon: '⚠️' },
  ];

  // Quick 1-tap SOS submission with current GPS
  const handleQuickSOS = async () => {
    setIsSubmitting(true);
    let lat = 13.0827;
    let lng = 80.2707;

    if ('geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Fallback to default station coordinates
      }
    }

    try {
      const createdReport = await outboxSync.enqueueIncident({
        category: selectedCategory,
        affectedPeople: 1,
        latitude: lat,
        longitude: lng,
        hasImmediateDanger: true,
        details: 'Instant One-Tap SOS emergency alert',
      });
      onViewReport(createdReport);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        gap: '20px',
        maxWidth: '540px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
      }}
    >
      {/* Calm Status Header */}
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
          Emergency Lifeline
        </h1>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Tap below for emergency evacuation or rescue assistance
        </p>
      </div>

      {/* Centerpiece: Huge Circular SOS Button */}
      <div style={{ margin: '8px 0' }}>
        <SOSButton onTrigger={handleQuickSOS} disabled={isSubmitting} />
      </div>

      {/* Quick Category Chips */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Select Emergency Category:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  minHeight: '48px',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-danger)' : 'var(--color-text-primary)',
                  border: isSelected ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isSelected ? 700 : 500,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Row: Add Details & View Map */}
      <div style={{ width: '100%', display: 'flex', gap: '10px' }}>
        <Button
          variant="secondary"
          fullWidth
          size="md"
          onClick={() => onOpenWizard(selectedCategory)}
          style={{ flex: 1 }}
        >
          + Add Details / Victims
        </Button>
        <Button
          variant="outline"
          size="md"
          onClick={onOpenMap}
          style={{ flex: 1 }}
        >
          🗺️ Offline Map
        </Button>
      </div>

      {/* Recent Report Status Tracker */}
      {latestReport && (
        <div style={{ width: '100%' }}>
          <ProgressTracker
            currentStage={latestReport.stage}
            reportId={latestReport.id}
            createdAt={latestReport.created_at}
            syncedAt={latestReport.synced_at}
            serverStatus={latestReport.server_status}
            assignedTeamName={latestReport.assigned_team_name}
          />
        </div>
      )}
    </div>
  );
};
