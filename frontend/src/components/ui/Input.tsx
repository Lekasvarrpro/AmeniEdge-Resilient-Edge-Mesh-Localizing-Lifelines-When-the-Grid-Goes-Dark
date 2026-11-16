import React, { forwardRef, useState } from 'react';
import { FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, type = 'text', id, style, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{label}</span>
          {error && (
            <span
              style={{
                color: 'var(--color-danger)',
                fontSize: 'var(--font-size-xs)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
              }}
            >
              <FiAlertTriangle aria-hidden="true" />
              <span>{error}</span>
            </span>
          )}
        </label>

        <motion.div
          animate={error ? { x: [-4, 4, -3, 3, 0] } : {}}
          transition={{ duration: 0.3 }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {icon && (
            <div
              style={{
                position: 'absolute',
                left: '16px',
                color: error ? 'var(--color-danger)' : 'var(--color-text-muted)',
                fontSize: '18px',
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={inputType}
            aria-invalid={!!error}
            style={{
              width: '100%',
              minHeight: '48px',
              padding: `12px 16px 12px ${icon ? '46px' : '16px'}`,
              paddingRight: isPassword ? '48px' : '16px',
              fontSize: 'var(--font-size-base)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: '#FFFFFF',
              border: error
                ? '1px solid var(--color-danger)'
                : '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              boxShadow: error ? '0 0 0 3px rgba(220, 38, 38, 0.15)' : 'none',
              outline: 'none',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              boxSizing: 'border-box',
              ...style,
            }}
            onFocus={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
              }
            }}
            onBlur={(e) => {
              if (!error) {
                e.currentTarget.style.borderColor = 'var(--color-border)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          )}
        </motion.div>

        {helperText && !error && (
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
