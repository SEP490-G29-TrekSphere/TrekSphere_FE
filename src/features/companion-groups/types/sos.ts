
export type IncidentType = 'INJURY' | 'LOST' | 'WEATHER' | 'SUPPLIES' | 'OTHER';

export type SosAlertStatus = 'OPEN' | 'RESOLVED';

export interface CreateSosAlertPayload {
  incidentTypeCode: IncidentType;
  message?: string;
  latitude?: number | null;
  longitude?: number | null;
  idempotencyKey: string;
}

export interface SosAlertResponse {
  sosAlertId: string;
  groupTripId: string;
  matchingGroupId: string;
  senderId: string;
  senderName: string;
  incidentTypeCode: IncidentType;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  status: SosAlertStatus;
  resolvedById: string | null;
  resolvedByName: string | null;
  createdAt: string;
  updatedAt: string;
}
