import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppContainer } from '../component';

describe('AppContainer', () => {
  it('renders its children', () => {
    render(
      <AppContainer>
        <span>shell content</span>
      </AppContainer>,
    );

    expect(screen.getByText('shell content')).toBeInTheDocument();
  });

  it('fills the viewport and clips overflow', () => {
    render(<AppContainer data-testid="container">content</AppContainer>);

    expect(screen.getByTestId('container')).toHaveClass('h-screen', 'w-full', 'overflow-hidden');
  });
});
