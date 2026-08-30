import { describe, expect, it } from 'vitest';
import { cn, formatDate, formatDateTime, formatTime } from './utils';

describe('shared formatting utilities', () => {
  it('merges conditional and conflicting Tailwind classes', () => {
    expect(cn('px-2', false && 'hidden', 'px-4', 'text-sm')).toBe('px-4 text-sm');
  });

  it('formats dates from Date and string inputs', () => {
    const date = new Date(2026, 7, 30, 17, 5);

    expect(formatDate(date)).toBe('Aug 30, 2026');
    expect(formatDate('2026-08-30T00:00:00')).toBe('Aug 30, 2026');
  });

  it('formats times using a 12-hour clock', () => {
    const date = new Date(2026, 7, 30, 17, 5);

    expect(formatTime(date)).toBe('5:05 PM');
  });

  it('formats a combined date and time', () => {
    const date = new Date(2026, 7, 30, 17, 5);

    expect(formatDateTime(date)).toBe('Aug 30, 2026 at 5:05 PM');
  });
});
