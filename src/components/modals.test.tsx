import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CarePlanDetailModal } from './CarePlanDetailModal';
import { InstallPromptModal } from './InstallPromptModal';
import { TermsAndConditionsModal } from './TermsAndConditionsModal';

vi.mock('../services/healthDataService', () => ({
  getCarePlanDetail: vi.fn().mockResolvedValue({
    plan_id: 'plan-1',
    name: 'Recovery Plan',
    description: 'Details',
    type: 'general',
    phase: '1',
    status: 'active',
    plan_type: 'care',
    activities: [{ title: 'Walk daily' }],
    instructions: [{ section_type: 'note', title: 'Note', content: 'Rest well' }],
  }),
}));

describe('modal components', () => {
  it('loads and shows care plan details', async () => {
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
  });

  it('renders install instructions per platform', () => {
    render(<InstallPromptModal isOpen onClose={vi.fn()} platform="ios" />);
    expect(screen.getByText(/Install CairCompanion/i)).toBeInTheDocument();
  });

  it('shows legal links in terms modal', () => {
    render(<TermsAndConditionsModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('link', { name: /Privacy Policy/i })).toHaveAttribute(
      'href',
      'https://pulpdigital.ai/privacy-policy.html'
    );
  });
});
