import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pill } from 'lucide-react';
import { TrackerObservationsPage } from './TrackerObservationsPage';
import { APIError } from '../config/api';

describe('TrackerObservationsPage', () => {
  it('loads and renders observation rows', async () => {
    const fetchData = vi.fn().mockResolvedValue({
      patient_id: 'p1',
      type: 'medication',
      count: 1,
      observations: [
        {
          id: '1',
          patient_id: 'p1',
          observation_type: 'medication',
          code: 'med',
          display: 'Aspirin',
          value: 1,
          value_string: '1 tablet',
          unit: 'tablet',
          source: 'manual',
          source_ref: 'ref',
          confidence: 1,
          effective_date: '2026-01-01',
          recorded_at: '2026-01-01T10:00:00Z',
          status: 'final',
        },
      ],
    });

    render(
      <TrackerObservationsPage
        title="Medications"
        subtitle="Medication records"
        icon={Pill}
        iconColor="text-purple-600"
        bgColor="bg-purple-100"
        fetchData={fetchData}
      />
    );

    await waitFor(() => expect(screen.getByText('Aspirin')).toBeInTheDocument());
    expect(fetchData).toHaveBeenCalled();
  });

  it('shows API error and retries load', async () => {
    const fetchData = vi
      .fn()
      .mockRejectedValueOnce(new APIError('Tracker unavailable', 503))
      .mockResolvedValueOnce({
        patient_id: 'p1',
        type: 'medication',
        count: 0,
        observations: [],
      });

    render(
      <TrackerObservationsPage
        title="Medications"
        subtitle="Medication records"
        icon={Pill}
        iconColor="text-purple-600"
        bgColor="bg-purple-100"
        fetchData={fetchData}
        useDateRange={false}
      />
    );

    expect(await screen.findByText('Tracker unavailable')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    await waitFor(() => expect(fetchData).toHaveBeenCalledTimes(2));
  });
});
