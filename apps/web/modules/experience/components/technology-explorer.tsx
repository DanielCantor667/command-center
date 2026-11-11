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
import { fill } from '../../../i18n/format';
import { useDictionary } from '../../../i18n/locale-provider';

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
  presentation?: 'scene' | 'html';
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
  presentation = 'scene',
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
  const t = useDictionary().technologies;
  const selectCategory = (id: TechnologyCategory | 'all') => {
    updateFilters({ category: id, projectId: null });
  };
  return (
    <div className={`${styles.explorer} ${presentation === 'html' ? styles.html : ''}`} data-technology-presentation={presentation}>
      <div className={styles.tools}>
        <label className={styles.search}>
          <span>{t.search}</span>
          <input
            type="search"
            placeholder={t.placeholder}
            value={query}
            onChange={(event) => updateFilters({ query: event.target.value })}
          />
        </label>
        <span className={styles.count} role="status">
          {filtered.length} {filtered.length === 1 ? t.one : t.many}
        </span>
      </div>
      <div className={styles.body}>
        <nav className={styles.categories} aria-label={t.categories}>
          <button
            type="button"
            aria-pressed={category === 'all'}
            onClick={() => selectCategory('all')}
          >
            {t.all} <span>{PORTFOLIO_TECHNOLOGIES.length}</span>
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
          <p>{t.tagline}</p>
        </nav>
        <div className={styles.catalog}>
          {projectFilter && (
            <div className={styles.filterNotice}>
              <span>{fill(t.stackOf, { name: PROJECTS.find((p) => p.id === projectFilter)?.name ?? '' })}</span>
              <button type="button" onClick={() => updateFilters({ projectId: null })}>
                {t.clearFilter}
              </button>
            </div>
          )}
          <div className={styles.grid} role="group" aria-label={t.catalog}>
            {filtered.map((technology) => (
              <button
                type="button"
                className={styles.tile}
                key={technology.id}
                style={{ '--tech-color': technology.color } as CSSProperties}
                aria-pressed={technology.id === selected.id}
                aria-label={fill(t.explore, { name: technology.name })}
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
              <h3>{t.empty}</h3>
              <p>{t.emptyHint}</p>
              <button
                type="button"
                onClick={() => {
                  updateFilters({ query: '', category: 'all', projectId: null });
                }}
              >
                {t.clear}
              </button>
            </div>
          )}
        </div>
        <aside
          ref={detailRef}
          className={styles.detail}
          aria-label={t.detail}
          style={{ '--tech-color': selected.color } as CSSProperties}
        >
          <div className={styles.inspector}>
            {presentation === 'html' ? <div className={styles.htmlMark} role="img" aria-label={fill(t.mark, { name: selected.name })}><Mark technology={selected} /></div> : <Icon3D
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
            />}
          </div>
          <div className={styles.detailCopy}>
            <p className={styles.category}>
              {TECHNOLOGY_CATEGORIES.find((item) => item.id === selected.category)?.label}
            </p>
            <h3 aria-live="polite">{selected.name}</h3>
            <p>{selected.description}</p>
            <h4>{t.inProjects}</h4>
            {projects.length ? (
              <ul className={styles.projectLinks}>
                {projects.map((project) => (
                  <li key={project.id}>
                    <button type="button" onClick={() => onProjectSelect(project.id)}>
                      {project.name}
                      <span>{t.viewProject}</span>
                    </button>
                    <button
                      className={styles.stackLink}
                      type="button"
                      aria-label={fill(t.stackLabel, { name: project.name })}
                      onClick={() => {
                        updateFilters({ projectId: project.id, category: 'all', query: '' });
                      }}
                    >
                      {t.viewStack}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.source}>
                {selected.source === 'declared' ? t.noProjectDeclared : t.noProjectCv}
              </p>
            )}
            <p className={styles.source}>
              {selected.source === 'declared' ? t.sourceDeclared : selected.source === 'cv' ? t.sourceCv : t.sourceBoth}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
