import type { CheckinView, OpenCheckin } from '../services/checkinService';

// The COPD discharge day 7 check-in as CairIQ Map renders it for the app
// (map/services/programs/render.py render_app, knowledge/programs/copd_discharge.json).
export const COPD_SAFETY_LINE = 'If you have severe trouble breathing or chest pain, call 911.';

export const mockOpenCheckin: OpenCheckin = {
  checkin_id: 'ck_day7',
  checkin_key: 'day7',
  due_at: '2026-11-13T16:00:00+00:00',
  expires_at: '2026-11-14T14:00:00+00:00',
  status: 'sent',
  episode_id: 'ep_1',
  program_id: 'copd_discharge',
};

export const mockCheckinView: CheckinView = {
  checkin_id: 'ck_day7',
  title: 'Week 1 check-in',
  intro: 'Hi, this is CairIQ for your care team. It has been a week since you left the hospital.',
  safety_line: COPD_SAFETY_LINE,
  closing_line: 'Thank you. Your care team can see your answers.',
  status: 'sent',
  answers: {},
  questions: [
    {
      id: 'breathing',
      type: 'choice',
      text: 'Compared with when you left the hospital, how is your breathing?',
      options: [
        { value: 'better', label: 'Better', number: 1 },
        { value: 'same', label: 'About the same', number: 2 },
        { value: 'worse', label: 'Worse', number: 3 },
      ],
    },
    {
      id: 'rescue_inhaler',
      type: 'yes_no',
      text: 'Have you needed your rescue inhaler more than usual since we last checked in?',
      options: [
        { value: 'yes', label: 'Yes', number: 1 },
        { value: 'no', label: 'No', number: 2 },
      ],
    },
    {
      id: 'managing',
      type: 'number',
      text: 'On a scale of 0 to 10, how well are you managing at home? 0 is not at all, 10 is very well.',
      min: 0,
      max: 10,
      unit: null,
    },
  ],
};
