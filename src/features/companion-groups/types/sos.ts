export type IncidentType = 'INJURY' | 'LOST' | 'WEATHER' | 'SUPPLIES' | 'OTHER';

export type SosAlertStatus = 'OPEN' | 'RESPONDING' | 'RESOLVED';

export interface CreateSosAlertPayload {
  incidentTypeCode: IncidentType;
  message?: string;
  latitude?: number | null;
  longitude?: number | null;
  idempotencyKey: string;
}

export interface UpdateSosLocationPayload {
  latitude: number;
  longitude: number;
}

export interface SosAlertResponse {
  sosAlertId: string;
  groupTripId: string;
  matchingGroupId: string;
  senderId: string;
  senderName: string;
  senderPhone?: string | null;
  senderAvatarUrl?: string | null;
  senderEmergencyContactName?: string | null;
  senderEmergencyContactPhone?: string | null;
  incidentTypeCode: IncidentType;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  status: SosAlertStatus;
  responderId?: string | null;
  responderName?: string | null;
  responderPhone?: string | null;
  responderAvatarUrl?: string | null;
  respondedAt?: string | null;
  resolvedById: string | null;
  resolvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}
