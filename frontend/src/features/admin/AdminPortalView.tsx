import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/ui/DataTable';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { api } from '../../lib/api/client';

export const AdminPortalView: React.FC = () => {
  const [tab, setTab] = useState<'USERS' | 'STATIONS' | 'TEAMS' | 'AUDIT'>('AUDIT');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchAdminData();
  }, [tab]);

  const fetchAdminData = async () => {
    try {
      if (tab === 'AUDIT') {
        const logs = await api.get<any[]>('/audit/logs');
        setAuditLogs(logs || []);
      } else if (tab === 'STATIONS') {
        const st = await api.get<any[]>('/stations');
        setStations(st || []);
      } else if (tab === 'TEAMS') {
        const tm = await api.get<any[]>('/teams');
        setTeams(tm || []);
      }
    } catch {}
  };

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
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Organization Administration</h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            System configuration, cryptographic audit vaults, and multi-station governance
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
        {(['AUDIT', 'STATIONS', 'TEAMS'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 700,
              fontSize: 'var(--font-size-sm)',
              backgroundColor: tab === t ? 'var(--color-info)' : 'var(--color-surface-subtle)',
              color: tab === t ? '#ffffff' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            {t === 'AUDIT' ? '📜 Immutable Audit Logs' : t === 'STATIONS' ? '📡 Stations' : '🚑 Teams'}
          </button>
        ))}
      </div>

      {/* Audit Log View */}
      {tab === 'AUDIT' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Append-only cryptographic timeline of all dispatch operations, overrides, and security transitions.
          </div>

          <DataTable
            data={auditLogs}
            keyExtractor={(log) => log.id}
            columns={[
              { key: 'timestamp', header: 'Timestamp', render: (l) => new Date(l.timestamp).toLocaleTimeString() },
              { key: 'actorRole', header: 'Role', render: (l) => <strong>{l.actorRole}</strong> },
              { key: 'action', header: 'Action', render: (l) => <StatusBadge status={l.action} /> },
              { key: 'entityId', header: 'Target Entity', render: (l) => `${l.entityType}: ${l.entityId}` },
              { key: 'details', header: 'Event Details', render: (l) => l.details },
            ]}
          />
        </div>
      )}

      {/* Stations View */}
      {tab === 'STATIONS' && (
        <DataTable
          data={stations}
          keyExtractor={(s) => s.id}
          columns={[
            { key: 'id', header: 'Station ID' },
            { key: 'name', header: 'Station Name' },
            { key: 'status', header: 'Mesh Status', render: (s) => <StatusBadge status={s.status} /> },
            { key: 'coverageRadiusMeters', header: 'Radius', render: (s) => `${s.coverageRadiusMeters}m` },
          ]}
        />
      )}

      {/* Teams View */}
      {tab === 'TEAMS' && (
        <DataTable
          data={teams}
          keyExtractor={(tm) => tm.id}
          columns={[
            { key: 'name', header: 'Team Name' },
            { key: 'stationId', header: 'Station' },
            { key: 'status', header: 'Readiness', render: (tm) => <StatusBadge status={tm.status} /> },
            { key: 'capabilities', header: 'Capabilities' },
          ]}
        />
      )}
    </div>
  );
};
