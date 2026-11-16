import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'urgent' | 'subtle';
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
  let background = 'var(--color-surface)';
  let border = '1px solid var(--color-border)';
  let color = 'var(--color-text-primary)';
  let boxShadow = 'var(--shadow-md)';

  if (variant === 'primary') {
    background = 'var(--color-primary-gradient)';
    border = '1px solid rgba(255, 255, 255, 0.2)';
    color = '#FFFFFF';
    boxShadow = '0 16px 36px -4px rgba(32, 113, 243, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
  } else if (variant === 'danger' || variant === 'urgent') {
    background = 'var(--color-danger-gradient)';
    border = '1px solid rgba(255, 255, 255, 0.2)';
    color = '#FFFFFF';
    boxShadow = '0 16px 36px -4px rgba(240, 68, 35, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.25)';
  } else if (variant === 'subtle') {
    background = 'var(--color-surface-subtle)';
    border = '1px solid var(--color-border-subtle)';
    boxShadow = 'none';
  }

  return (
    <motion.div
      whileHover={interactive ? { y: -4, boxShadow: 'var(--shadow-lg)' } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      style={{
        background,
        color,
        border,
        borderRadius: 'var(--radius-2xl)',
        padding: '24px',
        boxShadow,
        position: 'relative',
        overflow: 'hidden',
        boxSizing: 'border-box',
        cursor: interactive ? 'pointer' : 'default',
        transition: 'border-color var(--transition-fast), background var(--transition-fast)',
        ...style,
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
