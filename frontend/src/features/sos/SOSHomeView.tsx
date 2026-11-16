import React, { useState } from 'react';
import { SOSButton } from '../../components/ui/SOSButton';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { outboxSync } from '../../lib/offline/outbox';
import { db, type LocalReport } from '../../lib/db/index';
import { useLiveQuery } from 'dexie-react-hooks';
import { FaWater, FaAmbulance, FaFire, FaHouseDamage, FaSearch } from 'react-icons/fa';
import { FiAlertTriangle, FiMap } from 'react-icons/fi';

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
  const [selectedRegion, setSelectedRegion] = useState<string>('North');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live query for most recent citizen report from Dexie
  const recentReports = useLiveQuery(() => db.reports.orderBy('created_at').reverse().toArray());
  const latestReport = recentReports && recentReports.length > 0 ? recentReports[0] : null;

  const categories = [
    { id: 'FLOOD', label: 'Flood / Water', icon: <FaWater /> },
    { id: 'MEDICAL', label: 'Medical Alert', icon: <FaAmbulance /> },
    { id: 'FIRE', label: 'Fire Outbreak', icon: <FaFire /> },
    { id: 'TRAPPED', label: 'People Trapped', icon: <FaHouseDamage /> },
    { id: 'MISSING', label: 'Missing Person', icon: <FaSearch /> },
    { id: 'OTHER', label: 'Other Threat', icon: <FiAlertTriangle /> },
  ];

  // Quick 1-tap SOS submission with current GPS or region
  const handleQuickSOS = async () => {
    setIsSubmitting(true);
    let lat = 13.0827;
    let lng = 80.2707;
    let stationId: string | undefined = undefined;
    let region: string | undefined = undefined;

    if (selectedRegion === 'North') {
      lat = 13.0827;
      lng = 80.2707;
      stationId = 'STA-CHN-N-001';
      region = 'North';
    } else if (selectedRegion === 'South') {
      lat = 12.9249;
      lng = 80.1000;
      stationId = 'STA-CHN-S-002';
      region = 'South';
    } else if (selectedRegion === 'East') {
      lat = 13.1143;
      lng = 80.2974;
      stationId = 'STA-CHN-E-003';
      region = 'East';
    } else if (selectedRegion === 'West') {
      lat = 13.1147;
      lng = 80.1548;
      stationId = 'STA-CHN-W-004';
      region = 'West';
    } else if (selectedRegion === 'GPS' && 'geolocation' in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // Fallback to default
      }
    }

    try {
      const createdReport = await outboxSync.enqueueIncident({
        category: selectedCategory,
        affectedPeople: 1,
        latitude: lat,
        longitude: lng,
        hasImmediateDanger: true,
        locationLandmark: region ? `${region} District Emergency Sector` : 'GPS Coordinates Area',
        stationId,
        region,
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

      {/* Quick Region Selector Chips */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
          Select Region:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {[
            { id: 'North', label: 'North' },
            { id: 'South', label: 'South' },
            { id: 'East', label: 'East' },
            { id: 'West', label: 'West' },
            { id: 'GPS', label: 'GPS' },
          ].map((r) => {
            const isSelected = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRegion(r.id)}
                style={{
                  minHeight: '38px',
                  padding: '6px 4px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--color-primary-bg, #EFF6FF)' : 'var(--color-surface)',
                  color: isSelected ? 'var(--color-primary, #2563EB)' : 'var(--color-text-primary)',
                  border: isSelected ? '2px solid var(--color-primary, #2563EB)' : '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {r.label}
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
          <FiMap style={{ marginRight: '6px' }} /> Offline Map
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

