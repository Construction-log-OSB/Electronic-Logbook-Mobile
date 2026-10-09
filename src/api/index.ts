/**
 * API Service — centralized API layer for Electronic Logbook features.
 * All network requests go through this module using the authenticated API client.
 *
 * The mobile app talks only to the Gateway (`/api/electronic-logbook/*`).
 * Downstream microservice topology is hidden.
 */

import { apiClient, extractApiError } from '@/src/auth/api/client';
import type { TripStatus } from '@/src/domain/types';
import id from 'zod/v4/locales/id.cjs';

// ─── Config ───────────────────────────────────────────────────────────────

export const ELB_BASE = '/electronic-logbook';
export const NOTIFICATIONS_BASE = '/notifications';
export const DOCUMENTS_BASE = '/documents';

// ─── Pagination ──────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Vessel Types ─────────────────────────────────────────────────────────

export interface Vessel {
  id: string;
  registrationNumber: string;
  vesselName: string;
  vesselType: string;
  length?: number;
  grossTonnage?: number;
  enginePower?: number;
  homePort?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';
  ownerId?: string;
  provinceCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VesselCrew {
  id: string;
  vesselId: string;
  userId: string;
  fullName?: string;
  fishermanCode?: string;
  crewRole: string;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

export interface VesselGear {
  id: string;
  vesselId: string;
  name: string;
  gearType: string;
  quantity: number;
  status: 'ACTIVE' | 'INACTIVE';
}

// ─── Fishing Trip Types ───────────────────────────────────────────────────

export interface FishingTrip {
  id: string;
  vesselId: string;
  vesselName?: string;
  vesselRegistrationNumber?: string;
  departurePortCode?: string;
  arrivalPortCode?: string;
  departureAt?: string;
  arrivalAt?: string;
  tripNumber?: string;
  status: TripStatus;
  submissionStatus?: string;
  vessel?: { id: string; vesselName: string; registrationNumber: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TripWorkflow {
  currentStep: TripStatus;
  completedSteps: TripStatus[];
  nextStep?: TripStatus;
  canDepart: boolean;
  canStartFishing: boolean;
  canReturn: boolean;
  canComplete: boolean;
}

// ─── Notification Types ───────────────────────────────────────────────────

export interface Notification {
  id: string;
  recipientId: string;
  eventType: string;
  eventCode: string;
  title: string;
  body: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  isRead: boolean;
  readAt?: string;
  deepLink?: string;
  createdAt: string;
}

export interface NotificationListResponse {
  data: Notification[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ─── Dashboard Types ──────────────────────────────────────────────────────

export interface DashboardData {
  vessels: Vessel[];
  vesselCount: number;
  activeTrips: FishingTrip[];
  activeTripCount: number;
  pendingSync: { count: number };
}

// ─── Trip Overview Types ──────────────────────────────────────────────────

export interface CatchRecord {
  id: string;
  speciesCode?: string;
  speciesName?: string;
  quantity?: number;
  unit?: string;
  estimatedQuantity?: number;
  condition?: string;
}

export interface FishingOperation {
  id: string;
  fishingTripId: string;
  latitude?: number;
  longitude?: number;
  operationStartedAt?: string;
  operationEndedAt?: string;
  operationType?: string;
  fishingGearType?: string;
  fishingGround?: string;
  depth?: number;
  notes?: string;
  catches?: CatchRecord[];
}

export interface PortCall {
  id: string;
  fishingTripId: string;
  portCode?: string;
  callType?: string;
  occurredAt?: string;
  latitude?: number;
  longitude?: number;
  reason?: string;
  notes?: string;
}

export interface Incident {
  id: string;
  vesselId: string;
  fishingTripId?: string;
  incidentType?: string;
  severity?: string;
  occurredAt?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  actionTaken?: string;
}

export interface FuelRecord {
  id: string;
  fishingTripId: string;
  recordType?: string;
  quantity?: number;
  unit?: string;
  occurredAt?: string;
  location?: string;
  notes?: string;
}

export interface TripCrewMember {
  id: string;
  fishingTripId: string;
  userId: string;
  fullName?: string;
  fishermanCode?: string;
  crewRole: string;
  joinedAt: string;
  leftAt?: string;
}

export interface TripGear {
  id: string;
  name: string;
  gearType: string;
  quantity?: number;
}

export interface LandingCatch {
  id: string;
  speciesCode?: string;
  speciesName?: string;
  quantity?: number;
  unit?: string;
}

export interface LandingRecord {
  id: string;
  fishingTripId: string;
  landingPortCode?: string;
  landedAt?: string;
  totalQuantity?: number;
  notes?: string;
  catches?: LandingCatch[];
}

export interface TripDocument {
  id: string;
  documentCode?: string;
  documentType?: string;
  originalFileName: string;
  mimeType: string;
  fileSize?: number;
  uploadedAt: string;
}

export interface TripOverview {
  // Flat trip snapshot (Phase-9 enrichment — vessel name + reg number
  // duplicated here so mobile UI never has to drill into nested objects).
  trip: FishingTrip;
  vessel?: {
    id: string;
    registrationNumber: string;
    vesselName: string;
    vesselType: string;
    length?: number;
    status: string;
  };
  captain?: TripCrewMember;
  crew: TripCrewMember[];
  gear: TripGear[];
  operations: FishingOperation[];
  catchSummary: {
    totalWeight: number;
    speciesCount: number;
  };
  catchBySpecies: {
    speciesCode: string;
    speciesName: string;
    totalQuantity: number;
    unit: string;
  }[];
  landing?: {
    id: string;
    landingPortCode?: string;
    landedAt?: string;
    totalQuantity?: number;
    catches: LandingCatch[];
  };
  portCalls: PortCall[];
  incidents: Incident[];
  fuelRecords: FuelRecord[];
  forms: {
    m01?: { id: string; status: string; submittedAt?: string };
    m02?: { id: string; status: string; submittedAt?: string };
    m03?: { id: string; status: string; submittedAt?: string };
  };
  documents: TripDocument[];
  workflow: TripWorkflow;
  sync: {
    status: string;
    lastSyncedAt?: string | null;
    deviceCount: number;
    pendingChanges: number;
    conflictCount: number;
  };
}

export interface SyncStatus {
  status: string;
  lastSyncedAt?: string | null;
  deviceCount: number;
  pendingChanges: number;
  conflictCount: number;
}

// ─── Documents ────────────────────────────────────────────────────────────

export interface DocumentMeta {
  id: string;
  documentCode?: string;
  documentType?: string;
  originalFileName: string;
  mimeType: string;
  fileSize?: number;
  uploadedAt: string;
  ownerType?: string;
  ownerId?: string;
}

// ─── Forms (M01/M02/M03) ─────────────────────────────────────────────────

export interface FormSubmission {
  id: string;
  formDefinitionId: string;
  formCode?: 'M01' | 'M02' | 'M03';
  fishingTripId?: string;
  vesselId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  version: number;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  data?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ─── Vessel API ──────────────────────────────────────────────────────────

export async function getVessels(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}): Promise<Vessel[]> {
  const { data } = await apiClient.get<Vessel[]>(`${ELB_BASE}/vessels`, { params });
  return data;
}

export async function getVessel(id: string): Promise<Vessel> {
  const { data } = await apiClient.get<Vessel>(`${ELB_BASE}/vessels/${id}`);
  return data;
}

export async function getVesselCrew(vesselId: string): Promise<VesselCrew[]> {
  const { data } = await apiClient.get<{ data: VesselCrew[] }>(`${ELB_BASE}/vessel-crew`, {
    params: { vesselId },
  });
  return data.data;
}

export async function getVesselGear(vesselId: string): Promise<VesselGear[]> {
  const { data } = await apiClient.get<{ data: VesselGear[] }>(`${ELB_BASE}/fishing-gears`, {
    params: { vesselId },
  });
  return data.data;
}

// ─── Fishing Trip API ─────────────────────────────────────────────────────

export async function getTrips(params?: {
  page?: number;
  limit?: number;
  vesselId?: string;
  status?: string;
}): Promise<FishingTrip[]> {
  const { data } = await apiClient.get<FishingTrip[]>(
    `${ELB_BASE}/fishing-trips`,
    { params }
  );
  return data;
}

export async function getTrip(id: string): Promise<FishingTrip> {
  const { data } = await apiClient.get<FishingTrip>(`${ELB_BASE}/fishing-trips/${id}`);
  return data;
}

export async function getTripOverview(tripId: string): Promise<TripOverview> {
  const { data } = await apiClient.get<TripOverview>(
    `${ELB_BASE}/fishing-trips/${tripId}/overview`
  );
  return data;
}

export interface CreateTripDto {
  vesselId: string;
  tripNumber?: string;
  departurePortCode?: string;
  departureAt?: string;
  arrivalAt?: string;
}

export async function createTrip(dto: CreateTripDto): Promise<FishingTrip> {
  const { data } = await apiClient.post<FishingTrip>(`${ELB_BASE}/fishing-trips`, dto);
  return data;
}

export async function transitionTrip(
  tripId: string,
  action: 'prepare' | 'depart' | 'start-fishing' | 'start-returning' | 'complete' | 'cancel'
): Promise<FishingTrip> {
  const { data } = await apiClient.post<FishingTrip>(
    `${ELB_BASE}/fishing-trips/${tripId}/${action}`
  );
  return data;
}

// ─── Fishing Operations ───────────────────────────────────────────────────

export async function getFishingOperations(params?: {
  fishingTripId?: string;
  page?: number;
  limit?: number;
}): Promise<FishingOperation[]> {
  const { data } = await apiClient.get<{ data: FishingOperation[] }>(
    `${ELB_BASE}/fishing-operations`,
    { params }
  );
  return data.data ?? [];
}

export interface CreateFishingOperationDto {
  fishingTripId: string;
  latitude?: number;
  longitude?: number;
  operationStartedAt?: string;
  operationEndedAt?: string;
  operationType?: string;
  fishingGearType?: string;
  fishingGround?: string;
  depth?: number;
  notes?: string;
}

export async function createFishingOperation(
  dto: CreateFishingOperationDto
): Promise<FishingOperation> {
  const { data } = await apiClient.post<FishingOperation>(
    `${ELB_BASE}/fishing-operations`,
    dto
  );
  return data;
}

export async function deleteFishingOperation(id: string): Promise<void> {
  await apiClient.delete(`${ELB_BASE}/fishing-operations/${id}`);
}

// ─── Catch Records ────────────────────────────────────────────────────────

export interface CreateCatchRecordDto {
  fishingOperationId: string;
  speciesCode?: string;
  speciesName?: string;
  quantity?: number;
  unit?: string;
  estimatedQuantity?: number;
  condition?: string;
}

export async function createCatchRecord(dto: CreateCatchRecordDto): Promise<CatchRecord> {
  const { data } = await apiClient.post<CatchRecord>(
    `${ELB_BASE}/catch-records`,
    dto
  );
  return data;
}

// ─── Fuel Records ─────────────────────────────────────────────────────────

export interface CreateFuelRecordDto {
  fishingTripId: string;
  recordType: 'BEFORE_DEPARTURE' | 'REFUEL' | 'CONSUMPTION' | 'ARRIVAL';
  quantity?: number;
  unit?: string;
  occurredAt?: string;
  location?: string;
  notes?: string;
}

export async function getFuelRecords(params: {
  fishingTripId: string;
}): Promise<FuelRecord[]> {
  const { data } = await apiClient.get<{ data: FuelRecord[] }>(
    `${ELB_BASE}/fuel-records`,
    { params }
  );
  return data.data ?? [];
}

export async function createFuelRecord(dto: CreateFuelRecordDto): Promise<FuelRecord> {
  const { data } = await apiClient.post<FuelRecord>(
    `${ELB_BASE}/fuel-records`,
    dto
  );
  return data;
}

// ─── Incidents ────────────────────────────────────────────────────────────

export interface CreateIncidentDto {
  vesselId: string;
  fishingTripId?: string;
  incidentType?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurredAt?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  actionTaken?: string;
}

export async function getIncidents(params?: {
  fishingTripId?: string;
  vesselId?: string;
}): Promise<Incident[]> {
  const { data } = await apiClient.get<{ data: Incident[] }>(
    `${ELB_BASE}/incidents`,
    { params }
  );
  return data.data ?? [];
}

export async function createIncident(dto: CreateIncidentDto): Promise<Incident> {
  const { data } = await apiClient.post<Incident>(`${ELB_BASE}/incidents`, dto);
  return data;
}

// ─── Port Calls ───────────────────────────────────────────────────────────

export interface CreatePortCallDto {
  fishingTripId: string;
  portCode?: string;
  callType?: 'DEPARTURE' | 'ARRIVAL' | 'TRANSIT' | 'EMERGENCY';
  occurredAt?: string;
  latitude?: number;
  longitude?: number;
  reason?: string;
  notes?: string;
}

export async function getPortCalls(params: {
  fishingTripId: string;
}): Promise<PortCall[]> {
  const { data } = await apiClient.get<{ data: PortCall[] }>(
    `${ELB_BASE}/port-calls`,
    { params }
  );
  return data.data ?? [];
}

export async function createPortCall(dto: CreatePortCallDto): Promise<PortCall> {
  const { data } = await apiClient.post<PortCall>(`${ELB_BASE}/port-calls`, dto);
  return data;
}

// ─── Landing ──────────────────────────────────────────────────────────────

export interface CreateLandingDto {
  fishingTripId: string;
  landingPortCode?: string;
  landedAt?: string;
  notes?: string;
}

export async function getLandingRecords(params: {
  fishingTripId: string;
}): Promise<LandingRecord[]> {
  const { data } = await apiClient.get<{ data: LandingRecord[] }>(
    `${ELB_BASE}/landing-records`,
    { params }
  );
  return data.data ?? [];
}

export async function createLandingRecord(dto: CreateLandingDto): Promise<LandingRecord> {
  const { data } = await apiClient.post<LandingRecord>(
    `${ELB_BASE}/landing-records`,
    dto
  );
  return data;
}

// ─── Trip Crew ────────────────────────────────────────────────────────────

export interface CreateTripCrewDto {
  fishingTripId: string;
  userId?: string;
  fishermanCode?: string;
  crewRole?: string;
  joinedAt?: string;
}

export async function getTripCrew(params: {
  fishingTripId: string;
}): Promise<TripCrewMember[]> {
  const { data } = await apiClient.get<{ data: TripCrewMember[] }>(
    `${ELB_BASE}/fishing-trip-crew`,
    { params }
  );
  return data.data ?? [];
}

export async function addTripCrew(dto: CreateTripCrewDto): Promise<TripCrewMember> {
  const { data } = await apiClient.post<TripCrewMember>(
    `${ELB_BASE}/fishing-trip-crew`,
    dto
  );
  return data;
}

export async function removeTripCrew(id: string): Promise<void> {
  await apiClient.delete(`${ELB_BASE}/fishing-trip-crew/${id}`);
}

// ─── Documents ────────────────────────────────────────────────────────────

export async function getDocuments(params?: {
  ownerType?: string;
  ownerId?: string;
}): Promise<DocumentMeta[]> {
  const { data } = await apiClient.get<{ data: DocumentMeta[] }>(
    DOCUMENTS_BASE,
    { params }
  );
  return data.data ?? [];
}

// Documents are uploaded as multipart via Document Service. The mobile app
// uploads directly through the gateway (which forwards to the document service).
export async function uploadDocument(
  file: { uri: string; name: string; type: string },
  meta: { ownerType: string; ownerId: string; documentType?: string }
): Promise<DocumentMeta> {
  const form = new FormData();
  // RN multipart file spec
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  form.append('ownerType', meta.ownerType);
  form.append('ownerId', meta.ownerId);
  if (meta.documentType) form.append('documentType', meta.documentType);

  const { data } = await apiClient.post<DocumentMeta>(DOCUMENTS_BASE, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deleteDocument(id: string): Promise<void> {
  await apiClient.delete(`${DOCUMENTS_BASE}/${id}`);
}

// ─── Forms (M01/M02/M03) ─────────────────────────────────────────────────

export async function getFormDefinitions(): Promise<
  Array<{ id: string; formCode: string; name: string; version: number }>
> {
  const { data } = await apiClient.get<{ data: Array<{ id: string; formCode: string; name: string; version: number }> }>(
    `${ELB_BASE}/form-definitions`
  );
  return data.data ?? [];
}

/**
 * Resolve the active FormDefinition id for a regulatory code (M01/M02/M03).
 * Returns `null` if no active definition is registered for the code.
 */
export async function findFormDefinitionByCode(
  code: 'M01' | 'M02' | 'M03'
): Promise<{ id: string; formCode: string; name: string; version: number } | null> {
  const defs = await getFormDefinitions();
  
  const def = defs.find((d) => d.formCode.toUpperCase() === code);
  return def ?? null;
}

export async function getFormSubmissions(params?: {
  fishingTripId?: string;
  vesselId?: string;
}): Promise<FormSubmission[]> {
  const { data } = await apiClient.get<{ data: FormSubmission[] }>(
    `${ELB_BASE}/form-submissions`,
    { params }
  );
  return data.data ?? [];
}

export async function getFormSubmission(id: string): Promise<FormSubmission> {
  const { data } = await apiClient.get<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}`
  );
  return data;
}

export async function createFormSubmission(dto: {
  formDefinitionId: string;
  vesselId: string;
  fishingTripId?: string;
  data?: Record<string, unknown>;
}): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/form-submissions`,
    dto
  );
  return data;
}

export async function updateFormSubmissionData(
  id: string,
  data: Record<string, unknown>
): Promise<FormSubmission> {
  const res = await apiClient.patch<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}/data`,
    { data }
  );
  return res.data;
}

export async function submitFormSubmission(id: string): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}/submit`
  );
  return data;
}

export async function startReviewFormSubmission(
  id: string
): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}/start-review`
  );
  return data;
}

export async function cancelFormSubmission(id: string): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}/cancel`
  );
  return data;
}

export async function reopenFormSubmission(
  id: string
): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/form-submissions/${id}/reopen`
  );
  return data;
}

// Submit a regulatory form in one shot (server composes payload from
// trip/vessel/captain/gear/landing data).
export async function submitRegulatoryForm(
  code: 'm01' | 'm02' | 'm03',
  payload: {
    fishingTripId: string;
    vesselId: string;
    data: Record<string, unknown>;
  }
): Promise<FormSubmission> {
  const { data } = await apiClient.post<FormSubmission>(
    `${ELB_BASE}/forms/${code}`,
    payload
  );
  return data;
}

// ─── Sync ────────────────────────────────────────────────────────────────

export async function getSyncStatus(): Promise<SyncStatus> {
  const { data } = await apiClient.get<SyncStatus>(`${ELB_BASE}/sync/status`);
  return data;
}

export interface SyncPushPayload {
  deviceId: string;
  operations: Array<{
    operationId: string; // client-generated UUID
    entityType: string;
    entityId?: string;
    operationType: 'CREATE' | 'UPDATE' | 'DELETE';
    payload: Record<string, unknown>;
    clientVersion: number;
  }>;
}

export async function syncPush(payload: SyncPushPayload): Promise<{
  processed: number;
  conflicts: number;
  errors: number;
}> {
  const { data } = await apiClient.post(`${ELB_BASE}/sync/push`, payload);
  return data;
}

export async function syncRegisterDevice(dto: {
  deviceId: string;
  platform: string;
  appVersion: string;
}): Promise<void> {
  await apiClient.post(`${ELB_BASE}/sync/devices`, dto);
}

// ─── Notification API ────────────────────────────────────────────────────

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationListResponse> {
  const { data } = await apiClient.get<NotificationListResponse>(
    `${NOTIFICATIONS_BASE}/users/me/history`,
    { params }
  );
  return data;
}

export async function markNotificationRead(recipientId: string): Promise<void> {
  await apiClient.patch(`${NOTIFICATIONS_BASE}/recipients/${recipientId}/read`);
}

// ─── Dashboard API ─────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>(`${ELB_BASE}/dashboard`);
  return data;
}

// ─── Error Helpers ──────────────────────────────────────────────────────

export function isNetworkError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const e = error as Record<string, unknown>;
  return (
    typeof e.code === 'string' &&
    (e.code === 'ECONNABORTED' ||
      e.code === 'ERR_NETWORK' ||
      e.code === 'ERR_CONNECTION_REFUSED' ||
      String(e.message).includes('Network') ||
      String(e.message).includes('timeout') ||
      String(e.message).includes('socket') ||
      String(e.message).includes('unavailable'))
  );
}

export { extractApiError };
