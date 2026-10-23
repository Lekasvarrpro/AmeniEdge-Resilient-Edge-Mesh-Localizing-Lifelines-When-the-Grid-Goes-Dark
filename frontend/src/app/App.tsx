import React, { useState, useEffect } from 'react';
import { ConnectivityBar } from '../components/ui/ConnectivityBar';
import { SOSHomeView } from '../features/sos/SOSHomeView';
import { SOSWizardView } from '../features/sos/SOSWizardView';
import { SOSConfirmationView } from '../features/sos/SOSConfirmationView';
import { MyReportsView } from '../features/sos/MyReportsView';
import { OfflineMapView } from '../features/maps/OfflineMapView';
import { RescueTeamDashboard } from '../features/teams/RescueTeamDashboard';
import { StationLeaderDashboard } from '../features/incidents/StationLeaderDashboard';
import { RegionalSupervisorDashboard } from '../features/supervisor/RegionalSupervisorDashboard';
import { AdminPortalView } from '../features/admin/AdminPortalView';
import { FirstAidGuidesView } from '../features/help/FirstAidGuidesView';
import { ComponentCatalogView } from '../features/catalog/ComponentCatalogView';
import type { LocalReport } from '../lib/db/index';

type RoleView = 'CITIZEN' | 'TEAM' | 'LEADER' | 'SUPERVISOR' | 'ADMIN' | 'CATALOG';
type CitizenTab = 'SOS' | 'REPORTS' | 'MAP' | 'HELP';

export const App: React.FC = () => {
  const [role, setRole] = useState<RoleView>('CITIZEN');
  const [citizenTab, setCitizenTab] = useState<CitizenTab>('SOS');
  const [theme, setTheme] = useState<'light' | 'dark' | 'high-contrast'>('light');

  // SOS wizard and confirmation states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<string>('FLOOD');
  const [activeReport, setActiveReport] = useState<LocalReport | null>(null);

  // Apply theme attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('high-contrast');
    else setTheme('light');
  };

  const handleOpenWizard = (category?: string) => {
    if (category) setWizardCategory(category);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (report: LocalReport) => {
    setIsWizardOpen(false);
    setActiveReport(report);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100dvh',
        overflow: 'hidden',
        backgroundColor: 'var(--color-surface)',
        color: 'var(--color-text-primary)',
      }}
    >
      {/* 1. Global Persistent Connectivity & Sync Bar */}
      <ConnectivityBar />

      {/* 2. Top Header & Role Switcher Bar */}
      <header
        style={{
          minHeight: '48px',
          padding: '8px 16px',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          zIndex: 500,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📡</span>
          <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 900, letterSpacing: '-0.5px' }}>
            Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
          </span>
        </div>

        {/* Role Selector & Theme Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as RoleView)}
            aria-label="Select command role"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
              minHeight: '36px',
            }}
          >
            <option value="CITIZEN">👤 Citizen (Emergency Guest)</option>
            <option value="TEAM">🚑 Rescue Team (Alpha)</option>
            <option value="LEADER">🎖️ Station Leader (North)</option>
            <option value="SUPERVISOR">🌐 Regional Supervisor</option>
            <option value="ADMIN">⚙️ Administrator</option>
            <option value="CATALOG">🎨 Component Catalog</option>
          </select>

          <button
            onClick={toggleTheme}
            aria-label="Toggle visual theme (Light, Dark, High-Contrast)"
            style={{
              padding: '6px 10px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface-subtle)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '36px',
            }}
          >
            {theme === 'light' ? '☀️ Light' : theme === 'dark' ? '🌙 Dark' : '⚡ Outdoor Contrast'}
          </button>
        </div>
      </header>

      {/* 3. Main Operational Viewport */}
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {isWizardOpen ? (
          <SOSWizardView
            initialCategory={wizardCategory}
            onCancel={() => setIsWizardOpen(false)}
            onComplete={handleWizardComplete}
          />
        ) : activeReport ? (
          <SOSConfirmationView
            report={activeReport}
            onDone={() => setActiveReport(null)}
            onOpenMap={() => {
              setActiveReport(null);
              setCitizenTab('MAP');
            }}
          />
        ) : role === 'CITIZEN' ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {citizenTab === 'SOS' && (
                <SOSHomeView
                  onOpenWizard={handleOpenWizard}
                  onViewReport={(rep) => setActiveReport(rep)}
                  onOpenMap={() => setCitizenTab('MAP')}
                />
              )}
              {citizenTab === 'REPORTS' && (
                <MyReportsView
                  onSelectReport={(rep) => setActiveReport(rep)}
                  onNewSOS={() => setCitizenTab('SOS')}
                />
              )}
              {citizenTab === 'MAP' && <OfflineMapView />}
              {citizenTab === 'HELP' && <FirstAidGuidesView />}
            </div>

            {/* Mobile Bottom Navigation Bar (Thumb Zone) */}
            <nav
              role="navigation"
              aria-label="Citizen portal navigation"
              style={{
                minHeight: '56px',
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                alignItems: 'center',
                zIndex: 400,
                boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
              }}
            >
              {[
                { id: 'SOS', label: 'SOS', icon: '🚨' },
                { id: 'REPORTS', label: 'Reports', icon: '📋' },
                { id: 'MAP', label: 'Offline Map', icon: '🗺️' },
                { id: 'HELP', label: 'First Aid', icon: '🩹' },
              ].map((tab) => {
                const isActive = citizenTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCitizenTab(tab.id as CitizenTab)}
                    style={{
                      height: '100%',
                      background: 'none',
                      border: 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '2px',
                      color: isActive ? 'var(--color-danger)' : 'var(--color-text-secondary)',
                      fontWeight: isActive ? 800 : 500,
                      fontSize: 'var(--font-size-xs)',
                      cursor: 'pointer',
                      borderTop: isActive ? '3px solid var(--color-danger)' : '3px solid transparent',
                    }}
                  >
                    <span style={{ fontSize: '18px' }}>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        ) : role === 'TEAM' ? (
          <RescueTeamDashboard onOpenMap={() => setRole('CITIZEN')} />
        ) : role === 'LEADER' ? (
          <StationLeaderDashboard />
        ) : role === 'SUPERVISOR' ? (
          <RegionalSupervisorDashboard />
        ) : role === 'ADMIN' ? (
          <AdminPortalView />
        ) : (
          <ComponentCatalogView />
        )}
      </main>
    </div>
  );
};
