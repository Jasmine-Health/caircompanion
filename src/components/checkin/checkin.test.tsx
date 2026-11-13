import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { CheckinBanner } from './CheckinBanner';
import { CheckinQuestionField } from './CheckinQuestionField';
import * as checkinService from '../../services/checkinService';
import { COPD_SAFETY_LINE, mockCheckinView, mockOpenCheckin } from '../../test/checkinFixtures';
import type { CheckinAnswer, NumberQuestion } from '../../services/checkinService';

vi.mock('../../services/checkinService');

const getOpen = vi.mocked(checkinService.getOpenCheckins);
const getCheckin = vi.mocked(checkinService.getCheckin);

function renderBanner(path = '/voice') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <CheckinBanner />
      <Routes>
        <Route path="*" element={<Link to="/dashboard">Go to dashboard</Link>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CheckinBanner', () => {
  beforeEach(() => {
    getOpen.mockResolvedValue([mockOpenCheckin]);
    getCheckin.mockResolvedValue(mockCheckinView);
  });

  it('shows the open check-in with its intro, a link to answer and the safety line', async () => {
    renderBanner();
    expect(await screen.findByRole('heading', { name: 'Week 1 check-in' })).toBeInTheDocument();
    expect(screen.getByText(mockCheckinView.intro)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Answer now' })).toHaveAttribute('href', '/checkin/ck_day7');
    expect(screen.getByRole('note')).toHaveTextContent(COPD_SAFETY_LINE);
    expect(getCheckin).toHaveBeenCalledWith('ck_day7');
  });

  it('can be put off with Not now and does not refetch the same check-in on navigation', async () => {
    const user = userEvent.setup();
    renderBanner();
    await user.click(await screen.findByRole('button', { name: 'Not now' }));
    expect(screen.queryByRole('heading', { name: 'Week 1 check-in' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Go to dashboard' }));
    await waitFor(() => expect(getOpen).toHaveBeenCalledTimes(2));
    expect(getCheckin).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('heading', { name: 'Week 1 check-in' })).not.toBeInTheDocument();
  });

  it('goes away once nothing is open', async () => {
    renderBanner();
    expect(await screen.findByRole('heading', { name: 'Week 1 check-in' })).toBeInTheDocument();
    getOpen.mockResolvedValue([]);
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
    });
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Week 1 check-in' })).not.toBeInTheDocument());
  });

  it('shows nothing when there is no check-in or the service cannot be reached', async () => {
    getOpen.mockResolvedValueOnce([]);
    const { unmount } = renderBanner();
    await waitFor(() => expect(getOpen).toHaveBeenCalled());
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
    expect(getCheckin).not.toHaveBeenCalled();
    unmount();

    getOpen.mockRejectedValueOnce(new Error('404'));
    renderBanner();
    await waitFor(() => expect(getOpen).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('link', { name: 'Answer now' })).not.toBeInTheDocument();
  });

  it.each(['/checkin/ck_day7', '/chat'])('stays out of the way on %s', async (path) => {
    renderBanner(path);
    await waitFor(() => expect(getCheckin).toHaveBeenCalled());
    expect(screen.queryByRole('link', { name: 'Answer now' })).not.toBeInTheDocument();
  });
});

function NumberHarness({ question }: { question: NumberQuestion }) {
  const [value, setValue] = useState<CheckinAnswer | undefined>();
  return (
    <>
      <CheckinQuestionField question={question} value={value} onChange={setValue} />
      <output>{value === undefined ? 'none' : String(value)}</output>
    </>
  );
}

describe('CheckinQuestionField', () => {
  it('uses a labelled number field for a range too wide for buttons', async () => {
    const user = userEvent.setup();
    render(<NumberHarness question={{ id: 'weight', type: 'number', text: 'What is your weight today?', min: 50, max: 500, unit: 'lb' }} />);
    const field = screen.getByLabelText('Your answer');
    expect(field).toHaveAccessibleDescription('A number from 50 to 500 lb');
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();

    await user.type(field, '600');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('none');

    await user.clear(field);
    await user.type(field, '182');
    expect(field).toHaveAttribute('aria-invalid', 'false');
    expect(screen.getByRole('status')).toHaveTextContent('182');
  });
});
