import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'urgent';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  style,
  ...props
}) => {
  let bg = 'var(--color-surface)';
  let border = '1px solid var(--color-border)';

  if (variant === 'subtle') {
    bg = 'var(--color-surface-subtle)';
  } else if (variant === 'urgent') {
    bg = 'var(--color-danger-bg)';
    border = '2px solid var(--color-danger)';
  }

  return (
    <div
      style={{
        backgroundColor: bg,
        border,
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: 'var(--shadow-sm)',
        transition: 'box-shadow var(--transition-fast), transform var(--transition-fast)',
        cursor: interactive ? 'pointer' : 'default',
        boxSizing: 'border-box',
        ...style,
      }}
      className={`card ${interactive ? 'card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
