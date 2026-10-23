import React, { useState, useEffect } from 'react';
import { outboxSync, type ConnectivityState } from '../../lib/offline/outbox';

export const ConnectivityBar: React.FC = () => {
  const [state, setState] = useState<ConnectivityState>('STATION_CONNECTED');
  const [pendingCount, setPendingCount] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    return outboxSync.subscribe((newState, count) => {
      setState(newState);
      setPendingCount(count);
    });
  }, []);

  const getStatusConfig = () => {
    switch (state) {
      case 'ONLINE':
      case 'STATION_CONNECTED':
        return {
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success)',
          border: 'var(--color-success-border)',
          icon: '●',
          label: 'Station Connected (Local Mesh)',
          hint: 'Operational offline island',
        };
      case 'SYNCING':
        return {
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning)',
          border: 'var(--color-warning-border)',
          icon: '◌',
          label: `Syncing (${pendingCount} pending)`,
          hint: 'Replaying local outbox to station',
        };
      case 'SYNC_ERROR':
        return {
          bg: 'var(--color-danger-bg)',
          text: 'var(--color-danger)',
          border: 'var(--color-danger-border)',
          icon: '▲',
          label: `Sync Error (${pendingCount} pending) · Tap to retry`,
          hint: 'Station temporarily unreachable',
        };
      case 'OFFLINE_SAVED':
      default:
        return {
          bg: 'var(--color-surface-subtle)',
          text: 'var(--color-text-secondary)',
          border: 'var(--color-border)',
          icon: '■',
          label: pendingCount > 0 ? `Offline (${pendingCount} saved on device)` : 'Offline · Stored locally',
          hint: 'Will auto-deliver when station Wi-Fi connects',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        onClick={() => setShowDetails(true)}
        style={{
          width: '100%',
          minHeight: '36px',
          padding: '6px 16px',
          backgroundColor: config.bg,
          color: config.text,
          borderBottom: `1px solid ${config.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          zIndex: 1000,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px' }}>{config.icon}</span>
          <span>{config.label}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ opacity: 0.8 }}>Details ▾</span>
        </div>
      </div>

      {showDetails && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={() => setShowDetails(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Connection Status</h3>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: 'var(--font-size-sm)' }}>
              <div><strong>Status:</strong> {config.label}</div>
              <div><strong>Pending Outbox Mutations:</strong> {pendingCount}</div>
              <div><strong>Mesh Station:</strong> Station North Command (STA-CHN-N-001)</div>
              <div><strong>Network Mode:</strong> Autonomous Edge Island</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                {config.hint}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => {
                  outboxSync.flushOutbox();
                  setShowDetails(false);
                }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-info)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Force Sync Outbox
              </button>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
