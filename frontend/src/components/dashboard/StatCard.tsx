import React from 'react';
import { FiArrowUpRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

export interface StatChip {
  label: string;
  count?: number | string;
  icon?: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  trendSubtext?: string;
  chips?: StatChip[];
  sparklineData?: number[];
  sparklineLabel?: string;
  onExpand?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trend = '+12%',
  trendDirection = 'up',
  trendSubtext = 'From last hour',
  chips = [
    { label: 'Active tasks', count: 44 },
    { label: 'Field units', count: 12 },
  ],
  sparklineData = [15, 18, 16, 22, 19, 28, 25, 34, 38],
  sparklineLabel = '+320',
  onExpand,
}) => {
  // Generate SVG path points
  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * 260;
      const y = 60 - ((val - 10) / 35) * 50;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,60 ${points} 260,60`;

  return (
    <div
      style={{
        backgroundColor: 'var(--color-dash-card, #121620)',
        border: '1px solid var(--color-dash-border, #1F2737)',
        borderRadius: '24px',
        padding: '22px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFFFFF',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#E2E8F0' }}>{title}</span>
        {onExpand && (
          <button
            onClick={onExpand}
            aria-label={`Expand details for ${title}`}
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
              fontSize: '14px',
            }}
          >
            <FiArrowUpRight />
          </button>
        )}
      </div>

      {/* Main KPI Stat & Trend */}
      <div style={{ margin: '14px 0 10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <span style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-1px', color: '#FFFFFF' }}>
            {value}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '9999px',
              backgroundColor: trendDirection === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: trendDirection === 'up' ? '#10B981' : '#EF4444',
              border: trendDirection === 'up' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            {trendDirection === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
            {trend}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--color-dash-text-dim, #54627A)', fontWeight: 600 }}>
            {trendSubtext}
          </span>
        </div>

        {/* Sub Chips */}
        {chips && chips.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            {chips.map((chip, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--color-dash-text-muted, #8896AB)',
                  backgroundColor: 'var(--color-dash-surface, #19202E)',
                  border: '1px solid var(--color-dash-border, #1F2737)',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {chip.icon && <span>{chip.icon}</span>}
                <strong style={{ color: '#F1F5F9' }}>{chip.count}</strong> {chip.label}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Sparkline Visual (Template's glowing blue waveform) */}
      <div style={{ position: 'relative', marginTop: '10px', height: '65px' }}>
        <svg viewBox="0 0 260 65" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
          <defs>
            <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon points={areaPoints} fill="url(#blueGlow)" />
          <polyline
            fill="none"
            stroke="#38BDF8"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
          {/* Point indicator */}
          <circle cx="215" cy="24" r="4" fill="#38BDF8" stroke="#121620" strokeWidth="2" />
        </svg>

        {sparklineLabel && (
          <div
            style={{
              position: 'absolute',
              top: '6px',
              right: '28px',
              backgroundColor: '#1E293B',
              border: '1px solid #38BDF8',
              borderRadius: '6px',
              padding: '2px 6px',
              fontSize: '10px',
              fontWeight: 800,
              color: '#38BDF8',
            }}
          >
            {sparklineLabel}
          </div>
        )}
      </div>
    </div>
  );
};

