import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ModulePlaceholder } from '../component';

describe('ModulePlaceholder', () => {
  it('renders the title uppercased and the description', () => {
    render(<ModulePlaceholder title="Lab" description="Lab has no module yet." />);

    expect(screen.getByText('LAB')).toBeInTheDocument();
    expect(screen.getByText('Lab has no module yet.')).toBeInTheDocument();
  });
});
