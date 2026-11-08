import { APIError } from '../config/api';

export function formatApiError(error: unknown, fallback: string): string {
  if (error instanceof APIError) {
    const msg = error.message?.trim();
    if (msg) return msg;
    return fallback;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return fallback;
}

export type FeedbackMessage = {
  type: 'success' | 'error';
  text: string;
};
