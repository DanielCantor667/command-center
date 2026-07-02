import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Panel } from '../component';

describe('Panel', () => {
  it('renders children in a div with sensible spacing defaults', () => {
    render(<Panel data-testid="panel">content</Panel>);
    const el = screen.getByTestId('panel');
    expect(el).toHaveClass('p-16');
    expect(el).toHaveClass('rounded-lg');
    expect(el).toHaveClass('border');
  });

  it('allows overriding the padding default', () => {
    render(
      <Panel data-testid="panel" padding="sm">
        content
      </Panel>,
    );
    expect(screen.getByTestId('panel')).toHaveClass('p-8');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Panel>content</Panel>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
