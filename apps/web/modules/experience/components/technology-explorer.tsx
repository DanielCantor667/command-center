'use client';

import dynamic from 'next/dynamic';
import { useRef, useState, type CSSProperties } from 'react';
import { PROJECTS } from '../../../data/projects';
import {
  filterTechnologies,
  PORTFOLIO_TECHNOLOGIES,
  TECHNOLOGY_CATEGORIES,
  type PortfolioTechnology,
  type TechnologyCategory,
} from '../../../data/portfolio-technologies';
import { TECHNOLOGY_ICON_PATHS } from '../../../data/technology-icons';
import styles from './technology-explorer.module.css';

const Icon3D = dynamic(
  () => import('./technology-icon-3d').then((module) => module.TechnologyIcon3D),
  { ssr: false },
);
export interface TechnologyFilters {
  query: string;
  category: TechnologyCategory | 'all';
  projectId: string | null;
}
export interface TechnologyExplorerProps {
  initialFilters?: TechnologyFilters;
  onFiltersChange?: (filters: TechnologyFilters) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onProjectSelect: (id: string) => void;
}
function Mark({ technology }: { technology: PortfolioTechnology }) {
  const paths = TECHNOLOGY_ICON_PATHS[technology.icon];
  return paths ? (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {paths.map((path, index) => (
        <path key={index} d={path} />
      ))}
    </svg>
  ) : (
    <span>{technology.shortName}</span>
  );
}
export function TechnologyExplorer({
  selectedId,
  onSelect,
  onProjectSelect,
  initialFilters,
  onFiltersChange,
}: TechnologyExplorerProps) {
  const detailRef = useRef<HTMLElement>(null);
  const [filters, setFilters] = useState<TechnologyFilters>(
    initialFilters ?? { query: '', category: 'all', projectId: null },
  );
  const { query, category, projectId: projectFilter } = filters;
  const updateFilters = (patch: Partial<TechnologyFilters>) => {
    const next = { ...filters, ...patch };
    setFilters(next);
    onFiltersChange?.(next);
  };
  const selected =
    PORTFOLIO_TECHNOLOGIES.find((item) => item.id === selectedId) ?? PORTFOLIO_TECHNOLOGIES[0]!;
  const filtered = filterTechnologies(query, category).filter(
    (item) => !projectFilter || item.projectIds.includes(projectFilter),
  );
  const projects = PROJECTS.filter(
    (project) => selected.projectIds.includes(project.id) && project.public,
  );
  const selectCategory = (id: TechnologyCategory | 'all') => {
    updateFilters({ category: id, projectId: null });
  };
  return (
    <div className={styles.explorer}>
      <div className={styles.tools}>
        <label className={styles.search}>
          <span>Buscar tecnología</span>
          <input
            type="search"
            placeholder="Nombre, herramienta o concepto…"
            value={query}
            onChange={(event) => updateFilters({ query: event.target.value })}
          />
        </label>
        <span className={styles.count} role="status">
          {filtered.length} {filtered.length === 1 ? 'tecnología' : 'tecnologías'}
        </span>
      </div>
      <div className={styles.body}>
        <nav className={styles.categories} aria-label="Categorías de tecnologías">
          <button
            type="button"
            aria-pressed={category === 'all'}
            onClick={() => selectCategory('all')}
          >
            Todas <span>{PORTFOLIO_TECHNOLOGIES.length}</span>
          </button>
          {TECHNOLOGY_CATEGORIES.map((item) => (
            <button
              type="button"
              key={item.id}
              aria-pressed={category === item.id}
              onClick={() => selectCategory(item.id)}
            >
              {item.label}
              <span>
                {PORTFOLIO_TECHNOLOGIES.filter((tech) => tech.category === item.id).length}
              </span>
            </button>
          ))}
          <p>Herramientas con las que construyo.</p>
        </nav>
        <div className={styles.catalog}>
          {projectFilter && (
            <div className={styles.filterNotice}>
              <span>Stack de {PROJECTS.find((p) => p.id === projectFilter)?.name}</span>
              <button type="button" onClick={() => updateFilters({ projectId: null })}>
                Quitar filtro
              </button>
            </div>
          )}
          <div className={styles.grid} role="group" aria-label="Catálogo de tecnologías">
            {filtered.map((technology) => (
              <button
                type="button"
                className={styles.tile}
                key={technology.id}
                style={{ '--tech-color': technology.color } as CSSProperties}
                aria-pressed={technology.id === selected.id}
                aria-label={`Explorar ${technology.name}`}
                onClick={() => {
                  onSelect(technology.id);
                  if (window.matchMedia('(max-width:800px)').matches)
                    detailRef.current?.scrollIntoView({
                      block: 'start',
                      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
                        ? 'instant'
                        : 'smooth',
                    });
                }}
              >
                <span className={styles.keycap}>
                  <span className={styles.face}>
                    <Mark technology={technology} />
                  </span>
                </span>
                <span className={styles.tileName}>{technology.name}</span>
              </button>
            ))}
          </div>
          {!filtered.length && (
            <div className={styles.empty}>
              <h3>No hay coincidencias</h3>
              <p>Prueba otro nombre o explora todas las tecnologías.</p>
              <button
                type="button"
                onClick={() => {
                  updateFilters({ query: '', category: 'all', projectId: null });
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
        <aside
          ref={detailRef}
          className={styles.detail}
          aria-label="Detalle de tecnología"
          style={{ '--tech-color': selected.color } as CSSProperties}
        >
          <div className={styles.inspector}>
            <Icon3D
              id={selected.id}
              name={selected.name}
              fallback={
                <div className={styles.fallback}>
                  <span className={styles.keycap}>
                    <span className={styles.face}>
                      <Mark technology={selected} />
                    </span>
                  </span>
                </div>
              }
            />
          </div>
          <div className={styles.detailCopy}>
            <p className={styles.category}>
              {TECHNOLOGY_CATEGORIES.find((item) => item.id === selected.category)?.label}
            </p>
            <h3 aria-live="polite">{selected.name}</h3>
            <p>{selected.description}</p>
            <h4>En mis proyectos</h4>
            {projects.length ? (
              <ul className={styles.projectLinks}>
                {projects.map((project) => (
                  <li key={project.id}>
                    <button type="button" onClick={() => onProjectSelect(project.id)}>
                      {project.name}
                      <span>Ver proyecto</span>
                    </button>
                    <button
                      className={styles.stackLink}
                      type="button"
                      aria-label={`Ver tecnologías de ${project.name}`}
                      onClick={() => {
                        updateFilters({ projectId: project.id, category: 'all', query: '' });
                      }}
                    >
                      Ver stack
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.source}>
                Incluida en mi CV. Aún sin un proyecto asociado en este portafolio.
              </p>
            )}
            <p className={styles.source}>
              {selected.source === 'cv'
                ? 'Fuente: CV de Daniel.'
                : 'Fuente: CV y documentación de proyectos.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
