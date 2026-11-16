import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiMail, FiLock, FiAlertTriangle, FiCheck, FiArrowRight, FiShield, FiUser } from 'react-icons/fi';
import { MdEmergency } from 'react-icons/md';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConnectivityBar } from '../../components/ui/ConnectivityBar';
import { api } from '../../lib/api/client';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const redirectParam = searchParams.get('redirect');
  const roleParam = searchParams.get('role');

  // Two account types only
  const [accountType, setAccountType] = useState<'citizen' | 'rescue'>(
    roleParam === 'rescue' || roleParam === 'leader' || roleParam === 'supervisor' || roleParam === 'admin'
      ? 'rescue'
      : 'citizen'
  );

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleTabSwitch = (type: 'citizen' | 'rescue') => {
    setAccountType(type);
    setErrorMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage(
        accountType === 'citizen'
          ? 'Please enter your email or phone number.'
          : 'Please enter your responder username or email.'
      );
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post<{
        token: string;
        refreshToken: string;
        userId: string;
        username: string;
        role: string;
        stationId?: string;
        teamId?: string;
        teamName?: string;
      }>('/auth/login', {
        username: username.trim(),
        password,
      });

      if (response && response.token) {
        localStorage.setItem('ameniedge_token', response.token);
        localStorage.setItem('ameniedge_refresh_token', response.refreshToken || '');
        localStorage.setItem('ameniedge_role', response.role);
        localStorage.setItem('ameniedge_user_id', response.userId);
        localStorage.setItem('ameniedge_username', response.username);
        if (response.stationId) {
          localStorage.setItem('ameniedge_station_id', response.stationId);
        }
        if (response.teamId) {
          localStorage.setItem('ameniedge_team_id', response.teamId);
        }
        if (response.teamName) {
          localStorage.setItem('ameniedge_team_name', response.teamName);
        }
        localStorage.setItem('ameniedge_user', JSON.stringify(response));
      }

      setIsSuccess(true);

      setTimeout(() => {
        if (redirectParam) {
          navigate(redirectParam);
          return;
        }

        const role = response?.role || (accountType === 'citizen' ? 'CITIZEN' : 'RESCUE_MEMBER');
        switch (role) {
          case 'RESCUE_MEMBER':
          case 'VOLUNTEER':
            navigate('/team');
            break;
          case 'STATION_LEADER':
            navigate('/dashboard');
            break;
          case 'REGIONAL_SUPERVISOR':
            navigate('/regional');
            break;
          case 'ORG_ADMIN':
            navigate('/admin');
            break;
          case 'CITIZEN':
          default:
            navigate('/app');
            break;
        }
      }, 500);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('NETWORK_DISCONNECTED') || msg.includes('Failed to fetch')) {
        setErrorMessage('Station node unreachable. Check Wi-Fi connection to station access point.');
      } else if (msg.includes('401') || msg.includes('Bad credentials')) {
        setErrorMessage('Invalid username or password. For demo accounts use password: password123');
      } else {
        setErrorMessage(msg);
      }
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100dvh',
        width: '100%',
        backgroundColor: 'var(--color-canvas)',
        boxSizing: 'border-box',
      }}
    >
      <ConnectivityBar />

      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          maxWidth: '1160px',
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-2xl)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
            width: '100%',
          }}
        >
          {/* Left Brand Panel (Desktop) */}
          <div
            className="mobile-hide"
            style={{
              backgroundColor: '#F8FAFC',
              borderRight: '1px solid var(--color-border)',
              padding: '48px 40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '32px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-danger)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '18px',
                  }}
                >
                  <MdEmergency />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
                </span>
              </Link>

              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: 'var(--color-primary)',
                  }}
                >
                  Edge Mesh Access
                </span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', letterSpacing: '-0.5px' }}>
                  Station Command & Field Operation
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  Access localized emergency coordination, rescue triage, and community report history directly
                  over the station network.
                </p>
              </div>

              <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img
                  src="/images/flood-rescue.svg"
                  alt="Rescue squad mission coordination"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>

            <Link
              to="/sos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--color-danger)',
                textDecoration: 'none',
              }}
            >
              <MdEmergency />
              <span>Immediate Emergency? Submit SOS without logging in &rarr;</span>
            </Link>
          </div>

          {/* Right Form Panel */}
          <div
            style={{
              padding: 'clamp(24px, 5vw, 48px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '24px',
            }}
          >
            {/* Top 2-Option Account Switch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                Select Account Type
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  backgroundColor: 'var(--color-surface-circle)',
                  padding: '4px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleTabSwitch('citizen')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: accountType === 'citizen' ? '#FFFFFF' : 'transparent',
                    color: accountType === 'citizen' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: accountType === 'citizen' ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FiUser />
                  <span>Citizen / User</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch('rescue')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: 'none',
                    backgroundColor: accountType === 'rescue' ? '#FFFFFF' : 'transparent',
                    color: accountType === 'rescue' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: accountType === 'rescue' ? 'var(--shadow-sm)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FiShield />
                  <span>Rescue Team</span>
                </button>
              </div>
            </div>

            <div>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
                {accountType === 'citizen' ? 'Citizen Sign In' : 'Rescue Team & Command'}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {accountType === 'citizen'
                  ? 'Enter your mobile number or email to view your personal reports.'
                  : 'Field members, station leaders, supervisors & admins sign in here.'}
              </p>
            </div>

            {/* Error Message Box with animated shake */}
            {errorMessage && (
              <motion.div
                animate={shouldReduceMotion ? {} : { x: [-4, 4, -3, 3, 0] }}
                transition={{ duration: 0.3 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: 'var(--color-danger)',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FiAlertTriangle style={{ flexShrink: 0, fontSize: '16px' }} />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label={accountType === 'citizen' ? 'Mobile Number or Email' : 'Responder Username or Email'}
                placeholder={accountType === 'citizen' ? 'e.g. +91-98400-00008 or citizen_arun' : 'e.g. rescue_alpha, leader_north, admin'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={accountType === 'citizen' ? <FiUser /> : <FiShield />}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter account password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FiLock />}
                required
              />

              {/* Remember Me and Forgot Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ accentColor: 'var(--color-primary)' }}
                  />
                  <span>Remember session</span>
                </label>

                <span style={{ color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}>
                  Forgot password?
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isLoading}
                disabled={isSuccess}
                style={{ borderRadius: 'var(--radius-full)', marginTop: '8px' }}
              >
                {isSuccess ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheck />
                    <span>Authenticated! Entering portal...</span>
                  </span>
                ) : (
                  <span>Sign In</span>
                )}
              </Button>
            </form>

            {/* Bottom Register and SOS Links */}
            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                Don't have an account?{' '}
                <Link
                  to={`/register?role=${accountType}`}
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Register here
                </Link>
              </div>

              <Link
                to="/sos"
                style={{
                  color: 'var(--color-danger)',
                  fontWeight: 700,
                  fontSize: '13px',
                  textDecoration: 'none',
                }}
              >
                * Send Emergency SOS without an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
