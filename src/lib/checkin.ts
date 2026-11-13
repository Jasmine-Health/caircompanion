import type { CheckinAnswer, CheckinQuestion, CheckinView, NumberQuestion } from '../services/checkinService';

/** Largest number range shown as one button per number (0 to 10 is 11 buttons). */
const MAX_NUMBER_BUTTONS = 11;

/**
 * Questions still to answer, in program order. An answer already given by
 * text, by phone or by a caregiver counts, so it is not asked again.
 */
export function unansweredQuestions(view: CheckinView): CheckinQuestion[] {
  return view.questions.filter((q) => view.answers[q.id] == null);
}

/** One button per whole number for a small range, or null to use a number field. */
export function numberButtons(question: NumberQuestion): number[] | null {
  const { min, max } = question;
  if (!Number.isInteger(min) || !Number.isInteger(max) || max - min + 1 > MAX_NUMBER_BUTTONS) return null;
  return Array.from({ length: max - min + 1 }, (_, i) => min + i);
}

/** A typed number, or null when it is empty or outside the question's range. */
export function parseNumberAnswer(question: NumberQuestion, raw: string): number | null {
  if (raw.trim() === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= question.min && value <= question.max ? value : null;
}

export function numberRangeText(question: NumberQuestion): string {
  return `A number from ${question.min} to ${question.max}${question.unit ? ` ${question.unit}` : ''}`;
}

/** What the person chose, in the words they saw. */
export function answerLabel(question: CheckinQuestion, value: CheckinAnswer): string {
  if (question.type === 'number') return question.unit ? `${value} ${question.unit}` : String(value);
  return question.options.find((o) => o.value === value)?.label ?? String(value);
}
