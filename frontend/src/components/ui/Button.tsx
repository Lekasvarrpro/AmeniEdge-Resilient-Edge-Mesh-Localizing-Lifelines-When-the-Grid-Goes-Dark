import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'urgent' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      icon,
      disabled,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    let bg = 'var(--color-primary-gradient)';
    let color = '#FFFFFF';
    let border = '1px solid rgba(255, 255, 255, 0.15)';
    let boxShadow = 'var(--shadow-sm)';

    if (variant === 'danger' || variant === 'urgent') {
      bg = 'var(--color-danger-gradient)';
      color = '#FFFFFF';
      border = '1px solid rgba(255, 255, 255, 0.2)';
      boxShadow = 'var(--shadow-sos)';
    } else if (variant === 'secondary') {
      bg = 'var(--color-surface-circle)';
      color = 'var(--color-text-primary)';
      border = '1px solid var(--color-border)';
      boxShadow = 'var(--shadow-sm)';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      color = 'var(--color-text-primary)';
      border = 'none';
      boxShadow = 'none';
    } else if (variant === 'outline') {
      bg = 'transparent';
      color = 'var(--color-text-primary)';
      border = '1px solid var(--color-border-active)';
      boxShadow = 'none';
    }

    let minHeight = '48px';
    let padding = '0 20px';
    let fontSize = 'var(--font-size-base)';

    if (size === 'sm') {
      minHeight = '40px';
      padding = '0 14px';
      fontSize = 'var(--font-size-sm)';
    } else if (size === 'lg') {
      minHeight = '56px';
      padding = '0 28px';
      fontSize = 'var(--font-size-md)';
    }

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? undefined : { y: -2, filter: 'brightness(1.05)' }}
        whileTap={disabled || isLoading ? undefined : { scale: 0.97 }}
        disabled={disabled || isLoading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          minHeight,
          padding,
          fontSize,
          fontWeight: 700,
          borderRadius: 'var(--radius-lg)',
          background: bg,
          color,
          border,
          boxShadow,
          cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
          opacity: disabled || isLoading ? 0.6 : 1,
          width: fullWidth ? '100%' : 'auto',
          userSelect: 'none',
          touchAction: 'manipulation',
          transition: 'box-shadow var(--transition-fast), background var(--transition-fast)',
          ...style,
        }}
        className={className}
        {...props}
      >
        {isLoading ? (
          <span
            style={{
              width: '18px',
              height: '18px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: '#ffffff',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.8s linear infinite',
            }}
          />
        ) : (
          icon
        )}
        <span>{children}</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
