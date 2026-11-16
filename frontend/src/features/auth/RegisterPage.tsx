import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiAlertTriangle, FiCheck, FiShield } from 'react-icons/fi';
import { MdEmergency } from 'react-icons/md';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ConnectivityBar } from '../../components/ui/ConnectivityBar';
import { api } from '../../lib/api/client';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const roleParam = searchParams.get('role');

  const [accountType, setAccountType] = useState<'citizen' | 'rescue'>(
    roleParam === 'rescue' || roleParam === 'leader' || roleParam === 'supervisor' || roleParam === 'admin'
      ? 'rescue'
      : 'citizen'
  );

  const [fullName, setFullName] = useState('');
  const [emailOrUser, setEmailOrUser] = useState('');
  const [phone, setPhone] = useState('');
  const [stationId, setStationId] = useState('STA-CHN-N-001');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', score: 0, color: 'var(--color-border)' };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { label: 'Weak', score: 25, color: 'var(--color-danger)' };
    if (score <= 3) return { label: 'Good', score: 65, color: 'var(--color-warning)' };
    return { label: 'Strong', score: 100, color: 'var(--color-success)' };
  };

  const strength = getPasswordStrength();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!emailOrUser.trim()) {
      setErrorMessage('Please enter your email or username.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
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
      }>('/auth/register', {
        fullName: fullName.trim(),
        username: emailOrUser.trim(),
        password,
        role: accountType === 'citizen' ? 'CITIZEN' : 'RESCUE_MEMBER',
        stationId: accountType === 'rescue' ? stationId : undefined,
        phone: phone.trim() || undefined,
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
        if ((response as any).teamId) {
          localStorage.setItem('ameniedge_team_id', (response as any).teamId);
        }
        if ((response as any).teamName) {
          localStorage.setItem('ameniedge_team_name', (response as any).teamName);
        }
        localStorage.setItem('ameniedge_user', JSON.stringify(response));
      }

      setIsSuccess(true);

      setTimeout(() => {
        if (accountType === 'citizen') {
          navigate('/app');
        } else {
          navigate('/team');
        }
      }, 500);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('NETWORK_DISCONNECTED') || msg.includes('Failed to fetch')) {
        setErrorMessage('Station node offline. Registration will complete when connected.');
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
                  Account Enrollment
                </span>
                <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '8px 0', letterSpacing: '-0.5px' }}>
                  Join the Station Response Mesh
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  Register to link emergency reports with your household, or join a certified local rescue
                  taskforce with verified station credentials.
                </p>
              </div>

              <div style={{ width: '100%', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                <img
                  src="/images/flood-rescue.svg"
                  alt="Disaster response coordination"
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
              <span>Immediate Emergency? Submit SOS without an account &rarr;</span>
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
                Account Registration Tier
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
                  onClick={() => {
                    setAccountType('citizen');
                    setErrorMessage(null);
                  }}
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
                  onClick={() => {
                    setAccountType('rescue');
                    setErrorMessage(null);
                  }}
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
                {accountType === 'citizen' ? 'Create Citizen Profile' : 'Register Rescue Resource'}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
                {accountType === 'citizen'
                  ? 'Citizens register freely to track personal SOS alerts and rescue updates.'
                  : 'Field responder and team registration with localized station assignment.'}
              </p>
            </div>

            {/* Error Message Box */}
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

            {/* Registration Form */}
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Arun Krishnan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<FiUser />}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <Input
                  label={accountType === 'citizen' ? 'Email or Mobile' : 'Username or Email'}
                  placeholder={accountType === 'citizen' ? 'citizen@mesh.local or mobile' : 'rescue_username'}
                  value={emailOrUser}
                  onChange={(e) => setEmailOrUser(e.target.value)}
                  icon={<FiMail />}
                  required
                />

                <Input
                  label="Contact Phone"
                  placeholder="+91-XXXXX-XXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<FiPhone />}
                />
              </div>

              {/* Station ID for Responders */}
              {accountType === 'rescue' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <Input
                    label="Organization / Station ID"
                    placeholder="STA-CHN-N-001"
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    icon={<FiShield />}
                    required
                  />

                  {/* Verification Notice */}
                  <div
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      fontSize: '12px',
                      color: '#1E40AF',
                      lineHeight: 1.45,
                    }}
                  >
                    <strong>Notice:</strong> Your account will be verified by an admin or Station Leader before field
                    dispatch permissions activate.
                  </div>
                </div>
              )}

              {/* Password & Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<FiLock />}
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<FiLock />}
                  required
                />
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Security Strength</span>
                    <span style={{ color: strength.color }}>{strength.label}</span>
                  </div>
                  <div style={{ height: '4px', backgroundColor: 'var(--color-border)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${strength.score}%`,
                        backgroundColor: strength.color,
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              )}

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
                    <span>Profile Registered! Redirecting...</span>
                  </span>
                ) : (
                  <span>Complete Registration</span>
                )}
              </Button>
            </form>

            {/* Bottom Login and SOS Links */}
            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                Already have a verified account?{' '}
                <Link
                  to={`/login?role=${accountType}`}
                  style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'none' }}
                >
                  Sign In
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
                * Immediate Emergency? Submit SOS without an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
