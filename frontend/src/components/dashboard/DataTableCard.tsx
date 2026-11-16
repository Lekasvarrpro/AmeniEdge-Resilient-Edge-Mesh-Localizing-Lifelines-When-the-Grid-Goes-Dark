import React from 'react';
import { FiArrowUpRight, FiFilter, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import { MdEmergency, MdConstruction } from 'react-icons/md';
import { FaAmbulance, FaShip, FaFire } from 'react-icons/fa';

export interface DataRow {
  id: string;
  title: string;
  refCode: string;
  timestamp: string;
  priority?: string;
  status: string;
  category?: string;
  icon?: React.ReactNode;
}

export interface DataTableCardProps {
  title?: string;
  rows: DataRow[];
  selectedRowId?: string | null;
  onSelectRow?: (row: DataRow) => void;
  onFilterClick?: () => void;
  onExpand?: () => void;
}

export const DataTableCard: React.FC<DataTableCardProps> = ({
  title = 'Incident Triage Queue',
  rows = [],
  selectedRowId,
  onSelectRow,
  onFilterClick,
  onExpand,
}) => {
  const getCategoryIcon = (category?: string): React.ReactNode => {
    switch (category?.toUpperCase()) {
      case 'FLOOD':
        return <FaShip style={{ color: '#38BDF8' }} aria-label="Flood" />;
      case 'MEDICAL':
        return <FaAmbulance style={{ color: '#EF4444' }} aria-label="Medical" />;
      case 'FIRE':
        return <FaFire style={{ color: '#F97316' }} aria-label="Fire" />;
      case 'COLLAPSE':
      case 'STRUCTURAL':
        return <MdConstruction style={{ color: '#EAB308' }} aria-label="Structural" />;
      default:
        return <MdEmergency style={{ color: '#F59E0B' }} aria-label="Emergency" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const isCritical = priority?.includes('CRITICAL') || priority === 'HIGH';
    return (
      <span
        style={{
          fontSize: '11px',
          fontWeight: 800,
          padding: '3px 8px',
          borderRadius: '9999px',
          backgroundColor: isCritical ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
          color: isCritical ? '#EF4444' : '#F59E0B',
          border: isCritical ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        {priority || 'NORMAL'}
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--color-dash-card, #121620)',
        border: '1px solid var(--color-dash-border, #1F2737)',
        borderRadius: '24px',
        padding: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#F1F5F9' }}>
          {title}
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {onFilterClick && (
            <button
              onClick={onFilterClick}
              aria-label="Filter incidents"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-dash-surface, #19202E)',
                border: '1px solid var(--color-dash-border, #1F2737)',
                color: 'var(--color-dash-text-muted, #8896AB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <FiFilter />
            </button>
          )}

          {onExpand && (
            <button
              onClick={onExpand}
              aria-label="Expand incident queue"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-dash-surface, #19202E)',
                border: '1px solid var(--color-dash-border, #1F2737)',
                color: 'var(--color-dash-text-muted, #8896AB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              <FiArrowUpRight />
            </button>
          )}
        </div>
      </div>

      {/* Rows List (Matching NeuroBank's transaction row aesthetic) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-dash-text-muted, #8896AB)', fontSize: '13px' }}>
            No active incidents in triage.
          </div>
        ) : (
          rows.map((row) => {
            const isSelected = selectedRowId === row.id;

            return (
              <div
                key={row.id}
                onClick={() => onSelectRow && onSelectRow(row)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: '16px',
                  backgroundColor: isSelected
                    ? 'rgba(37,99,235,0.15)'
                    : 'var(--color-dash-surface, #19202E)',
                  border: isSelected
                    ? '1px solid #38BDF8'
                    : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease, border-color 0.15s ease',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {/* Left: Icon & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px', flex: 2 }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      color: '#F8FAFC',
                    }}
                  >
                    {row.icon || getCategoryIcon(row.category)}
                  </div>

                  <div>
                    <span style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
                      {row.title}
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: 'var(--color-dash-text-dim, #54627A)', fontWeight: 600 }}>
                      ID: {row.id}
                    </span>
                  </div>
                </div>

                {/* Middle: Ref Code & Timestamp */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '140px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-dash-text-muted, #8896AB)' }}>
                    {row.refCode}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-dash-text-dim, #54627A)' }}>
                    {row.timestamp}
                  </span>
                </div>

                {/* Right: Priority / Status Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {row.priority && getPriorityBadge(row.priority)}
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: '#94A3B8',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

