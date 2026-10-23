import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { SOSButton } from '../../components/ui/SOSButton';
import { Card } from '../../components/ui/Card';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { ProgressTracker } from '../../components/ui/ProgressTracker';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { Toggle } from '../../components/ui/Toggle';
import { Input } from '../../components/ui/Input';

export const ComponentCatalogView: React.FC = () => {
  const [stepperVal, setStepperVal] = useState(3);
  const [toggleVal, setToggleVal] = useState(true);
  const [testStage, setTestStage] = useState<'SAVED_LOCAL' | 'RECEIVED_STATION' | 'ACKNOWLEDGED_RESPONDER'>('RECEIVED_STATION');

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '20px 16px',
        gap: '24px',
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div>
        <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
          AmeniEdge UI Design System Component Catalog
        </h1>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
          Production-grade mobile-first emergency primitives conforming to WCAG 2.1 AA and zero-webfont offline performance budgets.
        </p>
      </div>

      {/* 1. SOS Button Prototype */}
      <Card>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px' }}>
          1. Emergency SOS Circular Trigger (&ge; 160px Touch Zone with Hold Progress Ring)
        </h3>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px' }}>
          <SOSButton onTrigger={() => alert('SOS Trigger Confirmed!')} />
        </div>
      </Card>

      {/* 2. 3-Stage Delivery Progress Tracker */}
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
            2. Three-Stage Delivery Progress Tracker
          </h3>
          <div style={{ display: 'flex', gap: '4px' }}>
            {(['SAVED_LOCAL', 'RECEIVED_STATION', 'ACKNOWLEDGED_RESPONDER'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setTestStage(st)}
                style={{
                  fontSize: '10px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: testStage === st ? 'var(--color-info)' : 'var(--color-surface-subtle)',
                  color: testStage === st ? '#ffffff' : 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                  cursor: 'pointer',
                }}
              >
                {st.split('_')[0]}
              </button>
            ))}
          </div>
        </div>
        <ProgressTracker
          currentStage={testStage}
          reportId="RSC-98214"
          createdAt={Date.now() - 120000}
          syncedAt={testStage !== 'SAVED_LOCAL' ? Date.now() - 60000 : undefined}
          serverStatus={testStage === 'ACKNOWLEDGED_RESPONDER' ? 'ASSIGNED' : 'RECEIVED'}
          assignedTeamName={testStage === 'ACKNOWLEDGED_RESPONDER' ? 'Swift Water Alpha' : undefined}
        />
      </Card>

      {/* 3. Button Primitives */}
      <Card>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px' }}>
          3. Button Variants & Touch Targets (Min 48px Height)
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <Button variant="primary">Primary Action</Button>
          <Button variant="danger">Emergency Danger</Button>
          <Button variant="secondary">Secondary Outline</Button>
          <Button variant="ghost">Ghost Action</Button>
          <Button variant="primary" isLoading>Loading State</Button>
        </div>
      </Card>

      {/* 4. Badges (Never Color Alone) */}
      <Card>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px' }}>
          4. Semantic Badges (Color + Icon + Text Label Pairing)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <PriorityBadge priority="P1_CRITICAL" />
            <PriorityBadge priority="P2_URGENT" />
            <PriorityBadge priority="P3_ROUTINE" />
            <PriorityBadge priority="P4_MONITORING" />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <StatusBadge status="RECEIVED" />
            <StatusBadge status="TRIAGED" />
            <StatusBadge status="ASSIGNED" />
            <StatusBadge status="ACCEPTED" />
            <StatusBadge status="EN_ROUTE" />
            <StatusBadge status="ON_SITE" />
            <StatusBadge status="RESOLVED" />
            <StatusBadge status="AVAILABLE" />
            <StatusBadge status="BUSY" />
          </div>
        </div>
      </Card>

      {/* 5. Accessible Controls */}
      <Card>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '12px' }}>
          5. Accessible Touch Controls & Form Primitives
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <NumberStepper
            label="Casualty Counter Stepper (Large Touch Buttons):"
            value={stepperVal}
            onChange={setStepperVal}
          />
          <Toggle
            label="High-Urgency Threat Toggle"
            description="Toggle switches color, position, and role='switch' ARIA attributes"
            checked={toggleVal}
            onChange={setToggleVal}
          />
          <Input
            label="Accessible Form Input (>= 16px to prevent iOS viewport zoom)"
            placeholder="Type landmark or coordinates..."
          />
        </div>
      </Card>
    </div>
  );
};
