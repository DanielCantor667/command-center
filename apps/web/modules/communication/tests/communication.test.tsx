import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunicationModule } from '../component';

describe('CommunicationModule', () => {
  it('renders professional contact channels', () => {
    render(<CommunicationModule />);

    expect(screen.getByRole('heading', { name: 'Hablemos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Escribir por LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/daniel-cantor-84435a345/');
  });
});
