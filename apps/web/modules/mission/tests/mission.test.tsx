import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { MILESTONES } from '../../../data/mission-log';
import { useWorkspaceStore } from '../../../shell/workspace-store';
import { MissionModule } from '../component';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: 'mission' });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

describe('MissionModule', () => {
  it('renders the page title', () => {
    render(<MissionModule />);

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mission Log');
  });

  it('renders the subtitle', () => {
    render(<MissionModule />);

    expect(
      screen.getByText('Engineering milestones that shaped how I build software.'),
    ).toBeInTheDocument();
  });

  it('renders all milestone titles in timeline', () => {
    render(<MissionModule />);

    for (const milestone of MILESTONES) {
      expect(screen.getByText(milestone.title)).toBeInTheDocument();
    }
  });

  it('renders filter selects with accessible labels', () => {
    render(<MissionModule />);

    expect(screen.getByLabelText('Year')).toBeInTheDocument();
    expect(screen.getByLabelText('Architecture')).toBeInTheDocument();
    expect(screen.getByLabelText('Technology')).toBeInTheDocument();
    expect(screen.getByLabelText('Project')).toBeInTheDocument();
  });

  it('expands milestone detail on click', () => {
    render(<MissionModule />);

    const ms = MILESTONES[0];
    if (!ms) return;

    const button = screen.getByText(ms.title).closest('button');
    expect(button).toBeInTheDocument();

    if (button) {
      fireEvent.click(button);
      expect(screen.getByText(ms.description)).toBeInTheDocument();
      expect(screen.getByText(ms.outcome)).toBeInTheDocument();
    }
  });

  it('renders technology chips in expanded milestone', () => {
    render(<MissionModule />);

    const ms = MILESTONES[0];
    if (!ms || ms.technologies.length === 0) return;

    const button = screen.getByText(ms.title).closest('button');
    if (button) {
      fireEvent.click(button);
      for (const tech of ms.technologies) {
        const matches = screen.getAllByText(tech.name);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('renders architecture chips in expanded milestone', () => {
    render(<MissionModule />);

    const ms = MILESTONES[0];
    if (!ms || ms.architecture.length === 0) return;

    const button = screen.getByText(ms.title).closest('button');
    if (button) {
      fireEvent.click(button);
      for (const pattern of ms.architecture) {
        const matches = screen.getAllByText(pattern);
        expect(matches.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('renders project references for milestones with related projects', () => {
    render(<MissionModule />);

    const milestoneWithProjects = MILESTONES.find(
      (m) => m.relatedProjects.length > 0,
    );

    if (milestoneWithProjects) {
      for (const projectId of milestoneWithProjects.relatedProjects) {
        const refs = screen.getAllByText(projectId, { exact: false });
        expect(refs.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MissionModule />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
