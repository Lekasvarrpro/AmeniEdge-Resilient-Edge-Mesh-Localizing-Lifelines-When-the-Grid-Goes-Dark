import React, { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { Sidebar, NavItem } from './Sidebar';
import { Topbar } from './Topbar';
import { ConnectivityBar } from '../ui/ConnectivityBar';

export interface DashboardLayoutProps {
  currentRoleTitle: string;
  stationOrSectorTitle?: string;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  navItems?: NavItem[];
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  currentRoleTitle,
  stationOrSectorTitle = 'Royapuram Sector North (STA-CHN-N-001)',
  activeTab,
  onSelectTab,
  navItems,
  primaryActionLabel,
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction,
  isLoading = false,
  errorMessage,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        width: '100%',
        backgroundColor: 'var(--color-dash-bg, #090B10)',
        overflow: 'hidden',
        color: '#FFFFFF',
      }}
    >
      {/* 1. Global Connectivity Status Bar */}
      <ConnectivityBar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* 2. Left Sidebar (Collapsible drawer on mobile) */}
        <Sidebar
          currentRoleTitle={currentRoleTitle}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          navItems={navItems}
        />

        {/* 3. Main Workspace Area */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          {/* Topbar */}
          <Topbar
            title={stationOrSectorTitle}
            subtitle={currentRoleTitle}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            primaryActionLabel={primaryActionLabel}
            onPrimaryAction={onPrimaryAction}
            secondaryActionLabel={secondaryActionLabel}
            onSecondaryAction={onSecondaryAction}
          />

          {/* Scrollable Content Container */}
          <main
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 'clamp(16px, 3vw, 28px)',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {errorMessage && (
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  fontSize: '13px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <FiAlertTriangle aria-hidden="true" />
                <span>{errorMessage}</span>
              </div>
            )}

            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: '180px',
                      backgroundColor: 'var(--color-dash-card, #121620)',
                      borderRadius: '24px',
                      border: '1px solid var(--color-dash-border, #1F2737)',
                      opacity: 0.5,
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

