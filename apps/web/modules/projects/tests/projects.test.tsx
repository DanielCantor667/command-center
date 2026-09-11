import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { PROJECTS } from '../../../data/projects';
import { useWorkspaceStore } from '../../../shell/workspace-store';
import { ProjectsModule } from '../component';

beforeEach(() => {
  useWorkspaceStore.setState({ currentModule: 'projects', selectedProjectId: null });
});

afterEach(() => {
  useWorkspaceStore.setState({ currentModule: null });
});

const featuredProject = PROJECTS.find((p) => p.featured);

describe('ProjectsModule', () => {
  it('reviews published cases in order and opens the contact module', () => {
    const cases = PROJECTS.filter((project) => project.public && project.links.live);
    useWorkspaceStore.setState({ selectedProjectId: cases[0]!.id });
    render(<ProjectsModule />);
    expect(screen.getByRole('heading', { name: cases[0]!.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('heading', { name: cases[1]!.name })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }));
    expect(screen.getByRole('link', { name: 'Visitar sitio ↗' })).toHaveAttribute('href', cases[0]!.links.live);
    fireEvent.click(screen.getByRole('button', { name: 'Contactar a Daniel' }));
    expect(useWorkspaceStore.getState().currentModule).toBe('communication');
  });
  it('renders featured project name as h1', () => {
    render(<ProjectsModule />);

    if (featuredProject) {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(featuredProject.name);
      expect(screen.getByText(featuredProject.tagline)).toBeInTheDocument();
    }
  });

  it('renders featured project status', () => {
    render(<ProjectsModule />);

    if (featuredProject) {
      expect(screen.getByText(`Estado: ${featuredProject.status}`)).toBeInTheDocument();
    }
  });

  it('renders the featured project action', () => {
    render(<ProjectsModule />);

    expect(screen.getByRole('button', { name: 'Abrir proyecto' })).toBeInTheDocument();
  });

  it('renders all public projects in grid', () => {
    render(<ProjectsModule />);

    const publicProjects = PROJECTS.filter((p) => p.public);
    const first = publicProjects[0];
    if (first) {
      const allNames = screen.getAllByText(first.name);
      expect(allNames.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows empty state when no project selected', () => {
    render(<ProjectsModule />);

    expect(screen.getByText('Select a project')).toBeInTheDocument();
    expect(
      screen.getByText('Select a project to explore its engineering story.'),
    ).toBeInTheDocument();
  });

  it('opens project detail from the featured action', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject) {
      const taglines = screen.getAllByText(featuredProject.tagline);
      expect(taglines.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(`Rol: ${featuredProject.role.title}`)).toBeInTheDocument();

      if (featuredProject.engineeringDecisions.length > 0) {
        expect(screen.getByText('Engineering Decisions')).toBeInTheDocument();
      }

      if (featuredProject.lessonsLearned.length > 0) {
        expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
      }
    }
  });

  it('opens project detail on project card click', () => {
    render(<ProjectsModule />);

    const featured = featuredProject;
    if (featured) {
      const card = screen.getByRole('button', { name: 'Abrir proyecto' });
      fireEvent.click(card);
      expect(screen.getByText(`Rol: ${featured.role.title}`)).toBeInTheDocument();
    }
  });

  it('renders engineering decisions section', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject && featuredProject.engineeringDecisions.length > 0) {
      expect(screen.getByText('Engineering Decisions')).toBeInTheDocument();
      for (const decision of featuredProject.engineeringDecisions) {
        expect(screen.getByText(decision.title)).toBeInTheDocument();
        expect(screen.getByText(decision.decision)).toBeInTheDocument();
        expect(screen.getByText(decision.reasoning)).toBeInTheDocument();
      }
    }
  });

  it('renders lessons learned section', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject && featuredProject.lessonsLearned.length > 0) {
      expect(screen.getByText('Lessons Learned')).toBeInTheDocument();
      for (const lesson of featuredProject.lessonsLearned) {
        expect(screen.getByText(lesson.title)).toBeInTheDocument();
        expect(screen.getByText(lesson.description)).toBeInTheDocument();
      }
    }
  });

  it('renders tech stack section', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject && featuredProject.technologies.length > 0) {
      expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    }
  });

  it('renders architecture section', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject && featuredProject.architecture.length > 0) {
      expect(screen.getByText('Architecture')).toBeInTheDocument();
    }
  });

  it('renders features section', () => {
    render(<ProjectsModule />);

    fireEvent.click(screen.getByRole('button', { name: 'Abrir proyecto' }));

    if (featuredProject && featuredProject.features.length > 0) {
      expect(screen.getByText('Features')).toBeInTheDocument();
    }
  });

  it('uses PROJECTS as single source of truth', () => {
    render(<ProjectsModule />);

    const publicProjects = PROJECTS.filter((p) => p.public);
    const projectSection = screen.getByRole('heading', { level: 2, name: 'Proyectos' });
    expect(projectSection).toBeInTheDocument();

    for (const project of publicProjects) {
      const matches = screen.getAllByText(project.name);
      expect(matches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ProjectsModule />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
