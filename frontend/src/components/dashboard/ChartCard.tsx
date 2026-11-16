import React from 'react';
import { FiArrowUpRight, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { FaShip, FaAmbulance, FaTruck } from 'react-icons/fa';
import { MdConstruction } from 'react-icons/md';

export interface BarDatum {
  label: string;
  value: number;
  highlight?: boolean;
}

export interface ChartCardProps {
  title: string;
  value?: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down';
  trendSubtext?: string;
  type: 'gauge' | 'bars';
  gaugePercentage?: number;
  gaugeLabel?: string;
  gaugeLegends?: { label: string; color: string }[];
  barsData?: BarDatum[];
  onExpand?: () => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  value,
  trend,
  trendDirection = 'up',
  trendSubtext = 'From last month',
  type,
  gaugePercentage = 58,
  gaugeLabel = 'Capacity',
  gaugeLegends = [
    { label: 'Active Crew', color: '#2563EB' },
    { label: 'Standby', color: '#64748B' },
  ],
  barsData = [
    { label: 'Boats', value: 34, highlight: true },
    { label: 'Medics', value: 16 },
    { label: 'USAR', value: 8 },
    { label: 'Trucks', value: 6 },
  ],
  onExpand,
}) => {
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

      {/* KPI & Trend */}
      {value && (
        <div style={{ margin: '10px 0 6px 0', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>{value}</span>
          {trend && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: trendDirection === 'up' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: trendDirection === 'up' ? '#10B981' : '#EF4444',
                border: trendDirection === 'up' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              }}
            >
              {trendDirection === 'up' ? <FiTrendingUp /> : <FiTrendingDown />}
              {trend}
            </span>
          )}
          {trendSubtext && (
            <span style={{ fontSize: '11px', color: 'var(--color-dash-text-dim, #54627A)' }}>{trendSubtext}</span>
          )}
        </div>
      )}

      {/* Gauge Visualization (Matching "Earnings" card in NeuroBank) */}
      {type === 'gauge' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
          <div style={{ position: 'relative', width: '180px', height: '100px', display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 180 100" style={{ width: '100%', height: '100%' }}>
              {/* Background Arc */}
              <path
                d="M 20 90 A 70 70 0 0 1 160 90"
                fill="none"
                stroke="#1E293B"
                strokeWidth="16"
                strokeLinecap="round"
              />
              {/* Foreground Gradient Arc */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>
              <path
                d="M 20 90 A 70 70 0 0 1 160 90"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="16"
                strokeLinecap="round"
                strokeDasharray="220"
                strokeDashoffset={220 - (220 * gaugePercentage) / 100}
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>

            {/* Centered Percentage */}
            <div
              style={{
                position: 'absolute',
                bottom: '4px',
                textAlign: 'center',
              }}
            >
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-dash-text-muted, #8896AB)', fontWeight: 600 }}>
                {gaugeLabel}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }}>
                {gaugePercentage}%
              </span>
            </div>
          </div>

          {/* Legend Dots */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {gaugeLegends.map((leg, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: leg.color }} />
                <span>{leg.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bar Chart Visualization (Matching "Spending" card in NeuroBank) */}
      {type === 'bars' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '90px', padding: '0 8px' }}>
            {barsData.map((bar, idx) => {
              const maxVal = Math.max(...barsData.map((b) => b.value), 40);
              const heightPct = Math.max(15, (bar.value / maxVal) * 100);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: bar.highlight ? '#38BDF8' : '#94A3B8' }}>
                    {bar.value}
                  </span>

                  <div
                    style={{
                      width: '28px',
                      height: `${heightPct}%`,
                      maxHeight: '65px',
                      borderRadius: '8px',
                      background: bar.highlight
                        ? 'linear-gradient(180deg, #38BDF8 0%, #2563EB 100%)'
                        : '#1E293B',
                      boxShadow: bar.highlight ? '0 0 12px rgba(56,189,248,0.35)' : 'none',
                      transition: 'height 0.4s ease',
                    }}
                  />

                  <span style={{ fontSize: '10px', color: 'var(--color-dash-text-muted, #8896AB)', fontWeight: 600 }}>
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bottom Category Pill Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px',
              borderRadius: '9999px',
              backgroundColor: 'var(--color-dash-surface, #19202E)',
              border: '1px solid var(--color-dash-border, #1F2737)',
              fontSize: '11px',
              color: 'var(--color-dash-text-muted, #8896AB)',
            }}
          >
            <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
              <FaShip aria-label="Boat rescue" />
              <FaAmbulance aria-label="Ambulance" />
              <MdConstruction aria-label="Structural recovery" />
              <FaTruck aria-label="Fire response truck" />
            </span>
            <span style={{ fontWeight: 700, color: '#38BDF8' }}>+8 deployed</span>
          </div>
        </div>
      )}
    </div>
  );
};

