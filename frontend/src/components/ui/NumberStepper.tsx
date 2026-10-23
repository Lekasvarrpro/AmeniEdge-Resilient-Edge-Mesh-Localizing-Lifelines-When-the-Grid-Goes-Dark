import React from 'react';

export interface NumberStepperProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
}

export const NumberStepper: React.FC<NumberStepperProps> = ({
  label,
  value,
  min = 0,
  max = 999,
  onChange,
}) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {label && (
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {label}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          type="button"
          onClick={handleDecrement}
          disabled={value <= min}
          aria-label="Decrease quantity"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '24px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            opacity: value <= min ? 0.4 : 1,
            touchAction: 'manipulation',
          }}
        >
          −
        </button>

        <span
          style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 800,
            color: 'var(--color-text-primary)',
            minWidth: '48px',
            textAlign: 'center',
          }}
        >
          {value}
        </span>

        <button
          type="button"
          onClick={handleIncrement}
          disabled={value >= max}
          aria-label="Increase quantity"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-primary)',
            fontSize: '24px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            opacity: value >= max ? 0.4 : 1,
            touchAction: 'manipulation',
          }}
        >
          +
        </button>
      </div>
    </div>
  );
};
