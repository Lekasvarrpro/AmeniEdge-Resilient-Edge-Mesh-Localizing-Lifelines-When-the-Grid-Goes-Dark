import React from 'react';
import { FiMenu, FiLogOut, FiSliders, FiPlus, FiChevronDown, FiRadio } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export interface TopbarProps {
  title: string;
  subtitle?: string;
  onToggleMobileMenu?: () => void;
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  title,
  subtitle,
  onToggleMobileMenu,
  primaryActionLabel = '+ Deploy Resource',
  onPrimaryAction,
  secondaryActionLabel = 'Filter Layers',
  onSecondaryAction,
}) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('ameniedge_username') || 'Commander';

  const handleLogout = () => {
    localStorage.removeItem('ameniedge_token');
    localStorage.removeItem('ameniedge_refresh_token');
    localStorage.removeItem('ameniedge_role');
    localStorage.removeItem('ameniedge_username');
    navigate('/');
  };

  return (
    <header
      style={{
        minHeight: '64px',
        padding: '12px 24px',
        backgroundColor: 'var(--color-dash-card, #121620)',
        borderBottom: '1px solid var(--color-dash-border, #1F2737)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      {/* Left: Mobile Hamburger & Title / Sector Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Open command navigation menu"
            className="desktop-hide"
            style={{
              background: 'none',
              border: '1px solid var(--color-dash-border, #1F2737)',
              borderRadius: '10px',
              color: '#F1F5F9',
              fontSize: '20px',
              padding: '10px',
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <FiMenu />
          </button>
        )}

        {/* Sector Pill (Template's "This Month" style dropdown) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--color-dash-surface, #19202E)',
            border: '1px solid var(--color-dash-border, #1F2737)',
            padding: '8px 14px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#F1F5F9',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <span style={{ color: '#38BDF8', fontSize: '14px' }}>
            <FiRadio />
          </span>
          <span>{title}</span>
          <FiChevronDown style={{ color: 'var(--color-dash-text-muted, #8896AB)', fontSize: '12px' }} />
        </div>

        {subtitle && (
          <span className="mobile-hide" style={{ fontSize: '12px', color: 'var(--color-dash-text-muted, #8896AB)', fontWeight: 500 }}>
            {subtitle}
          </span>
        )}
      </div>

      {/* Right: Actions & User Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--color-dash-surface, #19202E)',
              border: '1px solid var(--color-dash-border, #1F2737)',
              color: '#F1F5F9',
              borderRadius: '12px',
              padding: '8px 14px',
              minHeight: '48px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <FiSliders />
            <span>{secondaryActionLabel}</span>
          </button>
        )}

        {onPrimaryAction && (
          <button
            onClick={onPrimaryAction}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
              border: 'none',
              color: '#FFFFFF',
              borderRadius: '12px',
              padding: '8px 18px',
              minHeight: '48px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
              transition: 'transform 0.15s ease',
            }}
          >
            <FiPlus style={{ fontSize: '14px' }} />
            <span>{primaryActionLabel}</span>
          </button>
        )}

        {/* User Pill & Sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '6px' }}>
          <button
            onClick={handleLogout}
            aria-label="Logout of command console"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'transparent',
              border: '1px solid var(--color-dash-border, #1F2737)',
              color: 'var(--color-dash-text-muted, #8896AB)',
              borderRadius: '9999px',
              padding: '6px 14px',
              minHeight: '48px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

