import React, { useState, useEffect } from 'react';
import { FiWifi, FiWifiOff, FiRefreshCw, FiInfo, FiX } from 'react-icons/fi';
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
          bg: '#FFFFFF',
          badgeBg: '#ECFDF5',
          badgeColor: '#047857',
          badgeBorder: '#A7F3D0',
          icon: <FiWifi />,
          label: 'Station Mesh Connected',
          hint: 'Autonomous edge island active (STA-CHN-N-001)',
        };
      case 'SYNCING':
        return {
          bg: '#FFFFFF',
          badgeBg: '#FFFBEB',
          badgeColor: '#B45309',
          badgeBorder: '#FDE68A',
          icon: <FiRefreshCw style={{ animation: 'spin 1.2s linear infinite' }} />,
          label: `Syncing Outbox (${pendingCount} pending)`,
          hint: 'Replaying local transactions to station node',
        };
      case 'SYNC_ERROR':
        return {
          bg: '#FFFFFF',
          badgeBg: '#FEF2F2',
          badgeColor: '#B91C1C',
          badgeBorder: '#FECACA',
          icon: <FiWifiOff />,
          label: `Sync Paused (${pendingCount} pending) · Tap to retry`,
          hint: 'Station Wi-Fi temporarily out of range',
        };
      case 'OFFLINE_SAVED':
      default:
        return {
          bg: '#FFFFFF',
          badgeBg: '#F1F5F9',
          badgeColor: '#475569',
          badgeBorder: '#CBD5E1',
          icon: <FiWifiOff />,
          label: pendingCount > 0 ? `Offline (${pendingCount} saved on device)` : 'Offline · Stored Locally',
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
          minHeight: '38px',
          padding: '6px 16px',
          backgroundColor: config.bg,
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 600,
          cursor: 'pointer',
          userSelect: 'none',
          boxSizing: 'border-box',
          zIndex: 1000,
          transition: 'background var(--transition-fast)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: config.badgeBg,
              color: config.badgeColor,
              border: `1px solid ${config.badgeBorder}`,
              fontSize: '11px',
              fontWeight: 700,
            }}
          >
            {config.icon}
            <span>{config.label}</span>
          </span>
          <span
            className="mobile-hide"
            style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}
          >
            {config.hint}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
          <span>Mesh Status</span>
          <FiInfo aria-hidden="true" />
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
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
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
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-2xl)',
              padding: '28px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              color: 'var(--color-text-primary)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800 }}>Mesh Network Diagnostic</h3>
              <button
                onClick={() => setShowDetails(false)}
                aria-label="Close diagnostic dialog"
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--color-text-secondary)',
                  display: 'flex',
                }}
              >
                <FiX />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: 'var(--font-size-sm)' }}>
              <div><strong>Connection:</strong> {config.label}</div>
              <div><strong>Local Outbox Queue:</strong> {pendingCount} events buffered in IndexedDB</div>
              <div><strong>Assigned Node:</strong> Station North Command (`STA-CHN-N-001`)</div>
              <div><strong>Captive Portal DNS:</strong> `192.168.4.1` (Offline Wildcard)</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>
                All mutations and SOS alerts are written locally first with cryptographic UUIDs. When any mesh path or courier mule connects, events synchronize automatically.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => {
                  outboxSync.flushOutbox();
                  setShowDetails(false);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--color-primary-gradient)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Trigger Outbox Flush
              </button>
              <button
                onClick={() => setShowDetails(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-surface-circle)',
                  color: '#ffffff',
                  border: '1px solid var(--color-border)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .mobile-hide { display: none !important; }
        }
      `}</style>
    </>
  );
};
