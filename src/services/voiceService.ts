import { API_ENDPOINTS, fetchAPI } from '../config/api';
import type { VoiceModel } from '../types';

export interface VoiceModelsResponse {
  voice_models: VoiceModel[];
}

export async function getVoiceModels(): Promise<VoiceModel[]> {
  const response = await fetchAPI<VoiceModelsResponse>(API_ENDPOINTS.VOICE_MODELS);
  return response.voice_models;
}

export async function getVoiceSample(model: string): Promise<Blob> {
  const queryParams = new URLSearchParams();
  queryParams.append('model', model);
  
  const token = localStorage.getItem('access_token');
  const url = `${API_ENDPOINTS.VOICE_SAMPLE}?${queryParams.toString()}`;
  
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${url}`, {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to fetch voice sample');
  }
  
  return response.blob();
}
