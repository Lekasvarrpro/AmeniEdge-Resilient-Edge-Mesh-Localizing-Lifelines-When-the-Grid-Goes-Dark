import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { NumberStepper } from '../../components/ui/NumberStepper';
import { Toggle } from '../../components/ui/Toggle';
import { outboxSync } from '../../lib/offline/outbox';
import type { LocalReport } from '../../lib/db/index';

export interface SOSWizardViewProps {
  initialCategory?: string;
  onCancel: () => void;
  onComplete: (report: LocalReport) => void;
}

export const SOSWizardView: React.FC<SOSWizardViewProps> = ({
  initialCategory = 'FLOOD',
  onCancel,
  onComplete,
}) => {
  const [step, setStep] = useState<number>(1); // 1 to 4
  const [category, setCategory] = useState<string>(initialCategory);
  const [affectedPeople, setAffectedPeople] = useState<number>(2);
  const [hasImmediateDanger, setHasImmediateDanger] = useState<boolean>(true);
  const [latitude, setLatitude] = useState<number>(13.0827);
  const [longitude, setLongitude] = useState<number>(80.2707);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [locationLandmark, setLocationLandmark] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [contactName, setContactName] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Attempt auto GPS acquisition on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setGpsAccuracy(Math.round(pos.coords.accuracy));
        },
        () => {
          // Permission denied or timeout: kindly keep default coordinates
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress client-side to max 600px width
        const canvas = document.createElement('canvas');
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, w, h);
        const compressed = canvas.toDataURL('image/jpeg', 0.6);
        setPhotoDataUrl(compressed);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const createdReport = await outboxSync.enqueueIncident({
        category,
        affectedPeople,
        latitude,
        longitude,
        locationLandmark: locationLandmark || 'Near default station coordinates',
        details: details + (photoDataUrl ? ' [Photo Evidence Attached]' : ''),
        contactName,
        contactPhone,
        hasImmediateDanger,
      });
      onComplete(createdReport);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      }}
    >
      {/* Wizard Header Stepper */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          ✕ Cancel
        </button>
        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
          Step {step} of 4: {step === 1 ? 'Category' : step === 2 ? 'Victims' : step === 3 ? 'Location' : 'Review'}
        </span>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 700,
            color: 'var(--color-danger)',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          Send Now
        </button>
      </div>

      {/* Wizard Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Select Emergency Category</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[
                { id: 'FLOOD', label: 'Flood / Water', icon: '🌊' },
                { id: 'MEDICAL', label: 'Medical Emergency', icon: '🚑' },
                { id: 'FIRE', label: 'Fire Outbreak', icon: '🔥' },
                { id: 'TRAPPED', label: 'Trapped Casualties', icon: '🏚️' },
                { id: 'STRUCTURAL_COLLAPSE', label: 'Building Collapse', icon: '🏗️' },
                { id: 'OTHER', label: 'Other Hazard', icon: '⚠️' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  style={{
                    minHeight: '64px',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: category === c.id ? 'var(--color-danger-bg)' : 'var(--color-surface)',
                    color: category === c.id ? 'var(--color-danger)' : 'var(--color-text-primary)',
                    border: category === c.id ? '2px solid var(--color-danger)' : '1px solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: category === c.id ? 700 : 500,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{c.icon}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>People Affected & Urgency</h2>
            <NumberStepper
              label="Number of people requiring assistance:"
              value={affectedPeople}
              min={1}
              max={100}
              onChange={setAffectedPeople}
            />

            <Card variant={hasImmediateDanger ? 'urgent' : 'default'}>
              <Toggle
                label="Immediate Threat to Life"
                description="Water rising rapidly, building collapsing, severe bleeding"
                checked={hasImmediateDanger}
                onChange={setHasImmediateDanger}
              />
            </Card>

            <Input
              label="Contact Name (Optional)"
              placeholder="Your name or landmark reference"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
            />

            <Input
              label="Contact Phone / Radio (Optional)"
              placeholder="+91-XXXXX-XXXXX or VHF channel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Location Information</h2>

            <Card variant="subtle">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
                  GPS Coordinates:
                </span>
                <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: gpsAccuracy ? 'var(--color-success)' : 'var(--color-text-secondary)' }}>
                  {gpsAccuracy ? `Accuracy: +/- ${gpsAccuracy} meters` : 'Default station center (GPS offline)'}
                </span>
              </div>
            </Card>

            <Input
              label="Landmark / Floor / Specific Location"
              placeholder="e.g. 2nd floor balcony, opposite school water tank"
              value={locationLandmark}
              onChange={(e) => setLocationLandmark(e.target.value)}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                Emergency Situation Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Describe injuries, water level, hazards..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                style={{
                  padding: '10px 14px',
                  fontSize: 'var(--font-size-base)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>Review & Submit SOS</h2>

            <Card variant="urgent">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Category:</strong> {category}</div>
                <div><strong>Victims:</strong> {affectedPeople} people</div>
                <div><strong>Urgency:</strong> {hasImmediateDanger ? 'CRITICAL (Immediate Danger)' : 'Standard Urgency'}</div>
                <div><strong>Location:</strong> {locationLandmark || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}</div>
              </div>
            </Card>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                Attach Photo Evidence (Optional, compressed for edge sync):
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                style={{ fontSize: 'var(--font-size-sm)' }}
              />
              {photoDataUrl && (
                <div style={{ marginTop: '8px' }}>
                  <img
                    src={photoDataUrl}
                    alt="Uploaded Evidence"
                    style={{ maxHeight: '140px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom Navigation in Thumb Zone */}
      <div
        style={{
          padding: '16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '12px',
          backgroundColor: 'var(--color-surface)',
        }}
      >
        {step > 1 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setStep(step - 1)}
            style={{ flex: 1 }}
          >
            Back
          </Button>
        )}

        {step < 4 ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => setStep(step + 1)}
            style={{ flex: 2 }}
          >
            Next Step →
          </Button>
        ) : (
          <Button
            variant="danger"
            size="lg"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            style={{ flex: 2 }}
          >
            🚨 SEND SOS NOW
          </Button>
        )}
      </div>
    </div>
  );
};
