import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarePlanDetailModal } from './CarePlanDetailModal';
import { InstallPromptModal } from './InstallPromptModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

import * as healthDataService from '../services/healthDataService';
import { mockCarePlanDetail } from '../test/healthFixtures';

vi.mock('../services/healthDataService', () => ({
  getCarePlanDetail: vi.fn(),
}));

const richPlanDetail = {
  ...mockCarePlanDetail,
  description: 'Details',
  instructions: [{ section_type: 'note', title: 'Note', content: 'Rest well' }],
  patient_context: {
    ...mockCarePlanDetail.patient_context!,
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
