import { describe, expect, it } from 'vitest';
import { APIError } from '../config/api';
import { formatCaregiverInviteError, formatCaregiverInviteSuccess } from './caregiverInviteMessages';

describe('caregiverInviteMessages', () => {
  it('uses API success message when provided', () => {
    expect(
      formatCaregiverInviteSuccess(
        { message: 'Connection request sent to cairgiver cg@example.com' },
        'cg@example.com',
      ),
    ).toBe('Connection request sent to cairgiver cg@example.com');
  });

  it('falls back to a friendly success message', () => {
    expect(formatCaregiverInviteSuccess({}, 'cg@example.com')).toMatch(/cg@example.com/);
  });

  it('maps duplicate request errors', () => {
    expect(
      formatCaregiverInviteError(new APIError('Relationship request already exists', 400)),
    ).toMatch(/already have a pending invitation/i);
  });

  it('maps caregiver not found errors', () => {
    expect(formatCaregiverInviteError(new APIError('Cairgiver not found', 404))).toMatch(
      /sign up in the CairGiver app/i,
    );
  });
});
