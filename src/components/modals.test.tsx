import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarePlanDetailModal } from './CarePlanDetailModal';
import { InstallPromptModal } from './InstallPromptModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

import * as healthDataService from '../services/healthDataService';

vi.mock('../services/healthDataService', () => ({
  getCarePlanDetail: vi.fn(),
}));

const richPlanDetail = {
  plan_id: 'plan-1',
  name: 'Recovery Plan',
  description: 'Details',
  type: 'general',
  phase: '1',
  status: 'active',
  plan_type: 'care',
  activities: ['Walk daily'],
  instructions: [{ section_type: 'note', title: 'Note', content: 'Rest well' }],
  steps: [
    {
      step_id: 'st-1',
      label: 'Walk',
      status: 'followed_through',
      due_date: '2026-01-01',
      followed_through_at: '2026-01-02',
      description: 'Easy pace',
      type: 'exercise',
      priority: 'low',
    },
  ],
  patient_context: {
    medications: [{ name: 'Med', dosage: '1mg', frequency: 'Daily', timing: 'AM', instructions: 'With food' }],
    monitoring: [{ name: 'BP', value_string: '120/80', effective_date: '2026-01-01' }],
    conditions: [{ title: 'HF', code: 'I50' }],
    allergies: ['Latex'],
  },
};

describe('modal components', () => {
  it('loads and shows care plan details', async () => {
    vi.mocked(healthDataService.getCarePlanDetail).mockResolvedValue(richPlanDetail);
    render(
      <CarePlanDetailModal
        isOpen
        onClose={vi.fn()}
        planId="plan-1"
        planName="Recovery Plan"
      />
    );
    expect(await screen.findByText('Recovery Plan')).toBeInTheDocument();
    expect(await screen.findByText('Rest well')).toBeInTheDocument();
    expect(await screen.findByText('Latex')).toBeInTheDocument();
  });

  it('shows care plan load error state', async () => {
    vi.mocked(healthDataService.getCarePlanDetail).mockRejectedValue(new Error('fail'));
    render(
      <CarePlanDetailModal isOpen onClose={vi.fn()} planId="plan-1" planName="Recovery Plan" />
    );
    expect(await screen.findByText(/Failed to load care plan/i)).toBeInTheDocument();
  });

  it('renders install instructions per platform', () => {
    const ios = render(<InstallPromptModal isOpen onClose={vi.fn()} platform="ios" />);
    expect(screen.getByText(/Install CairCompanion/i)).toBeInTheDocument();
    ios.unmount();

    render(<InstallPromptModal isOpen onClose={vi.fn()} platform="android" />);
    expect(screen.getByText(/Add to Home screen/i)).toBeInTheDocument();
  });

  it('shows legal links in terms modal', () => {
    render(<TermsAndConditionsModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute(
      'href',
      'https://pulpdigital.ai/privacy-policy.html'
    );
  });
});
