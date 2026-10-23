import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { api } from '../../lib/api/client';

export const RegionalSupervisorDashboard: React.FC = () => {
  const [stations, setStations] = useState<any[]>([]);
  const [allIncidents, setAllIncidents] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);

  useEffect(() => {
    fetchSupervisorData();
    const interval = setInterval(fetchSupervisorData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSupervisorData = async () => {
    try {
      const stList = await api.get<any[]>('/stations');
      setStations(stList || []);

      const incList = await api.get<any[]>('/incidents');
      setAllIncidents(incList || []);

      // Filter for conflicts
      const conflictList = (incList || []).filter((inc) => inc.conflictDetected);
      setConflicts(conflictList);
    } catch {}
  };

  const handleResolveConflict = async (incidentId: string, finalTeamId: string) => {
    try {
      await api.patch(`/incidents/${incidentId}/status`, {
        status: 'ASSIGNED',
        note: `Regional Supervisor arbitrated conflict: Assigned permanently to ${finalTeamId}`,
      });
      alert(`Conflict resolved for incident ${incidentId}. Team ${finalTeamId} designated as primary responder.`);
      fetchSupervisorData();
    } catch (err: any) {
      alert(err.message || 'Error resolving conflict');
    }
  };

  const criticalCount = allIncidents.filter((i) => i.priority === 'P1_CRITICAL').length;
  const unassignedCount = allIncidents.filter((i) => i.status === 'RECEIVED' || i.status === 'TRIAGED').length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: '16px',
        gap: '20px',
      }}
    >
      {/* Top Regional KPI Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
            Regional District Command (Chennai Metropolitan)
          </h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Supervising 2 Edge Stations · Multi-Station Mesh Harmonizer
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSupervisorData}>
          🔄 Refresh
        </Button>
      </div>

      {/* KPI Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        {[
          { label: 'Total Incidents', value: allIncidents.length, color: 'var(--color-info)' },
          { label: 'Critical (P1)', value: criticalCount, color: 'var(--color-danger)' },
          { label: 'Unassigned', value: unassignedCount, color: 'var(--color-warning)' },
          { label: 'Mesh Conflicts', value: conflicts.length, color: conflicts.length > 0 ? 'var(--color-danger)' : 'var(--color-success)' },
        ].map((stat) => (
          <Card key={stat.label} style={{ padding: '14px', textAlign: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {stat.label}
            </span>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: stat.color, marginTop: '4px' }}>
              {stat.value}
            </div>
          </Card>
        ))}
      </div>

      {/* Inter-Station Sync Conflicts Arbitration Drawer */}
      {conflicts.length > 0 && (
        <Card variant="urgent" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>⚡</span>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-danger)' }}>
              Dual-Station Assignment Conflict Detected!
            </h3>
          </div>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-primary)' }}>
            Station North and Station South simultaneously dispatched different rescue assets to boundary incidents while disconnected. Immediate supervisor arbitration required.
          </p>

          {conflicts.map((conf) => (
            <div
              key={conf.id}
              style={{
                backgroundColor: 'var(--color-surface)',
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <strong>Incident #{conf.id}: {conf.category}</strong>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  Location: {conf.locationLandmark} · Victims: {conf.affectedPeople || conf.affected_people}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleResolveConflict(conf.id, 'TEAM-CHN-N-001')}
                >
                  Designate Team Alpha (North)
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleResolveConflict(conf.id, 'TEAM-CHN-S-001')}
                >
                  Designate Team Delta (South)
                </Button>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Station Health Overview Grid */}
      <div>
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '10px' }}>
          Edge Station Health & Mesh Connectivity
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {[
            {
              id: 'STA-CHN-N-001',
              name: 'Station North Command (Royapuram)',
              status: 'ONLINE',
              mode: 'Autonomous Wi-Fi Mesh',
              activeTeams: '3 Teams Roster',
              lastSync: 'Live (Direct Gateway)',
            },
            {
              id: 'STA-CHN-S-002',
              name: 'Station South Command (Mylapore)',
              status: 'DISCONNECTED',
              mode: 'Isolated Island Mode',
              activeTeams: '1 Team Roster',
              lastSync: '14 mins ago (Courier Mule Pending)',
            },
          ].map((st) => (
            <Card key={st.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>{st.name}</span>
                <StatusBadge status={st.status} />
              </div>

              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <div><strong>Station ID:</strong> {st.id}</div>
                <div><strong>Mesh Mode:</strong> {st.mode}</div>
                <div><strong>Roster:</strong> {st.activeTeams}</div>
                <div><strong>Last Reconciled:</strong> {st.lastSync}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
