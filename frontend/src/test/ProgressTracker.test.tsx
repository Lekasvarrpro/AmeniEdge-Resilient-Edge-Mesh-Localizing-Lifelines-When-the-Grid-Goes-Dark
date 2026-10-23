import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../components/ui/ProgressTracker';

describe('ProgressTracker Component', () => {
  it('renders all three stages of delivery verification', () => {
    render(<ProgressTracker currentStage="SAVED_LOCAL" reportId="RSC-1001" />);

    expect(screen.getByText('1. Saved on Device')).toBeInTheDocument();
    expect(screen.getByText('2. Received by Station')).toBeInTheDocument();
    expect(screen.getByText('3. Acknowledged by Responder')).toBeInTheDocument();
    expect(screen.getByText('#RSC-1001')).toBeInTheDocument();
  });

  it('displays confirmed checkmarks for completed stages', () => {
    render(
      <ProgressTracker
        currentStage="RECEIVED_STATION"
        reportId="RSC-1002"
        syncedAt={Date.now()}
      />
    );

    expect(screen.getByText('2. Received by Station')).toBeInTheDocument();
  });
});
