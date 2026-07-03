import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommunicationModule } from '../component';

describe('CommunicationModule', () => {
  it('renders its title and description', () => {
    render(<CommunicationModule />);

    expect(screen.getByText('COMMUNICATION')).toBeInTheDocument();
    expect(screen.getByText('Communication has no module yet.')).toBeInTheDocument();
  });
});
