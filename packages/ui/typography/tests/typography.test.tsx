import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Body, Caption, Display, Heading, Mono, Title, Typography } from '../component';

describe('Typography', () => {
  it('renders body variant as a <p> by default', () => {
    render(<Typography>text</Typography>);
    expect(screen.getByText('text').tagName).toBe('P');
  });

  it('renders display-xl variant as an <h1> with the display-xl className', () => {
    render(<Typography variant="display-xl">Headline</Typography>);
    const el = screen.getByText('Headline');
    expect(el.tagName).toBe('H1');
    expect(el).toHaveClass('text-display-xl');
  });

  it('allows overriding the rendered element via `as`', () => {
    render(
      <Typography variant="body" as="span">
        inline
      </Typography>,
    );
    expect(screen.getByText('inline').tagName).toBe('SPAN');
  });

  it('applies color and align classNames', () => {
    render(
      <Typography color="muted" align="center">
        text
      </Typography>,
    );
    const el = screen.getByText('text');
    expect(el).toHaveClass('text-text-muted');
    expect(el).toHaveClass('text-center');
  });

  it('truncates when requested', () => {
    render(<Typography truncate>text</Typography>);
    expect(screen.getByText('text')).toHaveClass('truncate');
  });

  it('exposes Display/Heading/Title/Body/Caption/Mono convenience primitives', () => {
    render(
      <div>
        <Display>display</Display>
        <Heading>heading</Heading>
        <Title>title</Title>
        <Body>body</Body>
        <Caption>caption</Caption>
        <Mono>mono</Mono>
      </div>,
    );
    expect(screen.getByText('display').tagName).toBe('H1');
    expect(screen.getByText('heading').tagName).toBe('H2');
    expect(screen.getByText('title').tagName).toBe('H4');
    expect(screen.getByText('body').tagName).toBe('P');
    expect(screen.getByText('caption').tagName).toBe('SPAN');
    expect(screen.getByText('mono').tagName).toBe('CODE');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <div>
        <Display>Headline</Display>
        <Body>Body copy</Body>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
