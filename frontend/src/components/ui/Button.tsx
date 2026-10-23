import React, { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'sos';
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
    // Determine colors based on design tokens
    let bg = 'var(--color-info)';
    let text = 'var(--color-text-inverse)';
    let border = 'none';

    if (variant === 'primary') {
      bg = 'var(--color-info)';
      text = '#ffffff';
    } else if (variant === 'danger') {
      bg = 'var(--color-danger)';
      text = '#ffffff';
    } else if (variant === 'secondary') {
      bg = 'var(--color-surface-subtle)';
      text = 'var(--color-text-primary)';
      border = '1px solid var(--color-border)';
    } else if (variant === 'ghost') {
      bg = 'transparent';
      text = 'var(--color-text-primary)';
    } else if (variant === 'outline') {
      bg = 'transparent';
      text = 'var(--color-text-primary)';
      border = '2px solid var(--color-border)';
    }

    // Determine padding and height for touch targets (min 48px for md/lg)
    let minHeight = '48px';
    let padding = '0 16px';
    let fontSize = 'var(--font-size-base)';

    if (size === 'sm') {
      minHeight = '36px';
      padding = '0 12px';
      fontSize = 'var(--font-size-sm)';
    } else if (size === 'lg') {
      minHeight = '56px';
      padding = '0 24px';
      fontSize = 'var(--font-size-md)';
    }

    const buttonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      minHeight,
      minWidth: size === 'sm' ? '36px' : '48px',
      padding,
      fontSize,
      fontWeight: 600,
      borderRadius: 'var(--radius-md)',
      backgroundColor: bg,
      color: text,
      border,
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.6 : 1,
      width: fullWidth ? '100%' : 'auto',
      userSelect: 'none',
      transition: 'background-color var(--transition-fast), transform var(--transition-fast)',
      touchAction: 'manipulation',
      ...style,
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        style={buttonStyle}
        className={`btn-${variant} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>[o]</span>
        ) : (
          icon
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
