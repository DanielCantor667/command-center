import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WorkspaceProvider } from '../component';

describe('WorkspaceProvider', () => {
  it('renders its children', () => {
    render(
      <WorkspaceProvider>
        <span>workspace content</span>
      </WorkspaceProvider>,
    );

    expect(screen.getByText('workspace content')).toBeInTheDocument();
  });
});
