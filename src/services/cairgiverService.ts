import { fetchAPI, API_ENDPOINTS } from '../config/api';

export interface CairgiverPatient {
  relationship_id: string;
  patient_email: string;
  patient_name: string;
  patient_database: string;
  status: 'approved' | 'pending' | 'rejected';
  initiator: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientDetail {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  relationship_id: string;
}

export interface PendingRequest {
  relationship_id: string;
  email: string;
  name: string;
  role: string;
  initiator: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cairgiver {
  relationship_id: string;
  cairgiver_email: string;
  cairgiver_name: string;
  status: 'approved' | 'pending' | 'rejected';
  initiator: string;
  createdAt: string;
  updatedAt: string;
}

export interface CairgiverDetail {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  relationship_id: string;
}

export interface PatientListItem {
  email: string;
  name: string;
  phoneNo: string;
}

export async function sendCairgiverRequest(patientEmail: string): Promise<{ relationship_id: string; message: string }> {
  return fetchAPI<{ relationship_id: string; message: string }>(API_ENDPOINTS.CAIRGIVER_REQUEST, {
    method: 'POST',
    body: JSON.stringify({ patient_email: patientEmail }),
  });
}

export async function getPatients(statusFilter?: 'approved' | 'pending' | 'rejected'): Promise<CairgiverPatient[]> {
  const queryParams = new URLSearchParams();
  if (statusFilter) queryParams.append('status_filter', statusFilter);
  
  const url = queryParams.toString() 
    ? `${API_ENDPOINTS.CAIRGIVER_PATIENTS}?${queryParams.toString()}`
    : API_ENDPOINTS.CAIRGIVER_PATIENTS;
  
  return fetchAPI<CairgiverPatient[]>(url);
}

export async function getPatientDetail(patientEmail: string): Promise<PatientDetail> {
  return fetchAPI<PatientDetail>(API_ENDPOINTS.CAIRGIVER_PATIENT_DETAIL(patientEmail));
}

export async function getPendingRequests(): Promise<PendingRequest[]> {
  return fetchAPI<PendingRequest[]>(API_ENDPOINTS.CAIRGIVER_REQUESTS_PENDING);
}

export async function approveRequest(relationshipId: string, status: 'approved' | 'rejected'): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(API_ENDPOINTS.CAIRGIVER_REQUEST_APPROVE, {
    method: 'POST',
    body: JSON.stringify({ relationship_id: relationshipId, status }),
  });
}

export async function cancelRequest(relationshipId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(API_ENDPOINTS.CAIRGIVER_REQUEST_CANCEL, {
    method: 'POST',
    body: JSON.stringify({ relationship_id: relationshipId }),
  });
}

export async function getCairgivers(statusFilter?: 'approved' | 'pending' | 'rejected'): Promise<Cairgiver[]> {
  const queryParams = new URLSearchParams();
  if (statusFilter) queryParams.append('status_filter', statusFilter);
  
  const url = queryParams.toString() 
    ? `${API_ENDPOINTS.CAIRGIVER_CAIRGIVERS}?${queryParams.toString()}`
    : API_ENDPOINTS.CAIRGIVER_CAIRGIVERS;
  
  return fetchAPI<Cairgiver[]>(url);
}

export async function getCairgiverDetail(cairgiverEmail: string): Promise<CairgiverDetail> {
  return fetchAPI<CairgiverDetail>(API_ENDPOINTS.CAIRGIVER_CAIRGIVER_DETAIL(cairgiverEmail));
}

export async function searchPatients(email?: string): Promise<PatientListItem[]> {
  const queryParams = new URLSearchParams();
  if (email) queryParams.append('email', email);
  
  const url = queryParams.toString() 
    ? `${API_ENDPOINTS.CAIRGIVER_PATIENT_LIST}?${queryParams.toString()}`
    : API_ENDPOINTS.CAIRGIVER_PATIENT_LIST;
  
  return fetchAPI<PatientListItem[]>(url);
}

export async function sendPatientRequest(cairgiverEmail: string): Promise<{ relationship_id: string; message: string }> {
  return fetchAPI<{ relationship_id: string; message: string }>(API_ENDPOINTS.CAIRGIVER_PATIENT_REQUEST, {
    method: 'POST',
    body: JSON.stringify({ cairgiver_email: cairgiverEmail }),
  });
}

export async function removePatientConnection(relationshipId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(API_ENDPOINTS.CAIRGIVER_PATIENT_REMOVE, {
    method: 'POST',
    body: JSON.stringify({ relationship_id: relationshipId }),
  });
}

export async function removeCairgiverConnection(relationshipId: string): Promise<{ message: string }> {
  return fetchAPI<{ message: string }>(API_ENDPOINTS.CAIRGIVER_CAIRGIVER_REMOVE, {
    method: 'POST',
    body: JSON.stringify({ relationship_id: relationshipId }),
  });
}
