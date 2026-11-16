import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { FaWater, FaBandAid, FaHeartbeat, FaFire } from 'react-icons/fa';

export const FirstAidGuidesView: React.FC = () => {
  const [activeGuide, setActiveGuide] = useState<string>('FLOOD');

  const guides = [
    {
      id: 'FLOOD',
      icon: <FaWater style={{ color: '#38BDF8' }} aria-hidden="true" />,
      title: 'Flood Survival & Water Safety',
      shortTitle: 'Flood Survival',
      steps: [
        'Do NOT walk or drive through flowing water. Just 15 cm of moving water can knock an adult down.',
        'If trapped inside a building, move to the highest level. Do NOT climb into a closed attic where rising water can trap you; ensure roof access.',
        'Never touch downed power lines or submerged electrical appliances.',
        'Turn off the main electrical breaker and gas valve before water enters living quarters.',
      ],
    },
    {
      id: 'BLEEDING',
      icon: <FaBandAid style={{ color: '#EF4444' }} aria-hidden="true" />,
      title: 'Severe Bleeding & Hemorrhage Control',
      shortTitle: 'Bleeding Control',
      steps: [
        'Apply firm, continuous direct pressure with a clean cloth or sterile dressing directly over the wound.',
        'Do NOT remove the original cloth if blood soaks through; add more layers on top.',
        'If life-threatening limb bleeding continues, apply a tourniquet 5–7 cm above the wound (never over a joint). Tighten until bleeding stops.',
        'Record the exact time the tourniquet was applied on the casualty forehead with marker (e.g., T-14:35).',
      ],
    },
    {
      id: 'CPR',
      icon: <FaHeartbeat style={{ color: '#F43F5E' }} aria-hidden="true" />,
      title: 'CPR for Unresponsive Casualty',
      shortTitle: 'CPR Protocol',
      steps: [
        'Check for responsiveness: tap shoulders and shout loudly.',
        'Check for normal breathing (no more than 10 seconds).',
        'If not breathing: Place hands in center of chest and compress at 100–120 beats per minute, pressing down at least 5 cm.',
        'Allow full chest recoil between compressions. Continue without stopping until rescue personnel arrive.',
      ],
    },
    {
      id: 'BURNS',
      icon: <FaFire style={{ color: '#F97316' }} aria-hidden="true" />,
      title: 'Burn Care & Smoke Inhalation',
      shortTitle: 'Burn Care',
      steps: [
        'Cool the burn under clean, cool running water for at least 10–20 minutes. Do NOT apply ice or butter.',
        'Remove constricting jewelry, belts, or rings before swelling starts.',
        'Cover the burn loosely with a clean, dry, non-adherent dressing or clean plastic wrap.',
        'Keep the victim warm with dry blankets to prevent shock and hypothermia.',
      ],
    },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxWidth: '540px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        overflowY: 'auto',
        padding: '16px',
        gap: '16px',
      }}
    >
      <div>
        <h1 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Offline First-Aid & Civil Defense Library</h1>
        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
          Pre-cached medical guides accessible without internet or station connectivity
        </p>
      </div>

      {/* Guide Category Selection */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {guides.map((g) => (
          <button
            key={g.id}
            onClick={() => setActiveGuide(g.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              backgroundColor: activeGuide === g.id ? 'var(--color-info)' : 'var(--color-surface-subtle)',
              color: activeGuide === g.id ? '#ffffff' : 'var(--color-text-primary)',
              border: '1px solid var(--color-border)',
              cursor: 'pointer',
            }}
          >
            {g.icon}
            <span>{g.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Active Guide Content */}
      {(() => {
        const guide = guides.find((g) => g.id === activeGuide) || guides[0];
        return (
          <Card style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {guide.icon}
              <span>{guide.title}</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {guide.steps.map((st, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--color-info-bg)',
                      color: 'var(--color-info)',
                      fontWeight: 800,
                      fontSize: 'var(--font-size-xs)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.5 }}>{st}</span>
                </div>
              ))}
            </div>
          </Card>
        );
      })()}

      {/* Emergency Radio Frequency Directory */}
      <Card variant="subtle" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <h3 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Emergency Radio Mesh Frequencies</h3>
        <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div><strong>Station North Command:</strong> VHF 156.700 MHz (Channel 14)</div>
          <div><strong>Station South Command:</strong> VHF 156.800 MHz (Channel 16 - Calling)</div>
          <div><strong>Amateur Ham Relay:</strong> 145.500 MHz (FM Simplex)</div>
        </div>
      </Card>
    </div>
  );
};

