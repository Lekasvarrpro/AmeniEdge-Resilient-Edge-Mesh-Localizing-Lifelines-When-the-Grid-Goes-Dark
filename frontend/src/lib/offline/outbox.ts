import { db, type OutboxItem, type LocalReport } from '../db/index';
import { api } from '../api/client';

export type ConnectivityState =
  | 'ONLINE'
  | 'STATION_CONNECTED'
  | 'OFFLINE_SAVED'
  | 'SYNCING'
  | 'SYNC_ERROR';

class OutboxSynchronizer {
  private isFlushing = false;
  private intervalTimer: number | null = null;
  private listeners: ((state: ConnectivityState, pendingCount: number) => void)[] = [];
  private currentState: ConnectivityState = 'STATION_CONNECTED';
  private pendingCount = 0;

  constructor() {
    this.initListeners();
    this.startPeriodicSync();
  }

  public subscribe(listener: (state: ConnectivityState, pendingCount: number) => void) {
    this.listeners.push(listener);
    listener(this.currentState, this.pendingCount);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentState, this.pendingCount));
  }

  private initListeners() {
    window.addEventListener('online', () => {
      this.probeStationHealth();
      this.flushOutbox();
    });

    window.addEventListener('offline', () => {
      this.currentState = 'OFFLINE_SAVED';
      this.notify();
    });
  }

  public async probeStationHealth(): Promise<boolean> {
    try {
      await api.get('/health');
      if (this.currentState === 'OFFLINE_SAVED' || this.currentState === 'SYNC_ERROR') {
        this.currentState = 'STATION_CONNECTED';
      }
      this.notify();
      return true;
    } catch {
      this.currentState = 'OFFLINE_SAVED';
      this.notify();
      return false;
    }
  }

  public async enqueueIncident(payload: {
    category: string;
    affectedPeople: number;
    latitude?: number;
    longitude?: number;
    locationLandmark?: string;
    details?: string;
    contactName?: string;
    contactPhone?: string;
    hasImmediateDanger?: boolean;
    stationId?: string;
    region?: string;
  }): Promise<LocalReport> {
    const clientRefId = crypto.randomUUID();

    // 1. Commit to IndexedDB Outbox
    const outboxItem: OutboxItem = {
      client_reference_id: clientRefId,
      endpoint: '/incidents',
      method: 'POST',
      payload: {
        ...payload,
        clientReferenceId: clientRefId,
      },
      created_at: Date.now(),
      status: 'PENDING',
      attempt_count: 0,
      last_attempt_at: null,
    };
    await db.outbox.put(outboxItem);

    // 2. Commit optimistic report in Stage 1: SAVED_LOCAL
    const localReport: LocalReport = {
      id: clientRefId,
      client_reference_id: clientRefId,
      category: payload.category,
      priority: payload.hasImmediateDanger || payload.affectedPeople >= 3 ? 'P1_CRITICAL' : 'P2_URGENT',
      affected_people: payload.affectedPeople,
      latitude: payload.latitude,
      longitude: payload.longitude,
      location_landmark: payload.locationLandmark,
      region: payload.region,
      details: payload.details,
      contact_name: payload.contactName,
      contact_phone: payload.contactPhone,
      stage: 'SAVED_LOCAL',
      server_status: 'QUEUED_OFFLINE',
      created_at: Date.now(),
    };
    await db.reports.put(localReport);

    await this.updatePendingCount();

    // 3. Trigger immediate delivery attempt
    this.flushOutbox();

    return localReport;
  }

  public async flushOutbox() {
    if (this.isFlushing) return;
    this.isFlushing = true;

    try {
      const pendingItems = await db.outbox
        .where('status')
        .equals('PENDING')
        .or('status')
        .equals('FAILED')
        .sortBy('created_at');

      if (pendingItems.length > 0) {
        this.currentState = 'SYNCING';
        this.notify();
      }

      for (const item of pendingItems) {
        try {
          item.status = 'SENDING';
          item.attempt_count += 1;
          item.last_attempt_at = Date.now();
          await db.outbox.put(item);

          // Deliver to Station API with idempotency header
          const serverResponse = await api.request<Record<string, unknown>>(item.endpoint, {
            method: item.method,
            body: JSON.stringify(item.payload),
            headers: {
              'X-Client-Reference-Id': item.client_reference_id,
            },
          });

          // Delivery Succeeded -> Transition outbox and report to Stage 2: RECEIVED_STATION
          item.status = 'CONFIRMED';
          await db.outbox.put(item);

          const serverId = (serverResponse.id as string) || item.client_reference_id;
          const report = await db.reports.get(item.client_reference_id);
          if (report) {
            report.id = serverId;
            report.stage = 'RECEIVED_STATION';
            report.server_status = (serverResponse.status as string) || 'RECEIVED';
            report.region = (serverResponse.region as string) || report.region;
            report.routing_notice = (serverResponse.routingNotice as string) || (serverResponse.routing_notice as string);
            report.assigned_team_name = (serverResponse.assignedTeamName as string);
            report.station_name = (serverResponse.stationName as string);
            report.synced_at = Date.now();
            await db.reports.put(report);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          item.status = 'FAILED';
          item.error_message = msg;
          await db.outbox.put(item);
          this.currentState = 'SYNC_ERROR';
          break; // Pause loop, retry on next cycle
        }
      }

      const isHealthy = await this.probeStationHealth();
      if (isHealthy && this.currentState !== 'SYNC_ERROR') {
        this.currentState = 'STATION_CONNECTED';
      }
    } finally {
      this.isFlushing = false;
      await this.updatePendingCount();
    }
  }

  public async updatePendingCount() {
    this.pendingCount = await db.outbox
      .where('status')
      .notEqual('CONFIRMED')
      .count();
    this.notify();
  }

  private startPeriodicSync() {
    if (this.intervalTimer) clearInterval(this.intervalTimer);
    // Periodically flush and check station health every 7 seconds
    this.intervalTimer = window.setInterval(() => {
      this.flushOutbox();
      this.pollReportStatuses();
    }, 7000);
  }

  // Poll for responder acknowledgment (Stage 3) on reports received by station
  public async pollReportStatuses() {
    try {
      const activeReports = await db.reports
        .where('stage')
        .equals('RECEIVED_STATION')
        .toArray();

      for (const rep of activeReports) {
        if (!rep.id || rep.id.startsWith('urn:') || rep.id.length > 20) continue;
        try {
          const serverIncident = await api.get<Record<string, unknown>>(`/incidents/${rep.id}`);
          if (serverIncident) {
            const status = serverIncident.status as string;
            rep.server_status = status;
            if (
              status === 'ASSIGNED' ||
              status === 'ACCEPTED' ||
              status === 'EN_ROUTE' ||
              status === 'ON_SITE' ||
              status === 'RESOLVED'
            ) {
              rep.stage = 'ACKNOWLEDGED_RESPONDER';
              if (serverIncident.assigned_team_id) {
                rep.assigned_team_name = 'Assigned Rescue Team';
              }
              await db.reports.put(rep);
            }
          }
        } catch {
          // Ignore polling errors when offline
        }
      }
    } catch {
      // IndexedDB busy
    }
  }
}

export const outboxSync = new OutboxSynchronizer();

