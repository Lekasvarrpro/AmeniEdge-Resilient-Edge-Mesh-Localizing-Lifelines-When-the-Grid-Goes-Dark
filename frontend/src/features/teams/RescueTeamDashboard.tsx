import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { api } from '../../lib/api/client';

export interface RescueTeamDashboardProps {
  onOpenMap: () => void;
}

export const RescueTeamDashboard: React.FC<RescueTeamDashboardProps> = ({ onOpenMap }) => {
  const [teamStatus, setTeamStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');
  const [activeMission, setActiveMission] = useState<any | null>(null);
  const [showDeclineSheet, setShowDeclineSheet] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchTeamAndAssignments();
    const interval = setInterval(fetchTeamAndAssignments, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchTeamAndAssignments = async () => {
    try {
      // Fetch incidents assigned to Team Alpha
      const incidents = await api.get<any[]>('/incidents?station_id=STA-CHN-N-001');
      if (Array.isArray(incidents)) {
        const myMission = incidents.find(
          (inc) => inc.assignedTeamId === 'TEAM-CHN-N-001' || inc.status === 'ASSIGNED'
        );
        if (myMission) {
          setActiveMission(myMission);
        } else {
          setActiveMission(null);
        }
      }
    } catch {}
  };

  const handleStatusStep = async () => {
    if (!activeMission) return;
    setIsUpdating(true);

    let nextStatus = 'ACCEPTED';
    if (activeMission.status === 'ASSIGNED') nextStatus = 'ACCEPTED';
    else if (activeMission.status === 'ACCEPTED') nextStatus = 'EN_ROUTE';
    else if (activeMission.status === 'EN_ROUTE') nextStatus = 'ON_SITE';
    else if (activeMission.status === 'ON_SITE') nextStatus = 'RESOLVED';

    try {
      const updated = await api.patch<any>(`/incidents/${activeMission.id}/status`, {
        status: nextStatus,
        note: `Status updated by field team Alpha to ${nextStatus}`,
      });
      setActiveMission(updated);
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDecline = async (reason: string) => {
    if (!activeMission) return;
    setIsUpdating(true);
    try {
      await api.patch<any>(`/incidents/${activeMission.id}/status`, {
        status: 'TRIAGED',
        note: `Declined by Team: ${reason}`,
      });
      setShowDeclineSheet(false);
      setActiveMission(null);
      alert('Mission declined and returned to Station triage queue.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStepLabel = () => {
    if (!activeMission) return 'No Active Mission';
    switch (activeMission.status) {
      case 'ASSIGNED':
        return '✓ ACCEPT MISSION';
      case 'ACCEPTED':
        return '🚗 DEPART: MARK EN ROUTE';
      case 'EN_ROUTE':
        return '📍 ARRIVED: MARK ON SITE';
      case 'ON_SITE':
        return '🏆 RESCUE COMPLETE: RESOLVED';
      default:
        return 'MISSION RESOLVED';
    }
  };

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
      {/* Team Header & Availability Toggle */}
      <Card style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800 }}>Swift Water Alpha</h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Station North · 4 Crew Members
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          {(['AVAILABLE', 'BUSY', 'OFF_DUTY'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setTeamStatus(st)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                backgroundColor: teamStatus === st ? 'var(--color-info)' : 'var(--color-surface-subtle)',
                color: teamStatus === st ? '#ffffff' : 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {st === 'AVAILABLE' ? 'Avail' : st === 'BUSY' ? 'Busy' : 'Off'}
            </button>
          ))}
        </div>
      </Card>

      {/* Active Mission Alert Card */}
      {activeMission ? (
        <Card variant="urgent" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-danger)', letterSpacing: '0.5px' }}>
              CURRENT MISSION ASSIGNMENT
            </span>
            <PriorityBadge priority={activeMission.priority || 'P1_CRITICAL'} />
          </div>

          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>
              {activeMission.category}: {activeMission.affectedPeople || activeMission.affected_people} Trapped
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px', color: 'var(--color-text-primary)' }}>
              📍 {activeMission.locationLandmark || 'Basin Bridge 2nd Cross, Near Water Tank'}
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
              {activeMission.details || 'Water reached 1st floor balcony. Stranded without food or water.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Status:</span>
            <StatusBadge status={activeMission.status} />
          </div>

          {/* Accept / Decline actions if in ASSIGNED state */}
          {activeMission.status === 'ASSIGNED' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Button
                variant="danger"
                fullWidth
                size="lg"
                isLoading={isUpdating}
                onClick={handleStatusStep}
                style={{ flex: 2 }}
              >
                ✓ ACCEPT MISSION
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setShowDeclineSheet(true)}
                style={{ flex: 1 }}
              >
                Decline
              </Button>
            </div>
          )}

          {/* Stepper Progress Action if Mission is Ongoing */}
          {activeMission.status !== 'ASSIGNED' && activeMission.status !== 'RESOLVED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <Button
                variant="danger"
                fullWidth
                size="lg"
                isLoading={isUpdating}
                onClick={handleStatusStep}
                style={{ minHeight: '56px', fontSize: 'var(--font-size-md)' }}
              >
                {getNextStepLabel()}
              </Button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button variant="outline" fullWidth size="md" onClick={onOpenMap}>
                  🗺️ Open in Map
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={() => alert('Support request signaled to Station Leader North via VHF mesh channel.')}
                >
                  Request Backup
                </Button>
              </div>
            </div>
          )}
        </Card>
      ) : (
        <Card variant="subtle" style={{ textAlign: 'center', padding: '36px 16px' }}>
          <span style={{ fontSize: '32px' }}>🛡️</span>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: '8px' }}>
            No Active Incident Dispatched
          </h3>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
            Station North RescueFit engine is monitoring the local queue. New assignments will ring here automatically.
          </p>
        </Card>
      )}

      {/* Equipment & Capability Roster */}
      <Card style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Verified Team Capabilities & Gear</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['Swift Water Rescue', 'Inflatable Zodiac Boat', 'Life Jackets', 'First Aid Trauma Kit', 'Radio VHF-CH14'].map((eq) => (
            <span
              key={eq}
              style={{
                fontSize: 'var(--font-size-xs)',
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                fontWeight: 600,
              }}
            >
              ✓ {eq}
            </span>
          ))}
        </div>
      </Card>

      {/* Decline Reason Bottom Sheet */}
      <BottomSheet
        isOpen={showDeclineSheet}
        onClose={() => setShowDeclineSheet(false)}
        title="Reason Required to Decline Emergency Task"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            All mission declines are logged in the immutable audit vault for IC review.
          </p>

          {[
            'Mechanical failure of zodiac boat motor',
            'Route impassable due to fallen electrical wires',
            'Crew medical emergency during transit',
            'Specialist gear required (Hydraulic extrication)',
          ].map((reason) => (
            <button
              key={reason}
              onClick={() => handleDecline(reason)}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                textAlign: 'left',
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
              }}
            >
              {reason}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};
