import React, { useState } from 'react';
import { FiArrowUpRight, FiZap, FiChevronRight } from 'react-icons/fi';

export interface InsightItem {
  id: string;
  badge?: string;
  headline: string;
  subtext?: string;
  actionLabel?: string;
}

export interface ActivityListProps {
  title?: string;
  badge?: string;
  insights?: InsightItem[];
  onAction?: (item: InsightItem) => void;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  badge = 'RescueFit AI',
  insights = [
    {
      id: 'ins-1',
      badge: 'Priority Surge',
      headline: 'Water rise of +0.4m detected in Otteri basin. Swift Water Alpha recommended for 4 stranded civilians on terrace.',
      subtext: 'Matches required boat extraction & paramedic capabilities.',
      actionLabel: 'Review Recommendation',
    },
    {
      id: 'ins-2',
      badge: 'Mesh Health',
      headline: 'Station North VHF store-and-forward synchronizing with Station Central at 128 kbps packet rate.',
      subtext: '0 network dropouts detected over last 6 hours.',
      actionLabel: 'View Mesh Topology',
    },
    {
      id: 'ins-3',
      badge: 'Resource Alert',
      headline: 'Heavy Evacuation Charlie truck low on diesel generator reserve (28% remaining).',
      subtext: 'Relief fuel tanker scheduled from Egmore depot.',
      actionLabel: 'Reassign Incident',
    },
  ],
  onAction,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeInsight = insights[currentIndex] || insights[0];

  return (
    <div
      style={{
        backgroundColor: 'var(--color-dash-card, #121620)',
        border: '1px solid rgba(56,189,248,0.25)',
        borderRadius: '24px',
        padding: '24px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: '#FFFFFF',
        boxShadow: '0 8px 32px rgba(14,165,233,0.12)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: '220px',
        background: 'radial-gradient(circle at top right, rgba(37,99,235,0.35) 0%, rgba(18,22,32,0.98) 75%)',
      }}
    >
      {/* Top Row: Pill Tag + Dots */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(56,189,248,0.15)',
            border: '1px solid rgba(56,189,248,0.3)',
            color: '#38BDF8',
            fontSize: '11px',
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: '9999px',
          }}
        >
          <FiZap />
          <span>{badge}</span>
        </span>

        {/* Carousel Dots */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {insights.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Show insight ${idx + 1}`}
              style={{
                width: idx === currentIndex ? '16px' : '6px',
                height: '6px',
                borderRadius: '9999px',
                backgroundColor: idx === currentIndex ? '#38BDF8' : 'rgba(255,255,255,0.2)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.2s ease',
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Insight Headline */}
      <div style={{ margin: '18px 0', zIndex: 2 }}>
        {activeInsight.badge && (
          <span style={{ fontSize: '11px', color: '#60A5FA', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {activeInsight.badge}
          </span>
        )}
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 800,
            lineHeight: 1.45,
            margin: '6px 0 0 0',
            color: '#F8FAFC',
            letterSpacing: '-0.3px',
          }}
        >
          {activeInsight.headline}
        </h3>
        {activeInsight.subtext && (
          <p style={{ fontSize: '12px', color: 'var(--color-dash-text-muted, #8896AB)', margin: '6px 0 0 0' }}>
            {activeInsight.subtext}
          </p>
        )}
      </div>

      {/* Bottom Action Button (Template's bottom-right diagonal arrow) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
        <button
          onClick={() => onAction && onAction(activeInsight)}
          style={{
            background: 'none',
            border: 'none',
            color: '#38BDF8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>{activeInsight.actionLabel || 'View Analysis'}</span>
          <FiChevronRight />
        </button>

        <button
          onClick={() => onAction && onAction(activeInsight)}
          aria-label="Action on intelligence insight"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'background 0.15s ease',
          }}
        >
          <FiArrowUpRight />
        </button>
      </div>
    </div>
  );
};

