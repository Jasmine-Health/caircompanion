import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Input } from './Input';

describe('ui components', () => {
  it('renders button variants and loading state', () => {
    const { rerender } = render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();

    rerender(
      <Button variant="danger" size="lg" isLoading>
        Save
      </Button>
    );
    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
  });

  it('renders input with label, icon, and error', () => {
    render(
      <Input
        label="Email"
        error="Required"
        icon={<span data-testid="icon">@</span>}
        placeholder="Enter email"
      />
    );
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Title</CardTitle>
        </CardHeader>
        <CardContent>Body</CardContent>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
  });

  it('renders badge variants and avatar fallback', () => {
    render(
      <>
        <Badge variant="success">Active</Badge>
        <Avatar name="Jane Doe" />
      </>
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });
});
