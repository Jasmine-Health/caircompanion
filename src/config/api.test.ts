import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APIError,
  API_ENDPOINTS,
  fetchAPI,
  fetchAPIWithFormData,
} from './api';

describe('api helpers', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('builds dynamic organization unenroll endpoint', () => {
    expect(API_ENDPOINTS.UNENROLL('org-1')).toBe('/organizations/unenroll/org-1');
  });

  it('fetchAPI returns JSON on success and attaches auth header when token exists', async () => {
    localStorage.setItem('access_token', 'token-123');
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const result = await fetchAPI<{ ok: boolean }>('/test');

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('fetchAPI maps API errors with status-specific messages', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ detail: 'Unauthorized' }),
    } as Response);

    await expect(fetchAPI('/secure')).rejects.toMatchObject({
      name: 'APIError',
      status: 401,
      message: 'Your session has expired. Please sign in again.',
    });
  });

  it('fetchAPI maps 502 and validation detail arrays', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => ({}),
    } as Response);
    await expect(fetchAPI('/x')).rejects.toThrow(/temporarily unavailable/);

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ detail: [{ msg: 'Invalid field' }] }),
    } as Response);
    await expect(fetchAPI('/x')).rejects.toThrow('Invalid field');
  });

  it('fetchAPI wraps network failures as APIError', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    await expect(fetchAPI('/x')).rejects.toThrow('Network error or server unavailable');
  });

  it('fetchAPIWithFormData posts form data without forcing json content type', async () => {
    const formData = new FormData();
    formData.append('email', 'joe@example.com');
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await fetchAPIWithFormData<{ success: boolean }>('/login', formData);
    expect(result.success).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
      expect.objectContaining({ method: 'POST', body: formData })
    );
  });

  it('APIError stores metadata', () => {
    const err = new APIError('failed', 500, { reason: 'x' });
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(500);
    expect(err.data).toEqual({ reason: 'x' });
  });
});
