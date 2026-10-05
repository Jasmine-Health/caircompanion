import { API_ENDPOINTS, fetchAPI, getApiBaseUrl } from '../config/api';
import type { VoiceModel } from '../types';

export const DEFAULT_VOICE_MODEL = 'aura-2-vesta-en';
export const VOICE_MODEL_STORAGE_KEY = 'selected_voice_model';

export interface VoiceModelsResponse {
  voice_models: VoiceModel[];
}

export function getCachedVoiceModel(): string {
  return localStorage.getItem(VOICE_MODEL_STORAGE_KEY) || DEFAULT_VOICE_MODEL;
}

export function cacheVoiceModel(model: string): void {
  localStorage.setItem(VOICE_MODEL_STORAGE_KEY, model);
}

export function clearCachedVoiceModel(): void {
  localStorage.removeItem(VOICE_MODEL_STORAGE_KEY);
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

  const response = await fetch(`${getApiBaseUrl()}${url}`, {
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

export async function getUserVoiceSettings(): Promise<string | null> {
  const settings = await fetchAPI<{ voice_model?: string | null }>(API_ENDPOINTS.VOICE_SETTINGS);
  return settings.voice_model ?? null;
}

export async function updateUserVoiceModel(model: string): Promise<string> {
  const response = await fetchAPI<{ voice_model?: string | null }>(API_ENDPOINTS.VOICE_SETTINGS, {
    method: 'PUT',
    body: JSON.stringify({ model }),
  });
  const saved = response.voice_model || model;
  cacheVoiceModel(saved);
  return saved;
}

/** Use the saved server voice, or persist Vesta so Talk uses it. */
export async function resolveUserVoiceModel(): Promise<string> {
  try {
    const saved = await getUserVoiceSettings();
    if (saved) {
      cacheVoiceModel(saved);
      return saved;
    }
  } catch (error) {
    console.error('[Voice] Failed to load voice settings:', error);
    return getCachedVoiceModel();
  }

  try {
    return await updateUserVoiceModel(DEFAULT_VOICE_MODEL);
  } catch (error) {
    console.error('[Voice] Failed to persist default voice:', error);
    cacheVoiceModel(DEFAULT_VOICE_MODEL);
    return DEFAULT_VOICE_MODEL;
  }
}
