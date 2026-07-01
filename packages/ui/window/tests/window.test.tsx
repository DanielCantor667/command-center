import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Window, WindowContent, WindowFooter, WindowHeader } from '../component';

describe('Window', () => {
  it('renders header, content and footer sections', () => {
    render(
      <Window data-testid="window">
        <WindowHeader>Title</WindowHeader>
        <WindowContent>Body</WindowContent>
        <WindowFooter>Actions</WindowFooter>
      </Window>,
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Body')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('applies the default state border className', () => {
    render(<Window data-testid="window">content</Window>);
    expect(screen.getByTestId('window')).toHaveClass('border-panel-border');
  });

  it('applies the focused state border className', () => {
    render(
      <Window data-testid="window" state="focused">
        content
      </Window>,
    );
    expect(screen.getByTestId('window')).toHaveClass('border-accent');
  });

  it('applies the inactive state className', () => {
    render(
      <Window data-testid="window" state="inactive">
        content
      </Window>,
    );
    expect(screen.getByTestId('window')).toHaveClass('opacity-80');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <Window>
        <WindowHeader>Title</WindowHeader>
        <WindowContent>Body</WindowContent>
      </Window>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
