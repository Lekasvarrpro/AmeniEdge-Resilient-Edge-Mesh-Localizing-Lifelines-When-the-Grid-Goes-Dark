import Dexie, { type Table } from 'dexie';

export type ReportStage = 'SAVED_LOCAL' | 'RECEIVED_STATION' | 'ACKNOWLEDGED_RESPONDER';

export interface OutboxItem {
  client_reference_id: string; // UUIDv4
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT';
  payload: Record<string, unknown>;
  created_at: number;
  status: 'PENDING' | 'SENDING' | 'FAILED' | 'CONFIRMED';
  attempt_count: number;
  last_attempt_at: number | null;
  error_message?: string;
}

export interface LocalReport {
  id: string; // Server ID or client UUID
  client_reference_id: string;
  category: string;
  priority: string;
  affected_people: number;
  latitude?: number;
  longitude?: number;
  location_landmark?: string;
  region?: string;
  details?: string;
  contact_name?: string;
  contact_phone?: string;
  stage: ReportStage;
  server_status?: string;
  assigned_team_name?: string;
  station_name?: string;
  routing_notice?: string;
  created_at: number;
  synced_at?: number;
}

export interface CachedEmergencyResource {
  id: string;
  type: 'SHELTER' | 'HAZARD' | 'BULLETIN';
  title: string;
  payload: Record<string, unknown>;
  updated_at: number;
}

export interface StoredSession {
  token: string;
  userId: string;
  username: string;
  fullName: string;
  role: string;
  stationId?: string;
  lastActive: number;
}

class AmeniEdgeDatabase extends Dexie {
  outbox!: Table<OutboxItem, string>;
  reports!: Table<LocalReport, string>;
  cachedResources!: Table<CachedEmergencyResource, string>;
  authSessions!: Table<StoredSession, string>;

  constructor() {
    super('AmeniEdgeLocalDB');
    this.version(1).stores({
      outbox: 'client_reference_id, status, created_at',
      reports: 'client_reference_id, id, stage, created_at',
      cachedResources: 'id, type, updated_at',
      authSessions: 'userId, role, lastActive',
    });
    this.version(2).stores({
      outbox: 'client_reference_id, status, created_at',
      reports: 'client_reference_id, id, stage, created_at',
      cachedResources: 'id, type, updated_at',
      authSessions: 'userId, role, lastActive',
    }).upgrade(async (tx) => {
      await tx.table('outbox').clear();
      await tx.table('reports').clear();
    });
  }
}

export const db = new AmeniEdgeDatabase();

