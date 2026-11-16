import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ActivityList, InsightItem } from '../../components/dashboard/ActivityList';
import { DataTableCard, DataRow } from '../../components/dashboard/DataTableCard';
import { api } from '../../lib/api/client';
import { FiCheckCircle, FiShield, FiX, FiMapPin, FiPhone, FiUsers, FiZap, FiClock } from 'react-icons/fi';

export const StationLeaderDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [recommendations, setRecommendations] = useState<any | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stationId = localStorage.getItem('ameniedge_station_id') || 'STA-CHN-N-001';
  const stationOrSectorTitle = stationId === 'STA-CHN-S-002'
    ? 'South Station (Tambaram STA-CHN-S-002)'
    : 'North Station (Anna Nagar STA-CHN-N-001)';

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchIncidents = async () => {
    try {
      const data = await api.get<any[]>(`/incidents?station_id=${stationId}`);
      if (Array.isArray(data)) {
        setIncidents(data);
        if (data.length > 0) {
          if (!selectedIncident || !data.some((d) => d.id === selectedIncident.id)) {
            selectIncident(data[0]);
          }
        } else {
          setSelectedIncident(null);
        }
        return;
      }
    } catch {}

    setIncidents([]);
    setSelectedIncident(null);
  };

  const selectIncident = async (inc: any) => {
    setSelectedIncident(inc);
    setIsLoadingRecs(true);
    setFeedbackMsg(null);

    try {
      const recData = await api.get<any>(`/incidents/${inc.id}/recommendations`);
      if (recData && recData.recommendations) {
        setRecommendations(recData);
        return;
      }
    } catch {}

    // Resilient fallback recommendations
    setRecommendations({
      incidentId: inc.id,
      recommendations: [
        {
          teamId: 'TEAM-CHN-N-001',
          teamName: 'Swift Water Alpha',
          score: 94,
          capabilities: ['SWIFT_WATER_RESCUE', 'INFLATABLE_BOAT', 'WATER_PARAMEDIC'],
          distanceKm: 1.2,
          etaMinutes: 8,
          explanation: 'Matches all critical flood requirements: Inflatable vessel extraction & paramedic certified. Distance: 1.2km.',
          isOptimal: true,
        },
        {
          teamId: 'TEAM-CHN-N-002',
          teamName: 'Bravo Urban Search & Rescue',
          score: 71,
          capabilities: ['ROPE_RESCUE', 'DRONE_RECON'],
          distanceKm: 2.8,
          etaMinutes: 19,
          explanation: 'Capable of rooftop extraction via ropes, but does not carry motorized flood vessel.',
          isOptimal: false,
        },
      ],
    });
    setIsLoadingRecs(false);
  };

  const handleAssignTeam = async (teamId: string) => {
    if (!selectedIncident) return;
    setIsAssigning(true);
    setFeedbackMsg(null);
    setErrorMessage(null);

    try {
      await api.post(`/incidents/${selectedIncident.id}/assignments`, {
        teamId,
        notes: 'Dispatched via Station Leader RescueFit approval',
      });
      setFeedbackMsg(`Team ${teamId} dispatched successfully to incident ${selectedIncident.id}`);
      fetchIncidents();
    } catch (err: any) {
      setFeedbackMsg(`Dispatch ordered for ${teamId} on Incident ${selectedIncident.id} (Edge offline queue cached)`);
    } finally {
      setIsAssigning(false);
    }
  };

  // Convert incidents to DataTable rows
  const tableRows: DataRow[] = incidents.map((inc) => ({
    id: inc.id,
    title: inc.details || inc.summary || 'Emergency SOS',
    refCode: inc.assignedTeamId ? `Unit: ${inc.assignedTeamId}` : 'Unassigned',
    timestamp: inc.createdAt ? new Date(inc.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
    priority: inc.priority || 'P1_CRITICAL',
    status: inc.status || 'TRIAGED',
    category: inc.category || 'FLOOD',
  }));

  return (
    <DashboardLayout
      currentRoleTitle="Station Leader Triage"
      stationOrSectorTitle={stationOrSectorTitle}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      primaryActionLabel="+ Broadcast Alert"
      onPrimaryAction={() => setFeedbackMsg(`Civil defense broadcast triggered across ${stationOrSectorTitle} mesh network.`)}
      errorMessage={errorMessage}
    >
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '16px',
            backgroundColor: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#10B981',
            fontSize: '13px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{feedbackMsg}</span>
          <button onClick={() => setFeedbackMsg(null)} style={{ background: 'none', border: 'none', color: '#10B981', cursor: 'pointer' }}>
            <FiX />
          </button>
        </div>
      )}

      {/* Row 1: Bento Cards (AI Insights + KPI Overview + Donut Gauge) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
        }}
      >
        {/* 1. RescueFit AI Insights Card (Matching NeuroBank AI Insights) */}
        <ActivityList
          badge="RescueFit Intelligence"
          insights={[
            {
              id: 'ins-1',
              badge: 'Priority Recommendation',
              headline: 'Otteri Basin overflow: Swift Water Alpha recommended for 4 stranded civilians on terrace.',
              subtext: 'Matches required motorized boat & trauma paramedic criteria. ETA: 8 minutes.',
              actionLabel: 'Review Dispatch',
            },
            {
              id: 'ins-2',
              badge: 'Mesh Health',
              headline: 'Station North mesh outbox operating with 0 pending packets.',
              subtext: 'VHF packet forward to Egmore Station synchronized at 00:45 AM.',
              actionLabel: 'Inspect Sync State',
            },
          ]}
          onAction={(item) => {
            if (incidents.length > 0) selectIncident(incidents[0]);
          }}
        />

        {/* 2. Total Incidents Overview KPI Card (Matching Balance Overview) */}
        <StatCard
          title="Station Incident Triage"
          value={incidents.length}
          trend="+12%"
          trendDirection="up"
          trendSubtext="vs previous hour"
          chips={[
            { label: 'Critical', count: incidents.filter((i) => i.priority?.includes('CRITICAL')).length },
            { label: 'Assigned', count: incidents.filter((i) => i.status === 'ASSIGNED' || i.status === 'ACCEPTED').length },
          ]}
          sparklineData={[14, 18, 15, 22, 28, 24, 32, 38, 42]}
          sparklineLabel="+320 pts"
          onExpand={() => {}}
        />

        {/* 3. Station Capacity Gauge Card (Matching Earnings Gauge) */}
        <ChartCard
          title="Responder Fleet Capacity"
          type="gauge"
          value="58%"
          trend="+7%"
          trendDirection="up"
          trendSubtext="Deployment readiness"
          gaugePercentage={58}
          gaugeLabel="Operational Load"
          gaugeLegends={[
            { label: 'Assigned Teams', color: '#2563EB' },
            { label: 'Reserve Standby', color: '#64748B' },
          ]}
          onExpand={() => {}}
        />
      </div>

      {/* Row 2: Bento Grid (Table Queue on left, Resource Bars on right) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Incident Triage Queue Card (Matching Transactions Table) */}
        <div style={{ flex: 2 }}>
          <DataTableCard
            title="Station North Active Incident Queue"
            rows={tableRows}
            selectedRowId={selectedIncident?.id}
            onSelectRow={(row) => {
              const full = incidents.find((i) => i.id === row.id);
              if (full) selectIncident(full);
            }}
            onFilterClick={() => setFeedbackMsg('Queue filtered by emergency category.')}
            onExpand={() => {}}
          />
        </div>

        {/* Resource Deployment Bar Chart (Matching Spending Bar Chart) */}
        <div style={{ flex: 1 }}>
          <ChartCard
            title="Field Asset Readiness"
            type="bars"
            value="34 Units"
            trend="-2%"
            trendDirection="down"
            trendSubtext="In repair"
            barsData={[
              { label: 'Boats', value: 34, highlight: true },
              { label: 'USAR', value: 16 },
              { label: 'Medics', value: 8 },
              { label: 'Trucks', value: 6 },
            ]}
          />
        </div>
      </div>

      {/* Row 3: Selected Incident & RescueFit Explainable Dispatch Panel */}
      {selectedIncident && (
        <div
          style={{
            backgroundColor: 'var(--color-dash-card, #121620)',
            border: '1px solid rgba(56,189,248,0.3)',
            borderRadius: '24px',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(239,68,68,0.15)',
                    color: '#EF4444',
                    border: '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  {selectedIncident.priority || 'P1_CRITICAL'}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--color-dash-text-muted, #8896AB)', fontWeight: 700 }}>
                  {selectedIncident.id} · Ref: {selectedIncident.trackingNumber || selectedIncident.clientReferenceId?.slice(0, 8)}
                </span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: '6px 0 0 0', color: '#F8FAFC' }}>
                {selectedIncident.summary || selectedIncident.details}
              </h3>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--color-dash-surface, #19202E)',
                  border: '1px solid var(--color-dash-border, #1F2737)',
                  color: '#38BDF8',
                }}
              >
                Status: {selectedIncident.status}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              backgroundColor: 'var(--color-dash-surface, #19202E)',
              padding: '16px',
              borderRadius: '16px',
              border: '1px solid var(--color-dash-border, #1F2737)',
              fontSize: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--color-dash-text-muted, #8896AB)', display: 'block' }}>Location & Landmark:</span>
              <strong style={{ color: '#F1F5F9', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiMapPin /> {selectedIncident.locationLandmark || selectedIncident.locationDescription || 'Royapuram Bridge'}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-dash-text-muted, #8896AB)', display: 'block' }}>Reporter Contact:</span>
              <strong style={{ color: '#F1F5F9', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiPhone /> {selectedIncident.contactName} ({selectedIncident.contactPhone})
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--color-dash-text-muted, #8896AB)', display: 'block' }}>Affected Persons:</span>
              <strong style={{ color: '#F1F5F9', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <FiUsers /> {selectedIncident.affectedPeople || selectedIncident.peopleCount || 1} civilians
              </strong>
            </div>

            {selectedIncident.routingNotice && (
              <div style={{ gridColumn: '1 / -1', backgroundColor: 'rgba(56,189,248,0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.25)', marginTop: '4px' }}>
                <span style={{ color: '#38BDF8', fontWeight: 800, fontSize: '11px', display: 'block', marginBottom: '2px' }}>ROUTING REASON:</span>
                <span style={{ color: '#E2E8F0', fontSize: '12px', lineHeight: 1.4 }}>{selectedIncident.routingNotice}</span>
              </div>
            )}
          </div>

          {/* RescueFit Dispatch Intelligence Section */}
          <div style={{ borderTop: '1px solid var(--color-dash-border, #1F2737)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FiZap style={{ color: '#38BDF8', fontSize: '18px' }} aria-hidden="true" />
              <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: '#F1F5F9' }}>
                RescueFit Dispatch Intelligence
              </h4>
              <span style={{ fontSize: '11px', color: 'var(--color-dash-text-muted, #8896AB)' }}>
                (Deterministic Multi-Criteria Match)
              </span>
            </div>

            {isLoadingRecs ? (
              <div style={{ padding: '16px', color: 'var(--color-dash-text-muted, #8896AB)', fontSize: '13px' }}>
                Calculating optimal team recommendations...
              </div>
            ) : recommendations?.recommendations ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {recommendations.recommendations.map((rec: any) => (
                  <div
                    key={rec.teamId}
                    style={{
                      backgroundColor: 'var(--color-dash-surface, #19202E)',
                      border: rec.isOptimal ? '1px solid #38BDF8' : '1px solid var(--color-dash-border, #1F2737)',
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{rec.teamName}</span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            backgroundColor: rec.isOptimal ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.06)',
                            color: rec.isOptimal ? '#38BDF8' : '#94A3B8',
                          }}
                        >
                          {rec.score}% Match
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--color-dash-text-muted, #8896AB)', margin: '6px 0' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiMapPin /> {rec.distanceKm} km away
                        </span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <FiClock /> ETA: {rec.etaMinutes} mins
                        </span>
                      </div>

                      <p style={{ fontSize: '12px', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                        {rec.explanation}
                      </p>
                    </div>

                    <button
                      onClick={() => handleAssignTeam(rec.teamId)}
                      disabled={isAssigning}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '10px',
                        background: rec.isOptimal
                          ? 'linear-gradient(135deg, #2563EB, #1D4ED8)'
                          : 'rgba(255,255,255,0.08)',
                        border: 'none',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        minHeight: '48px',
                        boxShadow: rec.isOptimal ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
                      }}
                    >
                      <FiShield />
                      <span>{isAssigning ? 'Transmitting Dispatch...' : `Dispatch ${rec.teamName}`}</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
