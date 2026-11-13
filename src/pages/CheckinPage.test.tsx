import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { APIError } from '../config/api';
import { CheckinPage } from './CheckinPage';
import * as checkinService from '../services/checkinService';
import * as healthDataService from '../services/healthDataService';
import { COPD_SAFETY_LINE, mockCheckinView } from '../test/checkinFixtures';
import type { SubmitCheckinResult } from '../services/checkinService';

vi.mock('../services/checkinService');
vi.mock('../services/healthDataService');

const getCheckin = vi.mocked(checkinService.getCheckin);
const submit = vi.mocked(checkinService.submitCheckinAnswers);

const stored: SubmitCheckinResult = {
  checkin_id: 'ck_day7',
  stored: [{ question_id: 'breathing' }, { question_id: 'rescue_inhaler' }, { question_id: 'managing' }],
  rejected: [],
  status: 'answered',
  followup: null,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/checkin/ck_day7']}>
      <Routes>
        <Route path="/checkin/:checkinId" element={<CheckinPage />} />
        <Route path="/" element={<p>Home</p>} />
      </Routes>
    </MemoryRouter>
  );
}

async function answerAll(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('radio', { name: 'Worse' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('radio', { name: 'No' }));
  await user.click(screen.getByRole('button', { name: 'Next' }));
  await user.click(screen.getByRole('radio', { name: '3' }));
  await user.click(screen.getByRole('button', { name: 'Review answers' }));
}

describe('CheckinPage', () => {
  beforeEach(() => {
    getCheckin.mockResolvedValue(mockCheckinView);
    submit.mockResolvedValue(stored);
  });

  it('asks one question per screen in program order with progress and the safety line', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByRole('heading', { level: 1, name: 'Week 1 check-in' })).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(COPD_SAFETY_LINE);
    expect(screen.getByText(mockCheckinView.intro)).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    const first = screen.getByRole('group', { name: mockCheckinView.questions[0].text });
    expect(within(first).getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual(['better', 'same', 'worse']);
    expect(screen.getByRole('heading', { level: 2 })).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'About the same' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
    expect(screen.queryByText(mockCheckinView.intro)).not.toBeInTheDocument();
    expect(within(screen.getByRole('group')).getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual(['yes', 'no']);

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByRole('radio', { name: 'About the same' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));

    const scale = screen.getByRole('group', { name: mockCheckinView.questions[2].text });
    expect(within(scale).getAllByRole('radio').map((r) => (r as HTMLInputElement).value)).toEqual(
      ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    );
    expect(screen.getByRole('note')).toHaveTextContent(COPD_SAFETY_LINE);
  });

  it('reviews, lets one answer change, and sends the values Map expects', async () => {
    const user = userEvent.setup();
    renderPage();
    await answerAll(user);

    expect(screen.getByRole('heading', { name: 'Check your answers' })).toHaveFocus();
    expect(screen.getByText('Worse')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Change answer: ${mockCheckinView.questions[1].text}` }));
    await user.click(screen.getByRole('radio', { name: 'Yes' }));
    expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Review answers' }));
    expect(screen.getByText('Yes')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).toHaveBeenCalledWith('ck_day7', [
      { question_id: 'breathing', value: 'worse' },
      { question_id: 'rescue_inhaler', value: 'yes' },
      { question_id: 'managing', value: 3 },
    ]);
    expect(await screen.findByRole('heading', { name: 'Answers sent' })).toHaveFocus();
    expect(screen.getByText('Thank you. Your care team can see your answers.')).toBeInTheDocument();
    expect(screen.getByRole('note')).toHaveTextContent(COPD_SAFETY_LINE);
    expect(screen.queryByText('CairCompanion')).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Done' }));
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('shows the CairCompanion follow-up Map started and sends the reply into that conversation', async () => {
    const user = userEvent.setup();
    submit.mockResolvedValue({
      ...stored,
      followup: {
        conversation_id: 'ckf_abc',
        question_id: 'breathing',
        message: "I'm sorry your breathing is worse. Can you tell me what has changed and when it started?",
      },
    });
    vi.mocked(healthDataService.replyInConversation).mockResolvedValue({ response: 'Thank you. I have passed this to your care team.' });
    renderPage();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Send answers' }));

    expect(await screen.findByText(/I'm sorry your breathing is worse/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send reply' })).toBeDisabled();
    await user.type(screen.getByLabelText('Your reply'), 'More short of breath since yesterday');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));
    expect(healthDataService.replyInConversation).toHaveBeenCalledWith('ckf_abc', 'More short of breath since yesterday');
    expect(await screen.findByText('Thank you. I have passed this to your care team.')).toBeInTheDocument();
    expect(screen.getByText('You replied: More short of breath since yesterday')).toBeInTheDocument();
  });

  it('keeps the reply when sending it fails', async () => {
    const user = userEvent.setup();
    submit.mockResolvedValue({ ...stored, followup: { conversation_id: 'ckf_abc', question_id: 'breathing', message: 'Can you tell me more?' } });
    vi.mocked(healthDataService.replyInConversation).mockRejectedValue(new APIError('down', 502));
    renderPage();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    await user.type(await screen.findByLabelText('Your reply'), 'Worse at night');
    await user.click(screen.getByRole('button', { name: 'Send reply' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not send your reply. Please try again.');
    expect(screen.getByLabelText('Your reply')).toHaveValue('Worse at night');
  });

  it('asks only what is still unanswered when some answers came by text or phone', async () => {
    const user = userEvent.setup();
    getCheckin.mockResolvedValue({ ...mockCheckinView, answers: { breathing: 'better' } });
    renderPage();
    expect(await screen.findByText('Question 1 of 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: mockCheckinView.questions[1].text })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(screen.getByRole('radio', { name: '10' }));
    await user.click(screen.getByRole('button', { name: 'Review answers' }));
    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(submit).toHaveBeenCalledWith('ck_day7', [
      { question_id: 'rescue_inhaler', value: 'no' },
      { question_id: 'managing', value: 10 },
    ]);
  });

  it('says so gently when every question is already answered', async () => {
    getCheckin.mockResolvedValue({ ...mockCheckinView, answers: { breathing: 'same', rescue_inhaler: 'no', managing: 6 } });
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Already answered' })).toHaveFocus();
    expect(screen.getByRole('note')).toHaveTextContent(COPD_SAFETY_LINE);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it.each([
    [404, 'This check-in is no longer open'],
    [409, 'This check-in has closed'],
  ])('handles a %s on load without alarm', async (status, title) => {
    getCheckin.mockRejectedValue(new APIError('gone', status));
    renderPage();
    expect(await screen.findByRole('heading', { name: title })).toHaveFocus();
    expect(screen.getByText('Thank you for checking. There is nothing to answer here now.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Done' })).toBeInTheDocument();
  });

  it('offers a retry when the check-in cannot load', async () => {
    const user = userEvent.setup();
    getCheckin.mockRejectedValueOnce(new APIError('Network error or server unavailable'));
    renderPage();
    expect(await screen.findByRole('heading', { name: 'We could not load this check-in' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Week 1 check-in' })).toBeInTheDocument();
    expect(getCheckin).toHaveBeenCalledTimes(2);
  });

  it('shows the closed screen when the check-in closes before sending', async () => {
    const user = userEvent.setup();
    submit.mockRejectedValue(new APIError('check-in is closed', 409));
    renderPage();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(await screen.findByRole('heading', { name: 'This check-in has closed' })).toBeInTheDocument();
  });

  it('keeps the answers and explains when sending fails or nothing is saved', async () => {
    const user = userEvent.setup();
    submit.mockRejectedValueOnce(new APIError('Network error or server unavailable'));
    submit.mockResolvedValueOnce({ ...stored, stored: [], rejected: [{ question_id: 'breathing', reason: 'no_match' }] });
    renderPage();
    await answerAll(user);
    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not send your answers. Please check your connection and try again.');
    await user.click(screen.getByRole('button', { name: 'Send answers' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('We could not save your answers. Please try again.');
    expect(screen.getByText('Worse')).toBeInTheDocument();
  });
});
