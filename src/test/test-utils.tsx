import { type ReactNode } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(ui: ReactNode, initialPath = '/') {
  return render(<MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>);
}
