import React from 'react';

export interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let bg = 'var(--color-surface-subtle)';
  let color = 'var(--color-text-secondary)';
  let border = 'var(--color-border)';
  let icon = '●';
  let label = status;

  switch (status.toUpperCase()) {
    case 'RECEIVED':
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      border = 'var(--color-info-border)';
      icon = '◎';
      label = 'Received';
      break;
    case 'TRIAGED':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      border = 'var(--color-warning-border)';
      icon = '⚙';
      label = 'Triaged';
      break;
    case 'ASSIGNED':
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      border = 'var(--color-info-border)';
      icon = '→';
      label = 'Assigned';
      break;
    case 'ACCEPTED':
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      border = 'var(--color-success-border)';
      icon = '✓';
      label = 'Accepted';
      break;
    case 'EN_ROUTE':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      border = 'var(--color-warning-border)';
      icon = '»';
      label = 'En Route';
      break;
    case 'ON_SITE':
      bg = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      border = 'var(--color-danger-border)';
      icon = '▲';
      label = 'On Site';
      break;
    case 'RESOLVED':
    case 'CLOSED':
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      border = 'var(--color-success-border)';
      icon = '✓';
      label = status === 'RESOLVED' ? 'Resolved' : 'Closed';
      break;
    case 'AVAILABLE':
      bg = 'var(--color-success-bg)';
      color = 'var(--color-success)';
      border = 'var(--color-success-border)';
      icon = '●';
      label = 'Available';
      break;
    case 'BUSY':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      border = 'var(--color-warning-border)';
      icon = '■';
      label = 'Busy';
      break;
    case 'OFF_DUTY':
      bg = 'var(--color-surface-muted)';
      color = 'var(--color-text-muted)';
      border = 'var(--color-border)';
      icon = '—';
      label = 'Off Duty';
      break;
    case 'QUEUED_OFFLINE':
      bg = 'var(--color-surface-subtle)';
      color = 'var(--color-text-muted)';
      border = 'var(--color-border)';
      icon = '⏳';
      label = 'Queued Offline';
      break;
    default:
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 700,
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  let bg = 'var(--color-surface-subtle)';
  let color = 'var(--color-text-secondary)';
  let border = 'var(--color-border)';
  let icon = '•';
  let label = priority;

  switch (priority.toUpperCase()) {
    case 'P1_CRITICAL':
    case 'CRITICAL':
      bg = 'var(--color-danger-bg)';
      color = 'var(--color-danger)';
      border = 'var(--color-danger-border)';
      icon = '▲';
      label = 'P1 Critical';
      break;
    case 'P2_URGENT':
    case 'URGENT':
      bg = 'var(--color-warning-bg)';
      color = 'var(--color-warning)';
      border = 'var(--color-warning-border)';
      icon = '◆';
      label = 'P2 Urgent';
      break;
    case 'P3_ROUTINE':
    case 'ROUTINE':
      bg = 'var(--color-info-bg)';
      color = 'var(--color-info)';
      border = 'var(--color-info-border)';
      icon = '■';
      label = 'P3 Routine';
      break;
    case 'P4_MONITORING':
    default:
      bg = 'var(--color-surface-muted)';
      color = 'var(--color-text-muted)';
      border = 'var(--color-border)';
      icon = '○';
      label = 'P4 Monitor';
      break;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 800,
        backgroundColor: bg,
        color,
        border: `1px solid ${border}`,
        lineHeight: 1.2,
      }}
    >
      <span aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </span>
  );
};
