import { fetchAPI, API_ENDPOINTS } from '../config/api';

/**
 * Program check-ins (CairIQ Map /api/programs, reached through the app
 * backend). The app shows the same questions, options and order as the SMS
 * and voice versions, and its answers are stored the same way. The app is
 * optional: SMS and voice work without it.
 */

/** A check-in waiting for an answer. */
export interface OpenCheckin {
  checkin_id: string;
  checkin_key: string;
  due_at: string | null;
  expires_at: string | null;
  status: string;
  episode_id: string;
  program_id: string;
}

export interface CheckinOption {
  value: string;
  label: string;
  number: number;
}

export interface ChoiceQuestion {
  id: string;
  type: 'yes_no' | 'choice';
  text: string;
  options: CheckinOption[];
}

export interface NumberQuestion {
  id: string;
  type: 'number';
  text: string;
  min: number;
  max: number;
  unit: string | null;
}

export type CheckinQuestion = ChoiceQuestion | NumberQuestion;

export type CheckinAnswer = string | number;

/** The check-in as Map renders it for the app. */
export interface CheckinView {
  checkin_id: string;
  title: string;
  intro: string;
  /** The program's 911 line, shown exactly as given. */
  safety_line: string;
  /** The program's thank-you line. */
  closing_line?: string;
  /** Answers already given by any channel, keyed by question id. */
  answers: Record<string, CheckinAnswer | null>;
  questions: CheckinQuestion[];
  status: string | null;
}

/** The CairCompanion question Map asks after a risk answer. */
export interface CheckinFollowup {
  conversation_id: string;
  message: string;
  question_id: string;
}

export interface SubmitCheckinResult {
  checkin_id: string;
  stored: Array<{ question_id: string }>;
  rejected: Array<{ question_id: string; reason: string }>;
  status: string | null;
  followup: CheckinFollowup | null;
}

export interface CheckinAnswerItem {
  question_id: string;
  value: CheckinAnswer;
}

export async function getOpenCheckins(): Promise<OpenCheckin[]> {
  return fetchAPI<OpenCheckin[]>(API_ENDPOINTS.CHECKINS_OPEN);
}

export async function getCheckin(checkinId: string): Promise<CheckinView> {
  return fetchAPI<CheckinView>(API_ENDPOINTS.CHECKIN(checkinId));
}

export async function submitCheckinAnswers(
  checkinId: string,
  answers: CheckinAnswerItem[],
): Promise<SubmitCheckinResult> {
  return fetchAPI<SubmitCheckinResult>(API_ENDPOINTS.CHECKIN_ANSWERS(checkinId), {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });
}
