import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiAlertTriangle,
  FiShield,
  FiMapPin,
  FiRefreshCw,
  FiFileText,
  FiMoon,
  FiSun,
  FiX,
  FiActivity,
} from 'react-icons/fi';
import { MdEmergency } from 'react-icons/md';

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  icon: React.ReactNode;
}

export interface SidebarProps {
  currentRoleTitle: string;
  activeTab: string;
  onSelectTab: (id: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  navItems?: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoleTitle,
  activeTab,
  onSelectTab,
  isOpenMobile = false,
  onCloseMobile,
  navItems,
}) => {
  const username = localStorage.getItem('ameniedge_username') || 'Commander';
  const role = localStorage.getItem('ameniedge_role') || 'STATION_LEADER';

  const defaultItems: NavItem[] = [
    { id: 'OVERVIEW', label: 'Dashboard', icon: <FiGrid /> },
    { id: 'INCIDENTS', label: 'Incidents & Triage', icon: <FiAlertTriangle /> },
    { id: 'TEAMS', label: 'Teams & Units', icon: <FiShield /> },
    { id: 'MAP', label: 'Offline Tactical Map', icon: <FiMapPin /> },
    { id: 'SYNC', label: 'Mesh Sync Outbox', icon: <FiRefreshCw /> },
    { id: 'AUDIT', label: 'Audit Vault', icon: <FiFileText /> },
  ];

  const items = navItems || defaultItems;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const sidebarContent = (
    <aside
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '260px',
        minWidth: '260px',
        height: '100%',
        backgroundColor: 'var(--color-dash-card, #121620)',
        borderRight: '1px solid var(--color-dash-border, #1F2737)',
        padding: '20px 16px',
        boxSizing: 'border-box',
        color: '#FFFFFF',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: '#FFFFFF' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '10px',
                backgroundColor: 'var(--color-primary, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                fontSize: '18px',
                boxShadow: '0 0 16px rgba(37,99,235,0.4)',
              }}
            >
              <MdEmergency />
            </div>
            <div>
              <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Ameni<span style={{ color: 'var(--color-danger, #DC2626)' }}>Edge</span>
              </span>
              <span style={{ display: 'block', fontSize: '10px', color: 'var(--color-dash-text-muted, #8896AB)', fontWeight: 600, letterSpacing: '0.5px' }}>
                COMMAND CONSOLE
              </span>
            </div>
          </Link>

          {isOpenMobile && onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Close navigation drawer"
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '20px',
                cursor: 'pointer',
                padding: '8px',
                minWidth: '48px',
                minHeight: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FiX />
            </button>
          )}
        </div>

        {/* User Profile Card (from NeuroBank template) */}
        <div
          style={{
            backgroundColor: 'var(--color-dash-surface, #19202E)',
            border: '1px solid var(--color-dash-border, #1F2737)',
            borderRadius: '16px',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#2563EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                }}
              >
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <span style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.5px' }}>
                  {currentRoleTitle}
                </span>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#F1F5F9' }}>
                  {username}
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(0,0,0,0.25)',
                padding: '4px 6px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{ fontSize: '12px', color: '#60A5FA' }}><FiMoon /></span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-dash-text-dim, #54627A)', letterSpacing: '0.5px' }}>
              {currentDateStr}
            </span>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0', marginTop: '2px' }}>
              Operational Sector Active
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav aria-label="Dashboard navigation" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {items.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  minHeight: '48px',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isActive ? 'var(--color-dash-surface, #19202E)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--color-dash-text-muted, #8896AB)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s ease, color 0.15s ease',
                  borderLeft: isActive ? '3px solid #38BDF8' : '3px solid transparent',
                  boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <span style={{ fontSize: '16px', color: isActive ? '#38BDF8' : 'inherit' }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card (Template Upgrade Widget styled as Mesh Status) */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(37,99,235,0.18), rgba(29,78,216,0.08))',
          border: '1px solid rgba(37,99,235,0.3)',
          borderRadius: '16px',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#F1F5F9' }}>Station Mesh Live</span>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--color-dash-text-muted, #8896AB)', margin: 0, lineHeight: 1.4 }}>
          Local Wi-Fi + VHF Store & Forward Active. Backup Generator at 98%.
        </p>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <div className="mobile-hide" style={{ height: '100%', flexShrink: 0 }}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{ width: '280px', height: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

