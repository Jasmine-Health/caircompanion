import { fetchAPI, API_ENDPOINTS } from '../config/api';

export interface Connector {
  ehr_system: string;
  is_active: boolean;
  is_authorized: boolean;
  patient_id?: string;
  updatedAt?: string;
  error_count?: number;
  status?: string;
}

export interface CreateConnectorRequest {
  ehr_system: string;
  is_active: boolean;
}

export interface AuthorizeConnectorResponse {
  authorization_url: string;
  state?: string;
}

export async function getConnectors(): Promise<Connector[]> {
  return fetchAPI<Connector[]>(API_ENDPOINTS.CONNECTORS);
}

export async function createConnector(data: CreateConnectorRequest): Promise<Connector> {
  return fetchAPI<Connector>(API_ENDPOINTS.CONNECTORS, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteConnector(ehrSystem: string): Promise<void> {
  await fetchAPI<void>(API_ENDPOINTS.CONNECTOR(ehrSystem), {
    method: 'DELETE',
  });
}

export async function authorizeConnector(ehrSystem: string): Promise<AuthorizeConnectorResponse> {
  return fetchAPI<AuthorizeConnectorResponse>(API_ENDPOINTS.CONNECTOR_AUTHORIZE(ehrSystem), {
    method: 'POST',
    body: JSON.stringify({}),
  });
}
