import { describe, expect, it } from 'vitest';
import { answerLabel, numberButtons, numberRangeText, parseNumberAnswer, unansweredQuestions } from './checkin';
import { mockCheckinView } from '../test/checkinFixtures';
import type { NumberQuestion } from '../services/checkinService';

const managing = mockCheckinView.questions[2] as NumberQuestion;
const weight: NumberQuestion = { id: 'weight', type: 'number', text: 'Your weight today?', min: 50, max: 500, unit: 'lb' };

describe('check-in helpers', () => {
  it('keeps program order and skips questions answered by any channel', () => {
    expect(unansweredQuestions(mockCheckinView).map((q) => q.id)).toEqual(['breathing', 'rescue_inhaler', 'managing']);
    const view = { ...mockCheckinView, answers: { breathing: 'worse', rescue_inhaler: null } };
    expect(unansweredQuestions(view).map((q) => q.id)).toEqual(['rescue_inhaler', 'managing']);
    const zero = { ...mockCheckinView, answers: { breathing: 'same', rescue_inhaler: 'no', managing: 0 } };
    expect(unansweredQuestions(zero)).toEqual([]);
  });

  it('shows one button per number for 0 to 10 and a field for a wide or fractional range', () => {
    expect(numberButtons(managing)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(numberButtons(weight)).toBeNull();
    expect(numberButtons({ ...managing, max: 2.5 })).toBeNull();
  });

  it('reads a typed number only inside the range', () => {
    expect(parseNumberAnswer(weight, '180.5')).toBe(180.5);
    expect(parseNumberAnswer(weight, '50')).toBe(50);
    expect(parseNumberAnswer(weight, '49')).toBeNull();
    expect(parseNumberAnswer(weight, '501')).toBeNull();
    expect(parseNumberAnswer(weight, ' ')).toBeNull();
    expect(parseNumberAnswer(weight, 'abc')).toBeNull();
    expect(numberRangeText(weight)).toBe('A number from 50 to 500 lb');
    expect(numberRangeText(managing)).toBe('A number from 0 to 10');
  });

  it('labels an answer in the words the person saw', () => {
    expect(answerLabel(mockCheckinView.questions[0], 'same')).toBe('About the same');
    expect(answerLabel(mockCheckinView.questions[1], 'no')).toBe('No');
    expect(answerLabel(managing, 0)).toBe('0');
    expect(answerLabel(weight, 180)).toBe('180 lb');
    expect(answerLabel(mockCheckinView.questions[0], 'unknown')).toBe('unknown');
  });
});
