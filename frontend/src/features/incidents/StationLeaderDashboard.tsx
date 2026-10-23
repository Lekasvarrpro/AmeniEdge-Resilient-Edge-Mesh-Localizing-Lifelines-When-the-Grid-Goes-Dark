import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge, PriorityBadge } from '../../components/ui/StatusBadge';
import { BottomSheet } from '../../components/ui/BottomSheet';
import { api } from '../../lib/api/client';

export const StationLeaderDashboard: React.FC = () => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 8000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await api.get<any[]>('/incidents?station_id=STA-CHN-N-001');
      if (Array.isArray(data)) {
        setIncidents(data);
        if (!selectedIncident && data.length > 0) {
          selectIncident(data[0]);
        }
      }
    } catch {}
  };

  const selectIncident = async (inc: any) => {
    setSelectedIncident(inc);
    setIsLoadingRecs(true);
    try {
      const recData = await api.get<any>(`/incidents/${inc.id}/recommendations`);
      setRecommendations(recData);
    } catch {
      setRecommendations(null);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleAssignTeam = async (teamId: string) => {
    if (!selectedIncident) return;
    setIsAssigning(true);
    try {
      await api.post(`/incidents/${selectedIncident.id}/assignments`, {
        teamId,
        notes: 'Dispatched via Station Leader RescueFit approval',
      });
      alert(`Team ${teamId} dispatched successfully to ${selectedIncident.id}`);
      fetchIncidents();
      selectIncident(selectedIncident);
    } catch (err: any) {
      alert(err.message || 'Error assigning team');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = incidents.filter((inc) => {
    if (filterPriority === 'ALL') return true;
    return inc.priority === filterPriority;
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Station Leader Top KPI Strip */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div>
          <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800 }}>Station North Command Console</h2>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
            Node ID: STA-CHN-N-001 · Mode: Autonomous Island · Active Teams: 3
          </span>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          {['ALL', 'P1_CRITICAL', 'P2_URGENT'].map((pri) => (
            <button
              key={pri}
              onClick={() => setFilterPriority(pri)}
              style={{
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                backgroundColor: filterPriority === pri ? 'var(--color-text-primary)' : 'var(--color-surface)',
                color: filterPriority === pri ? 'var(--color-text-inverse)' : 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
              }}
            >
              {pri === 'ALL' ? 'All Incidents' : pri === 'P1_CRITICAL' ? 'Critical (P1)' : 'Urgent (P2)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Command Body: Responsive Split Layout */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          flexDirection: 'row',
        }}
      >
        {/* Left Pane: Prioritized Incident Queue */}
        <div
          style={{
            flex: 1,
            minWidth: '320px',
            maxWidth: '480px',
            borderRight: '1px solid var(--color-border)',
            overflowY: 'auto',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-text-secondary)' }}>
              Triage Queue ({filtered.length})
            </span>
            <button
              onClick={fetchIncidents}
              style={{ background: 'none', border: 'none', fontSize: '14px', cursor: 'pointer' }}
            >
              🔄
            </button>
          </div>

          {filtered.map((inc) => {
            const isSelected = selectedIncident?.id === inc.id;
            return (
              <Card
                key={inc.id}
                interactive
                variant={inc.priority === 'P1_CRITICAL' && inc.status === 'RECEIVED' ? 'urgent' : 'default'}
                onClick={() => selectIncident(inc)}
                style={{
                  border: isSelected ? '2px solid var(--color-info)' : undefined,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>
                    {inc.id}: {inc.category}
                  </span>
                  <PriorityBadge priority={inc.priority} />
                </div>

                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                  📍 {inc.locationLandmark || `${inc.latitude?.toFixed(4)}, ${inc.longitude?.toFixed(4)}`}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    Victims: {inc.affectedPeople || inc.affected_people}
                  </span>
                  <StatusBadge status={inc.status} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Right Pane: Incident Details & RescueFit Recommendation Drawer */}
        <div
          style={{
            flex: 2,
            overflowY: 'auto',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {selectedIncident ? (
            <>
              {/* Incident Header Info */}
              <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>
                      {selectedIncident.id} — {selectedIncident.category}
                    </h2>
                    <p style={{ fontSize: 'var(--font-size-sm)', marginTop: '4px', color: 'var(--color-text-secondary)' }}>
                      📍 {selectedIncident.locationLandmark}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <PriorityBadge priority={selectedIncident.priority} />
                    <StatusBadge status={selectedIncident.status} />
                  </div>
                </div>

                <p style={{ marginTop: '12px', fontSize: 'var(--font-size-sm)' }}>
                  {selectedIncident.details || 'No additional details logged by citizen.'}
                </p>

                <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                  <span>Affected: <strong>{selectedIncident.affectedPeople || selectedIncident.affected_people} persons</strong></span>
                  <span>Contact: <strong>{selectedIncident.contactName || 'Anonymous'}</strong> ({selectedIncident.contactPhone || 'N/A'})</span>
                  {selectedIncident.assignedTeamId && (
                    <span>Assigned Team: <strong>{selectedIncident.assignedTeamId}</strong></span>
                  )}
                </div>
              </Card>

              {/* RescueFit Explainable Recommendation Engine Panel */}
              <div
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '2px solid var(--color-info)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>⚡</span>
                    <div>
                      <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--color-info)' }}>
                        RescueFit Dispatch Intelligence
                      </h3>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                        Rules-based safety qualification & ETA ranking matrix
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, padding: '4px 8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-info-bg)', color: 'var(--color-info)' }}>
                    Explainable AI/Rules
                  </span>
                </div>

                {isLoadingRecs ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    Evaluating roster qualification filters...
                  </div>
                ) : recommendations ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Eligible Ranked Teams */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-success)' }}>
                        ✓ Eligible Qualified Teams ({recommendations.eligibleTeams?.length || 0}):
                      </span>

                      {recommendations.eligibleTeams?.map((cand: any, idx: number) => (
                        <div
                          key={cand.teamId}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-md)',
                            backgroundColor: idx === 0 ? 'var(--color-success-bg)' : 'var(--color-surface-subtle)',
                            border: `1px solid ${idx === 0 ? 'var(--color-success)' : 'var(--color-border)'}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>
                                #{idx + 1} {cand.teamName}
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-success)' }}>
                                Fit: {Math.round(cand.fitScore * 100)}%
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                                ETA: ~{cand.etaMinutes} min ({cand.distanceMeters}m)
                              </span>
                            </div>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-primary)' }}>
                              Rationale: {cand.rationale}
                            </span>
                          </div>

                          <Button
                            variant={idx === 0 ? 'danger' : 'primary'}
                            size="sm"
                            isLoading={isAssigning}
                            onClick={() => handleAssignTeam(cand.teamId)}
                          >
                            Assign Team
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Excluded Teams with Plain Language Rationale */}
                    {recommendations.excludedTeams?.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-danger)' }}>
                          ✕ Excluded Teams ({recommendations.excludedTeams.length}):
                        </span>
                        {recommendations.excludedTeams.map((exc: any) => (
                          <div
                            key={exc.teamId}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--color-surface-subtle)',
                              border: '1px solid var(--color-border)',
                              fontSize: 'var(--font-size-xs)',
                              display: 'flex',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{exc.teamName}:</span>
                            <span style={{ color: 'var(--color-danger)', fontWeight: 500 }}>
                              {exc.exclusionReason}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                    RescueFit recommendations unavailable for this incident category.
                  </span>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--color-text-muted)' }}>
              Select an incident from the triage queue to inspect RescueFit recommendations.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
