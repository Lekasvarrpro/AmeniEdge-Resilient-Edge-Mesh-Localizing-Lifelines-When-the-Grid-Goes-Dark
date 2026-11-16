import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight } from 'react-icons/fi';

export interface RoleCardProps {
  title: string;
  roleKey: string;
  description: string;
  icon: React.ReactNode;
  badgeText?: string;
  badgeVariant?: 'blue' | 'red' | 'green' | 'amber';
  onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title,
  roleKey,
  description,
  icon,
  badgeText,
  badgeVariant = 'blue',
  onClick,
}) => {
  let badgeBg = '#EFF6FF';
  let badgeColor = '#1D4ED8';
  let badgeBorder = '#BFDBFE';

  if (badgeVariant === 'red') {
    badgeBg = '#FEF2F2';
    badgeColor = '#B91C1C';
    badgeBorder = '#FECACA';
  } else if (badgeVariant === 'green') {
    badgeBg = '#ECFDF5';
    badgeColor = '#047857';
    badgeBorder = '#A7F3D0';
  } else if (badgeVariant === 'amber') {
    badgeBg = '#FFFBEB';
    badgeColor = '#B45309';
    badgeBorder = '#FDE68A';
  }

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`Select role: ${title}. ${description}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      whileHover={{ y: -4, borderColor: 'var(--color-border-active)', boxShadow: 'var(--shadow-lg)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-2xl)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '180px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-md)',
        position: 'relative',
        outline: 'none',
        userSelect: 'none',
        transition: 'border-color var(--transition-fast), background var(--transition-fast)',
      }}
    >
      {/* Top Row: Icon + Badge + Circular Arrow Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-circle)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: 'var(--color-primary)',
            }}
          >
            {icon}
          </div>

          {badgeText && (
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: badgeBg,
                color: badgeColor,
                border: `1px solid ${badgeBorder}`,
                letterSpacing: '0.3px',
              }}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Sleek Template Circular Action Pill Button with ↗ */}
        <div
          aria-hidden="true"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-surface-circle)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-primary)',
            fontSize: '18px',
            boxShadow: 'var(--shadow-sm)',
            flexShrink: 0,
          }}
        >
          <FiArrowUpRight />
        </div>
      </div>

      {/* Bottom Content: Title & One-line Description */}
      <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h3
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.3px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
};

