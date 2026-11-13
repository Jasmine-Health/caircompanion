import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAPI } from '../config/api';
import { getCheckin, getOpenCheckins, submitCheckinAnswers } from './checkinService';

vi.mock('../config/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../config/api')>();
  return { ...actual, fetchAPI: vi.fn() };
});

const mockFetchAPI = vi.mocked(fetchAPI);

describe('checkinService', () => {
  beforeEach(() => {
    mockFetchAPI.mockReset();
    mockFetchAPI.mockResolvedValue({} as never);
  });

  it('reads open check-ins and one check-in', async () => {
    await getOpenCheckins();
    await getCheckin('ck/1');
    expect(mockFetchAPI).toHaveBeenNthCalledWith(1, '/checkins/open');
    expect(mockFetchAPI).toHaveBeenNthCalledWith(2, '/checkins/ck%2F1');
  });

  it('posts answers as question id and value only', async () => {
    await submitCheckinAnswers('ck_1', [
      { question_id: 'breathing', value: 'worse' },
      { question_id: 'managing', value: 0 },
    ]);
    expect(mockFetchAPI).toHaveBeenCalledWith('/checkins/ck_1/answers', {
      method: 'POST',
      body: JSON.stringify({
        answers: [
          { question_id: 'breathing', value: 'worse' },
          { question_id: 'managing', value: 0 },
        ],
      }),
    });
  });
});
