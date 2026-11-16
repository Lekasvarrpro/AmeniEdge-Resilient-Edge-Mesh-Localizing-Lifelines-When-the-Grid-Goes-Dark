import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiMenu,
  FiRadio,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiWifi,
  FiX,
  FiLifeBuoy,
} from 'react-icons/fi';
import { FaAmbulance, FaHandsHelping, FaUserShield } from 'react-icons/fa';
import { MdEmergency, MdOutlineSupervisorAccount } from 'react-icons/md';
import { ConnectivityBar } from '../../components/ui/ConnectivityBar';
import { Button } from '../../components/ui/Button';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
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
        color: 'var(--color-text-primary)',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Global Persistent Connectivity Bar */}
      <ConnectivityBar />

      {/* 2. Sticky Navbar with Mobile Hamburger Drawer */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 500,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid var(--color-border)',
          width: '100%',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxSizing: 'border-box',
          }}
        >
          {/* Brand Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--color-text-primary)',
            }}
          >
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
                boxShadow: 'var(--shadow-sos)',
              }}
            >
              <MdEmergency />
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>
              Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav
            aria-label="Main Navigation"
            className="mobile-hide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('who-its-for')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Roles
            </button>
            <button
              onClick={() => scrollToSection('safety')}
              style={{
                background: 'none',
                border: 'none',
                fontSize: 'var(--font-size-sm)',
                fontWeight: 600,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              Safety
            </button>
          </nav>

          {/* Auth Action Buttons (Pill Shapes matching template) */}
          <div
            className="mobile-hide"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/login')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0 18px' }}
            >
              Login
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/register')}
              style={{ borderRadius: 'var(--radius-full)', padding: '0 20px' }}
            >
              Register
            </Button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            className="desktop-hide"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
            }}
          >
            {mobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile Navigation"
            style={{
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid var(--color-border)',
              padding: '16px 20px 24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
          >
            <button
              onClick={() => scrollToSection('how-it-works')}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                padding: '8px 0',
              }}
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                padding: '8px 0',
              }}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('who-its-for')}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                padding: '8px 0',
              }}
            >
              Roles & Accounts
            </button>
            <button
              onClick={() => scrollToSection('safety')}
              style={{
                textAlign: 'left',
                background: 'none',
                border: 'none',
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                padding: '8px 0',
              }}
            >
              First Aid & Safety
            </button>
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <Button
                variant="outline"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Login
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/register');
                }}
              >
                Register
              </Button>
            </div>
          </nav>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, width: '100%' }}>
        {/* 3. Hero Section (matching editorial typography from template) */}
        <section
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '48px 20px 40px 20px',
            boxSizing: 'border-box',
          }}
        >
          {/* Top Outlined Capsule Badge (Like "About Me" in template) */}
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid var(--color-border)',
                backgroundColor: '#FFFFFF',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-success)',
                  display: 'inline-block',
                }}
              />
              Resilient Edge Mesh System · Offline Operations Active
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            {/* Left Column: Big Editorial Headline & Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <h1
                style={{
                  fontSize: 'clamp(32px, 5.5vw, 56px)',
                  fontWeight: 900,
                  lineHeight: 1.08,
                  letterSpacing: '-1.5px',
                  color: 'var(--color-text-primary)',
                  margin: 0,
                }}
              >
                Localizing Lifelines When the Grid Goes Dark.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(16px, 2vw, 19px)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.55,
                  maxWidth: '540px',
                  margin: 0,
                }}
              >
                An offline-first emergency reporting and rescue coordination platform. Citizens submit
                critical SOS beacons over local station Wi-Fi, responders coordinate without the cloud,
                and edge nodes sync when paths return.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                {/* Big Red SOS Button */}
                <motion.div
                  animate={
                    shouldReduceMotion
                      ? {}
                      : {
                          boxShadow: [
                            '0 0 0 0 rgba(220, 38, 38, 0.4)',
                            '0 0 0 14px rgba(220, 38, 38, 0)',
                          ],
                        }
                  }
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  <Button
                    variant="danger"
                    size="lg"
                    onClick={() => navigate('/sos')}
                    style={{
                      borderRadius: 'var(--radius-full)',
                      padding: '0 32px',
                      fontSize: '17px',
                      letterSpacing: '0.2px',
                    }}
                  >
                    <MdEmergency style={{ fontSize: '22px', marginRight: '4px' }} />
                    Send SOS (No Account Needed)
                  </Button>
                </motion.div>

                {/* Secondary Button */}
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => scrollToSection('how-it-works')}
                  style={{
                    borderRadius: 'var(--radius-full)',
                    padding: '0 26px',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  How it works
                </Button>
              </div>

              {/* Emergency Services Honesty Note */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
                <FiAlertTriangle style={{ color: 'var(--color-warning)', flexShrink: 0 }} />
                <span>Prototype application. Does not replace official 911/112 emergency services.</span>
              </div>
            </div>

            {/* Right Column: Hero Vector Illustration */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <img
                  src="/images/flood-rescue.svg"
                  alt="Flood rescue personnel in motorized zodiac boat deploying emergency assistance during cyclonic flooding"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Trust Strip / Technical Stats (Pill Capsule Strip from Template) */}
        <section
          style={{
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            padding: '28px 20px',
            width: '100%',
          }}
        >
          <div
            style={{
              maxWidth: '1240px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-text-muted)' }}>
              Core Engineering Pillars
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              {[
                { label: 'Offline-First Local Operation', icon: <FiWifi /> },
                { label: 'Autonomous Wi-Fi Station Mesh', icon: <FiRadio /> },
                { label: 'Explainable RescueFit Dispatch', icon: <FiShield /> },
                { label: 'Store-and-Forward Inter-Station Sync', icon: <FiRefreshCw /> },
                { label: 'Zero Cloud & Zero WebFont Dependency', icon: <FiCheckCircle /> },
                { label: 'OpenStreetMap Offline Raster Tiles', icon: <FiMapPin /> },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    backgroundColor: 'var(--color-surface-circle)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--color-text-secondary)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <span style={{ color: 'var(--color-primary)', display: 'flex' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works (4 Steps) */}
        <section
          id="how-it-works"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '64px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Operational Workflow
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>
              How Help Coordinates Without Internet
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
              Four deterministic stages connect citizens in distress directly to localized tactical rescue assets.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '24px',
              position: 'relative',
            }}
          >
            {[
              {
                step: '01',
                title: 'Send SOS',
                desc: 'Citizen submits emergency category & coordinates. If completely off-grid, report is safely queued in IndexedDB on device.',
                img: '/images/phone-sos.svg',
                alt: 'Phone sending emergency SOS report',
              },
              {
                step: '02',
                title: 'Station Receives',
                desc: 'Local Wi-Fi node ingests report directly into local station database. Generates backend ticket ID immediately.',
                img: '/images/station-wifi.svg',
                alt: 'Station command post with Wi-Fi antenna',
              },
              {
                step: '03',
                title: 'Team Assigned',
                desc: 'RescueFit ranks available squads by required equipment (boats, cutters) and proximity with 100% human-readable rationale.',
                img: '/images/rescue-team.svg',
                alt: 'Rescue team truck and dispatch matching',
              },
              {
                step: '04',
                title: 'Help Arrives',
                desc: 'Field team acknowledges mission, tracks navigation via offline tiles, and advances status: En Route -> On Site -> Resolved.',
                img: '/images/step-help.svg',
                alt: 'Resolved status checkmark and assisted citizen',
              },
            ].map((s, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-2xl)',
                  padding: '28px',
                  border: '1px solid var(--color-border)',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 800,
                      color: 'var(--color-primary)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    }}
                  >
                    STEP {s.step}
                  </span>
                  <div style={{ width: '48px', height: '48px' }}>
                    <img src={s.img} alt={s.alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                </div>

                <h3 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  {s.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 6. Features Grid */}
        <section
          id="features"
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '64px 20px',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: 'var(--color-primary)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Built for Edge Mesh
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>
                Enterprise Capabilities on a Local Island
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {[
                {
                  icon: <MdEmergency style={{ color: 'var(--color-danger)' }} />,
                  title: 'Zero-Account Offline SOS',
                  desc: 'Distressed citizens submit emergencies instantly with zero sign-in friction. Preserves client state in browser IndexedDB.',
                },
                {
                  icon: <FaAmbulance style={{ color: 'var(--color-primary)' }} />,
                  title: 'Rescue Coordination',
                  desc: 'Tactical field assignments with one-tap Accept/Decline, reason codes, and interactive step progression for field responders.',
                },
                {
                  icon: <FiShield style={{ color: 'var(--color-success)' }} />,
                  title: 'RescueFit Explainability',
                  desc: 'Rules-based scoring engine matching teams by swift-water capabilities, heavy gear, workload, and proximity. Zero black-box AI.',
                },
                {
                  icon: <FiMapPin style={{ color: 'var(--color-primary)' }} />,
                  title: 'Offline Map Tiles',
                  desc: 'Pre-packaged Leaflet raster tiles cached directly on the station node. Overlays active flood hazards and verified shelters.',
                },
                {
                  icon: <FiRefreshCw style={{ color: 'var(--color-warning)' }} />,
                  title: 'Store-and-Forward Mesh Sync',
                  desc: 'Vector clocks and deterministic HMAC event journals sync across isolated stations via physical data mules or intermittent uplinks.',
                },
                {
                  icon: <FiCheckCircle style={{ color: 'var(--color-success)' }} />,
                  title: 'Cryptographic Audit Trail',
                  desc: 'Append-only ledger logging every triage decision, team escalation, and status change with immutable timestamps and signatures.',
                },
              ].map((feat, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--color-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                  >
                    {feat.icon}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
                    {feat.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. "Who It Is For" (Citizens vs Rescue Teams) */}
        <section
          id="who-its-for"
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            padding: '64px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '1.2px',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Audience & Access
            </span>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>
              Tailored Command Portals
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px',
            }}
          >
            {/* Card A: Citizens & Displaced Public */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-2xl)',
                padding: '36px 32px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(220, 38, 38, 0.1)',
                      color: 'var(--color-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    <FiUser />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Citizens & Public</h3>
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                      No verification required to report
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  Submit immediate life-safety reports, track 3-stage dispatch acknowledgment, find nearest
                  safe shelters, and read verified first-aid instructions without cellular towers.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'One-tap emergency beacon with GPS/landmark',
                    'Real-time status tracker (Saved -> Received -> Dispatched)',
                    'Preloaded first-aid guides for trauma & floods',
                  ].map((pt, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      <FiCheckCircle style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                <Button
                  variant="danger"
                  onClick={() => navigate('/sos')}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0 24px' }}
                >
                  Send SOS Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/login?role=citizen')}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Citizen Sign In
                </Button>
              </div>
            </div>

            {/* Card B: Rescue Teams & Command */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-2xl)',
                padding: '36px 32px',
                border: '1px solid var(--color-border)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--color-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                    }}
                  >
                    <FaAmbulance />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Rescue Teams & Command</h3>
                    <span style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: 700 }}>
                      Accredited Responders & Leaders
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  Access assigned tactical missions, acknowledge tasks, execute status transitions, inspect
                  RescueFit queue recommendations, and coordinate multi-station resource allocations.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    'Field responder stepper (En Route -> On Site -> Resolved)',
                    'Station Leader triage queue with RescueFit rankings',
                    'Regional Supervisor multi-station health monitor',
                  ].map((pt, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--color-text-primary)' }}>
                      <FiCheckCircle style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '8px' }}>
                <Button
                  variant="primary"
                  onClick={() => navigate('/login?role=rescue')}
                  style={{ borderRadius: 'var(--radius-full)', padding: '0 24px' }}
                >
                  Responder Login
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/register?role=rescue')}
                  style={{ borderRadius: 'var(--radius-full)' }}
                >
                  Register Station Team
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Safety & First-Aid Section */}
        <section
          id="safety"
          style={{
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid var(--color-border)',
            borderBottom: '1px solid var(--color-border)',
            padding: '64px 20px',
            width: '100%',
          }}
        >
          <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 48px auto' }}>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '1.2px',
                  color: 'var(--color-danger)',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                Civilian Safety Protocols
              </span>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 38px)', fontWeight: 800, letterSpacing: '-0.8px', margin: 0 }}>
                Immediate First-Aid Guidance
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}
            >
              {[
                {
                  title: 'Severe Bleeding & Trauma',
                  badge: 'Critical First Aid',
                  steps: 'Apply direct, firm pressure with a clean cloth. Do not remove soaked dressings; layer more over them. Elevate injured limb above heart level.',
                },
                {
                  title: 'Flash Flood & Water Hazards',
                  badge: 'Flood Survival',
                  steps: 'Never walk or drive into moving water >= 6 inches deep. Stay on highest accessible floor or roof. Avoid contact with floodwater near downed wires.',
                },
                {
                  title: 'Hypothermia & Exposure',
                  badge: 'Exposure Care',
                  steps: 'Strip soaked clothing immediately. Wrap individual in dry thermal foil or wool blankets. Warm core torso first; avoid direct burns.',
                },
              ].map((c, i) => (
                <div
                  key={i}
                  style={{
                    backgroundColor: 'var(--color-surface-subtle)',
                    borderRadius: 'var(--radius-xl)',
                    padding: '24px',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}
                >
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: '#FEE2E2',
                      color: 'var(--color-danger)',
                    }}
                  >
                    {c.badge}
                  </span>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>{c.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                    {c.steps}
                  </p>
                </div>
              ))}
            </div>

            {/* Official Disclaimer Box */}
            <div
              style={{
                marginTop: '40px',
                padding: '20px 24px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <FiAlertTriangle style={{ fontSize: '28px', color: 'var(--color-danger)', flexShrink: 0 }} />
              <div style={{ fontSize: '14px', color: '#991B1B', lineHeight: 1.5 }}>
                <strong>Important Civil Defense Notice:</strong> AmeniEdge is an experimental engineering mesh
                prototype designed for acute telecommunications failure. It does not replace official emergency
                dispatchers, municipal police, or navy coastal rescue authorities.
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--color-border)',
          padding: '48px 20px 32px 20px',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            maxWidth: '1240px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '32px',
            }}
          >
            {/* Brand Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px', fontWeight: 900 }}>
                  Ameni<span style={{ color: 'var(--color-danger)' }}>Edge</span>
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: '#ECFDF5',
                    color: '#047857',
                    border: '1px solid #A7F3D0',
                  }}
                >
                  v1.0 Edge
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                Autonomous offline-first emergency mesh platform. Designed for local station triage and
                resilient field rescue when cloud infrastructure goes dark.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Portals</span>
                <button
                  onClick={() => navigate('/sos')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  Citizen SOS Portal
                </button>
                <button
                  onClick={() => navigate('/login?role=rescue')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  Rescue Team
                </button>
                <button
                  onClick={() => navigate('/login?role=leader')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  Station Leader
                </button>
                <button
                  onClick={() => navigate('/login?role=supervisor')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  District Supervisor
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Mesh Resources</span>
                <button
                  onClick={() => scrollToSection('safety')}
                  style={{ background: 'none', border: 'none', textAlign: 'left', fontSize: '13px', color: 'var(--color-text-secondary)', cursor: 'pointer' }}
                >
                  First Aid Protocols
                </button>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>VHF Channel 16 (Marine)</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>SSID: AmeniEdge-Station-North</span>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Attribution */}
          <div
            style={{
              borderTop: '1px solid var(--color-border)',
              paddingTop: '20px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
            }}
          >
            <span>© 2026 AmeniEdge Mesh Project. Open prototype for disaster response engineering.</span>
            <span>Map data © OpenStreetMap contributors, served from local station raster tile cache.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
