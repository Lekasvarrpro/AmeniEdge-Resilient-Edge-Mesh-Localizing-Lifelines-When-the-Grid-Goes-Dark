import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  isOpen: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  isOpen,
  onClose,
}) => {
  let icon = <FiInfo />;
  let border = 'var(--color-primary-border)';
  let color = 'var(--color-primary)';
  let bg = '#16181F';

  if (type === 'success') {
    icon = <FiCheckCircle />;
    border = 'var(--color-success-border)';
    color = 'var(--color-success)';
  } else if (type === 'error') {
    icon = <FiAlertTriangle />;
    border = 'var(--color-danger-border)';
    color = 'var(--color-danger)';
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            minWidth: '280px',
            maxWidth: '90vw',
            backgroundColor: bg,
            border: `1px solid ${border}`,
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color, fontSize: '20px' }}>{icon}</span>
            <span>{message}</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close notification"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <FiX />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

