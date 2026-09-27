import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplashScreen } from './SplashScreen';

describe('shared components', () => {
  it('renders splash screen branding', () => {
    render(<SplashScreen fading={false} />);
    expect(screen.getByText('CairCompanion')).toBeInTheDocument();
    expect(screen.getByAltText('CairCompanion')).toBeInTheDocument();
  });
});
