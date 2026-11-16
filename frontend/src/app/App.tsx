import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from '../features/home/HomePage';
import { LoginPage } from '../features/auth/LoginPage';
import { RegisterPage } from '../features/auth/RegisterPage';
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
import { ConnectivityBar } from '../components/ui/ConnectivityBar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { api } from '../lib/api/client';
import type { LocalReport } from '../lib/db/index';
import { MdEmergency } from 'react-icons/md';
import { FiLogOut, FiUser, FiBell, FiAlertTriangle, FiList, FiMap } from 'react-icons/fi';
import { FaHandsHelping } from 'react-icons/fa';

// Public Alerts & Community Bulletins Component for Citizen Tab
const PublicAlertsView: React.FC = () => {
  const [bulletins, setBulletins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<any[]>('/bulletins')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBulletins(data);
        } else {
          // Fallback demo bulletins
          setBulletins([
            {
              id: 'BLT-001',
              title: 'Station North Wi-Fi Operational - Emergency Mesh Active',
              content: 'Station North Wi-Fi is active on emergency generator backup. Submit SOS or visit St. Mary Relief Camp.',
              severity: 'INFO',
              publishedAt: new Date().toISOString(),
            },
            {
              id: 'BLT-002',
              title: 'Urgent Flood Alert: River Otteri Overflowing',
              content: 'Otteri Nullah water levels exceeding danger mark by 1.8m. Evacuate low-lying ground floors immediately.',
              severity: 'DANGER',
              publishedAt: new Date().toISOString(),
            },
          ]);
        }
      })
      .catch(() => {
        setBulletins([
          {
            id: 'BLT-001',
            title: 'Station North Wi-Fi Operational - Emergency Mesh Active',
            content: 'Station North Wi-Fi is active on emergency generator backup. Submit SOS or visit St. Mary Relief Camp.',
            severity: 'INFO',
            publishedAt: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: '20px 16px', maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
          Community Bulletins & Alerts
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
          Verified civil defense announcements broadcasted over local station Wi-Fi.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-muted)' }}>Loading local broadcasts...</div>
      ) : bulletins.length === 0 ? (
        <Card variant="subtle" style={{ textAlign: 'center', padding: '32px' }}>
          No active disaster advisories for this sector.
        </Card>
      ) : (
        bulletins.map((b) => (
          <div
            key={b.id}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-xl)',
              padding: '20px',
              border: b.severity === 'DANGER' ? '1px solid #FECACA' : '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: b.severity === 'DANGER' ? '#FEE2E2' : '#EFF6FF',
                  color: b.severity === 'DANGER' ? 'var(--color-danger)' : 'var(--color-primary)',
                }}
              >
                {b.severity === 'DANGER' ? 'URGENT WARNING' : 'CIVIL ADVISORY'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                {new Date(b.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>{b.title}</h3>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>{b.content}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Citizen Layout Shell (Used for both Guest SOS /sos and Authenticated Citizen /app)
const CitizenPortal: React.FC<{ isGuest?: boolean }> = ({ isGuest = false }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'SOS' | 'REPORTS' | 'MAP' | 'HELP' | 'ALERTS'>('SOS');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<string>('FLOOD');
  const [activeReport, setActiveReport] = useState<LocalReport | null>(null);

  const token = localStorage.getItem('ameniedge_token');
  const username = localStorage.getItem('ameniedge_username') || 'Citizen';

  const handleLogout = () => {
    localStorage.removeItem('ameniedge_token');
    localStorage.removeItem('ameniedge_refresh_token');
    localStorage.removeItem('ameniedge_role');
    localStorage.removeItem('ameniedge_username');
    navigate('/');
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>
      {import.meta.env.VITE_DEMO_MODE === 'true' && (
        <div
          role="status"
          style={{
            backgroundColor: '#1E293B',
            color: '#94A3B8',
            fontSize: '11px',
            fontWeight: 600,
            padding: '5px 16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderBottom: '1px solid #334155',
            flexShrink: 0,
            zIndex: 100,
          }}
        >
          <span style={{ color: '#38BDF8', fontWeight: 700 }}>Demo mode:</span>
          <span>Online demo. Offline station mode runs on a local device.</span>
        </div>
      )}
      <ConnectivityBar />

      {/* Top Header */}
      <header
        style={{
          minHeight: '52px',
          padding: '8px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: 800 }}>
          <div
            style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-danger)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              fontSize: '16px',
            }}
          >
            <MdEmergency />
          </div>
          <span>
            Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
          </span>
          {isGuest && (
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: '#FEE2E2',
                color: 'var(--color-danger)',
                marginLeft: '4px',
              }}
            >
              Guest SOS
            </span>
          )}
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {token ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-surface-circle)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <FiUser /> {username}
                </span>
              </span>
              <button
                onClick={handleLogout}
                aria-label="Sign out of account"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '12px',
                  color: 'var(--color-text-secondary)',
                  background: 'none',
                  border: '1px solid var(--color-border)',
                  padding: '5px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                <FiLogOut />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--color-primary)',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(37, 99, 235, 0.08)',
                border: '1px solid rgba(37, 99, 235, 0.2)',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
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
              setTab('MAP');
            }}
          />
        ) : tab === 'SOS' ? (
          <SOSHomeView
            onOpenWizard={handleOpenWizard}
            onViewReport={(rep) => setActiveReport(rep)}
            onOpenMap={() => setTab('MAP')}
          />
        ) : tab === 'REPORTS' ? (
          <MyReportsView
            onSelectReport={(rep) => setActiveReport(rep)}
            onNewSOS={() => setTab('SOS')}
          />
        ) : tab === 'MAP' ? (
          <OfflineMapView />
        ) : tab === 'ALERTS' ? (
          <PublicAlertsView />
        ) : (
          <FirstAidGuidesView />
        )}
      </main>

      {/* Citizen Bottom Navigation Bar (5 Tabs) */}
      {!isWizardOpen && !activeReport && (
        <nav
          role="navigation"
          aria-label="Citizen portal navigation"
          style={{
            minHeight: '58px',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            alignItems: 'center',
            zIndex: 400,
            boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
          }}
        >
          {[
            { id: 'SOS', label: 'SOS', icon: <MdEmergency style={{ fontSize: '18px' }} /> },
            { id: 'REPORTS', label: 'Reports', icon: <FiList style={{ fontSize: '18px' }} /> },
            { id: 'MAP', label: 'Map', icon: <FiMap style={{ fontSize: '18px' }} /> },
            { id: 'HELP', label: 'Help', icon: <FaHandsHelping style={{ fontSize: '18px' }} /> },
            { id: 'ALERTS', label: 'Alerts', icon: <FiBell style={{ fontSize: '18px' }} /> },
          ].map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as typeof tab)}
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
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '11px',
                  cursor: 'pointer',
                  borderTop: isActive ? '3px solid var(--color-danger)' : '3px solid transparent',
                  padding: '6px 0',
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

// Generic Role Dashboard Layout Wrapper
const RoleLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const navigate = useNavigate();
  const username = localStorage.getItem('ameniedge_username') || 'Responder';
  const role = localStorage.getItem('ameniedge_role') || 'RESCUE_MEMBER';
  const teamName = localStorage.getItem('ameniedge_team_name');
  const stationId = localStorage.getItem('ameniedge_station_id');

  const stationLabel = stationId === 'STA-CHN-S-002' ? 'South Station' : stationId === 'STA-CHN-N-001' ? 'North Station' : '';
  let displayIdentity = `${username} (${role})`;
  if (role === 'RESCUE_MEMBER' || role === 'VOLUNTEER') {
    if (teamName) {
      displayIdentity = teamName;
    } else if (stationLabel) {
      displayIdentity = `Rescue Team - ${stationLabel}`;
    }
  } else if (role === 'STATION_LEADER') {
    displayIdentity = `Station Leader - ${stationLabel || 'Anna Nagar'}`;
  } else if (role === 'REGIONAL_SUPERVISOR') {
    displayIdentity = 'Regional Supervisor - Greater Chennai';
  } else if (role === 'ORG_ADMIN') {
    displayIdentity = 'System Administrator';
  }

  const handleLogout = () => {
    localStorage.removeItem('ameniedge_token');
    localStorage.removeItem('ameniedge_refresh_token');
    localStorage.removeItem('ameniedge_role');
    localStorage.removeItem('ameniedge_user_id');
    localStorage.removeItem('ameniedge_username');
    localStorage.removeItem('ameniedge_station_id');
    localStorage.removeItem('ameniedge_team_id');
    localStorage.removeItem('ameniedge_team_name');
    localStorage.removeItem('ameniedge_user');
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>
      {import.meta.env.VITE_DEMO_MODE === 'true' && (
        <div
          role="status"
          style={{
            backgroundColor: '#1E293B',
            color: '#94A3B8',
            fontSize: '11px',
            fontWeight: 600,
            padding: '5px 16px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            borderBottom: '1px solid #334155',
            flexShrink: 0,
            zIndex: 100,
          }}
        >
          <span style={{ color: '#38BDF8', fontWeight: 700 }}>Demo mode:</span>
          <span>Online demo. Offline station mode runs on a local device.</span>
        </div>
      )}
      <ConnectivityBar />
      <header
        style={{
          minHeight: '52px',
          padding: '8px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--color-text-primary)', fontWeight: 800, fontSize: '16px' }}>
            Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
          </Link>
          <span style={{ color: 'var(--color-border)' }}>/</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            {title}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-primary)',
              backgroundColor: '#EFF6FF',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid #BFDBFE',
            }}
          >
            <FiUser style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} /> {displayIdentity}
          </span>

          <button
            onClick={handleLogout}
            aria-label="Logout of session"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: 'var(--color-text-secondary)',
              background: 'none',
              border: '1px solid var(--color-border)',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
};

// Protected Route Guard (Normal navigation redirect to /login with ?redirect=, NO popup, NO modal)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('ameniedge_token');
  const location = useLocation();

  if (!token) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Never ask for sign-in, no popups) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/sos" element={<CitizenPortal isGuest={true} />} />
        <Route path="/app" element={<CitizenPortal isGuest={false} />} />

        {/* Protected Role Dashboards (Redirects to /login if unauthenticated) */}
        <Route
          path="/team"
          element={
            <ProtectedRoute>
              <RescueTeamDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StationLeaderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/regional"
          element={
            <ProtectedRoute>
              <RegionalSupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPortalView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalog"
          element={
            <RoleLayout title="Design System Catalog">
              <ComponentCatalogView />
            </RoleLayout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
