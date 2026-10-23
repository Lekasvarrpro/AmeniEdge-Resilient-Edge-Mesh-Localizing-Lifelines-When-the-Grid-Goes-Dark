import React, { useState, useRef, useEffect } from 'react';

export interface SOSButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
}

export const SOSButton: React.FC<SOSButtonProps> = ({ onTrigger, disabled = false }) => {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const pressTimer = useRef<number | null>(null);
  const progressInterval = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const HOLD_DURATION = 1500; // 1.5 seconds hold to confirm

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 150]);
    }
  };

  const startPress = () => {
    if (disabled) return;
    setIsPressing(true);
    setProgress(0);
    startTime.current = Date.now();

    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    progressInterval.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const pct = Math.min(100, (elapsed / HOLD_DURATION) * 100);
      setProgress(pct);

      if (pct >= 100) {
        completeHold();
      }
    }, 20);
  };

  const cancelPress = () => {
    if (!isPressing) return;
    setIsPressing(false);
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const completeHold = () => {
    cancelPress();
    triggerHaptic();
    onTrigger();
  };

  useEffect(() => {
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
      if (pressTimer.current) clearTimeout(pressTimer.current);
    };
  }, []);

  const size = 'min(50vw, 200px)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Send Emergency SOS: Press and hold for 1.5 seconds to confirm"
        onMouseDown={startPress}
        onMouseUp={cancelPress}
        onMouseLeave={cancelPress}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            completeHold();
          }
        }}
        style={{
          position: 'relative',
          width: size,
          height: size,
          minWidth: '160px',
          minHeight: '160px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: isPressing ? 'var(--color-danger-hover)' : 'var(--color-danger)',
          color: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isPressing
            ? '0 0 0 10px rgba(217, 45, 32, 0.4), var(--shadow-lg)'
            : '0 0 0 6px rgba(217, 45, 32, 0.2), var(--shadow-lg)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          transform: isPressing ? 'scale(0.96)' : 'scale(1)',
          transition: 'transform 0.1s ease, box-shadow 0.15s ease',
          outline: 'none',
        }}
      >
        {/* Radial Progress Ring SVG */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            transform: 'rotate(-90deg)',
            pointerEvents: 'none',
          }}
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="transparent"
            stroke="#ffffff"
            strokeWidth="6"
            strokeDasharray="289"
            strokeDashoffset={289 - (289 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>

        <span
          style={{
            fontSize: 'var(--font-size-sos)',
            fontWeight: 900,
            letterSpacing: '2px',
            lineHeight: 1,
          }}
        >
          SOS
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginTop: '4px',
            opacity: 0.9,
          }}
        >
          {isPressing ? 'HOLD...' : 'PRESS & HOLD'}
        </span>
      </div>

      <div
        style={{
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          fontWeight: 500,
        }}
      >
        <span>Hold 1.5s to confirm · Works 100% offline</span>
      </div>
    </div>
  );
};
