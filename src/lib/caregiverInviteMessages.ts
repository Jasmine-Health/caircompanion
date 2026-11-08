import { APIError } from '../config/api';

export function formatCaregiverInviteSuccess(
  response: { message?: string },
  caregiverEmail: string,
): string {
  const apiMessage = response.message?.trim();
  if (apiMessage) return apiMessage;

  return `Connection request sent to ${caregiverEmail}. They can approve it in the CairGiver app.`;
}

export function formatCaregiverInviteError(error: unknown): string {
  const fallback = 'Could not send the invitation. Please try again.';

  if (error instanceof APIError) {
    const msg = error.message?.trim() || '';
    const lower = msg.toLowerCase();

    if (lower.includes('already exists')) {
      return 'You already have a pending invitation or connection with this caregiver.';
    }
    if (lower.includes('cairgiver or patient not found') || lower.includes('cairgiver not found')) {
      return 'No CairGiver account exists for this email. Ask them to sign up in the CairGiver app, then try again.';
    }
    if (lower.includes('not a cairgiver')) {
      return 'This email is not registered as a caregiver.';
    }
    if (lower.includes('deactivated')) {
      return 'This caregiver account is deactivated. Use a different email or contact support.';
    }
    if (msg === 'Network error or server unavailable') {
      return 'Network error. Check your connection and try again.';
    }
    if (msg) return msg;
    return fallback;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
