import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProgressTracker } from '../components/ui/ProgressTracker';

describe('ProgressTracker Component', () => {
  it('renders all 7 lifecycle steps of rescue coordination', () => {
    render(<ProgressTracker reportId="RSC-1001" createdAt={Date.now()} />);

    expect(screen.getByText('1. Saved on this device')).toBeInTheDocument();
    expect(screen.getByText('2. Received by station')).toBeInTheDocument();
    expect(screen.getByText('3. Waiting for a rescue team')).toBeInTheDocument();
    expect(screen.getByText(/5\. Team on the way/)).toBeInTheDocument();
    expect(screen.getByText('6. Team on site / Rescue in progress')).toBeInTheDocument();
    expect(screen.getByText('7. Completed')).toBeInTheDocument();
    expect(screen.getByText('#RSC-1001')).toBeInTheDocument();
  });

  it('keeps step 4-7 uncompleted and shows waiting for fresh intake', () => {
    render(
      <ProgressTracker
        reportId="RSC-1002"
        initialTracker={{
          incidentId: 'INC-1002',
          deliveryState: 'RECEIVED_BY_STATION',
          assignmentState: 'OFFERED',
          missionState: 'WAITING',
          syncState: 'SYNCED',
          savedAt: new Date().toISOString(),
          receivedAt: new Date().toISOString(),
          departmentName: 'Flood Rescue Department',
          stationName: 'South Station Base',
        }}
      />
    );

    expect(screen.getByText('1. Saved on this device')).toBeInTheDocument();
    expect(screen.getByText('2. Received by station')).toBeInTheDocument();
    expect(screen.getByText('3. Waiting for a rescue team')).toBeInTheDocument();
    expect(screen.getByText(/Alert routed to Flood Rescue Department at South Station Base/)).toBeInTheDocument();
  });

  it('reflects decline reason and reassigning status', () => {
    render(
      <ProgressTracker
        reportId="RSC-1003"
        initialTracker={{
          incidentId: 'INC-1003',
          deliveryState: 'RECEIVED_BY_STATION',
          assignmentState: 'DECLINED',
          missionState: 'WAITING',
          declineReason: 'All boats deployed in Sector 4',
          reassigning: true,
        }}
      />
    );

    expect(screen.getByText(/Declined: All boats deployed in Sector 4/)).toBeInTheDocument();
  });
});
