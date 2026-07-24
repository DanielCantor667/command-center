'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { getEvidence } from '../../domain/evidence';
import { KNOWLEDGE_GRAPH } from '../../domain/knowledge-graph';
import { PROJECTS } from '../../data/projects';
import type { WorkspaceModule } from '../../shell/workspace-store';
import styles from './experience.module.css';

interface ExperienceModuleProps {
  onEnter: (module?: WorkspaceModule) => void;
}

const navigation = [
  ['projects', 'Proyectos'],
  ['knowledge', 'Conocimiento'],
  ['mission', 'Misión'],
  ['analytics', 'Analytics'],
  ['evidence', 'Evidencia'],
  ['about', 'Perfil'],
] as const;

const projectDistricts = [
  'command',
  'logistics',
  'media',
  'campus',
  'pavilion',
  'academy',
] as const;

const missionPhases = [
  ['Foundation Engine', 'Arquitectura y sistema de diseño', 'Q1 2026'],
  ['Knowledge Graph', 'Relaciones derivadas y queries', 'Q2 2026'],
  ['3D Office Studio', 'Espacios versionados y Blender', 'Q3 2026'],
  ['Analytics Engine', 'Inteligencia explicable', 'Ahora'],
] as const;

export function ExperienceModule({ onEnter }: ExperienceModuleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const evidence = useMemo(() => getEvidence(), []);
  const topTechnologies = useMemo(
    () =>
      [...evidence.technologyExperiences]
        .sort((a, b) => b.projects - a.projects)
        .slice(0, 7),
    [evidence],
  );
  const graphStats = {
    nodes: KNOWLEDGE_GRAPH.nodes.length,
    edges: KNOWLEDGE_GRAPH.edges.length,
  };

  const enter = (module?: WorkspaceModule) => {
    setMenuOpen(false);
    onEnter(module);
  };

  return (
    <main className={styles.experience}>
      <header className={styles.navbar}>
        <a className={styles.brand} href="#top" aria-label="Command Center — inicio">
          <span className={styles.brandMark} aria-hidden="true">C</span>
          <span>Command<br />Center</span>
        </a>
        <button
          className={styles.menuButton}
          type="button"
          aria-expanded={menuOpen}
          aria-controls="experience-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? 'Cerrar' : 'Menú'}
        </button>
        <nav
          id="experience-navigation"
          className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}
          aria-label="Recorrido principal"
        >
          {navigation.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
        </nav>
        <button className={styles.systemButton} type="button" onClick={() => enter('dashboard')}>
          <span className={styles.statusDot} aria-hidden="true" />
          Abrir sistema
        </button>
      </header>

      <section id="top" className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/experience/command-city-hero.png"
          alt=""
          fill
          priority
          sizes="100vw"
        />
        <div className={styles.heroVeil} />
        <div className={styles.cityGrid} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.sectionIndex}>01 · Engineering intelligence system</p>
          <h1>
            Engineering<br />
            <span>Knowledge</span><br />
            Platform
          </h1>
          <p className={styles.heroLead}>
            Conecto proyectos, decisiones, tecnologías y conocimiento para convertir
            experiencia de ingeniería en evidencia explorable.
          </p>
          <div className={styles.heroStats} aria-label="Métricas del sistema">
            <Metric value={evidence.statistics.projects} label="Proyectos" />
            <Metric value={evidence.statistics.engineeringDecisions} label="Decisiones" />
            <Metric value={evidence.statistics.technologies} label="Tecnologías" />
            <Metric value={evidence.learningProfile.totalLessons} label="Lecciones" />
          </div>
          <button className={styles.primaryAction} type="button" onClick={() => enter('dashboard')}>
            Entrar al Command Center <span aria-hidden="true">↗</span>
          </button>
        </div>
        <a className={styles.scrollCue} href="#projects">
          <span aria-hidden="true">↓</span> Desciende a la ciudad
        </a>
      </section>

      <section id="projects" className={`${styles.worldSection} ${styles.projectsSection}`}>
        <Image
          className={styles.projectsImage}
          src="/experience/project-archipelago.png"
          alt="Seis distritos tecnológicos flotantes conectados por rutas de energía"
          fill
          sizes="100vw"
        />
        <div className={styles.worldOverlay} />
        <SectionHeading
          index="02"
          eyebrow="Project districts"
          title="Seis mundos. Un solo sistema."
          description="Cada proyecto conserva una identidad propia y aporta conocimiento al núcleo central."
        />
        <div className={styles.projectMarkers}>
          {PROJECTS.map((project, index) => (
            <button
              key={project.id}
              className={`${styles.projectMarker} ${styles[projectDistricts[index] ?? 'command']}`}
              type="button"
              onClick={() => enter('projects')}
            >
              <span className={styles.markerPulse} aria-hidden="true" />
              <span className={styles.projectNumber}>0{index + 1}</span>
              <strong>{project.name}</strong>
              <small>{project.tagline}</small>
            </button>
          ))}
        </div>
        <button className={styles.sectionAction} type="button" onClick={() => enter('projects')}>
          Explorar todos los proyectos <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section id="knowledge" className={`${styles.worldSection} ${styles.knowledgeSection}`}>
        <SectionHeading
          index="03"
          eyebrow="Knowledge infrastructure"
          title="El conocimiento no vive en tarjetas."
          description="Viaja por el sistema como una red: cada tecnología, decisión y lección conecta proyectos reales."
        />
        <div className={styles.graphStage}>
          <svg className={styles.graphLines} viewBox="0 0 1000 560" aria-hidden="true">
            <defs>
              <linearGradient id="graph-line" x1="0" x2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity=".05" />
                <stop offset=".5" stopColor="currentColor" stopOpacity=".9" />
                <stop offset="1" stopColor="currentColor" stopOpacity=".08" />
              </linearGradient>
            </defs>
            {[
              [500, 275, 190, 120], [500, 275, 800, 118], [500, 275, 180, 410],
              [500, 275, 815, 405], [500, 275, 500, 70], [500, 275, 500, 490],
              [190, 120, 500, 70], [800, 118, 500, 70], [180, 410, 500, 490],
              [815, 405, 500, 490], [190, 120, 180, 410], [800, 118, 815, 405],
            ].map(([x1, y1, x2, y2], index) => (
              <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} />
            ))}
          </svg>
          <div className={`${styles.graphNode} ${styles.graphCore}`}>
            <span>Core</span>
            <strong>{graphStats.nodes}</strong>
            <small>nodos</small>
          </div>
          {topTechnologies.slice(0, 6).map((technology, index) => (
            <div
              key={technology.technology}
              className={`${styles.graphNode} ${styles[`node${index + 1}`]}`}
            >
              <span>{technology.technology}</span>
              <small>{technology.projects} proyectos</small>
            </div>
          ))}
          <div className={styles.graphReadout}>
            <span>{graphStats.edges}</span>
            <small>relaciones verificables</small>
          </div>
        </div>
        <button className={styles.sectionAction} type="button" onClick={() => enter('capabilities')}>
          Entrar al Knowledge Graph <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section id="mission" className={`${styles.worldSection} ${styles.missionSection}`}>
        <SectionHeading
          index="04"
          eyebrow="Mission trajectory"
          title="Cada decisión deja una órbita."
          description="La evolución profesional se presenta como una trayectoria, no como una lista cronológica."
        />
        <div className={styles.orbitSystem}>
          <div className={styles.planet} aria-hidden="true">
            <span />
          </div>
          <div className={styles.orbitLine} aria-hidden="true" />
          <ol className={styles.missionList}>
            {missionPhases.map(([title, description, date], index) => (
              <li key={title}>
                <span className={styles.missionPoint}>{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <small>{date}</small>
                  <strong>{title}</strong>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <button className={styles.sectionAction} type="button" onClick={() => enter('mission')}>
          Ver Mission Log <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section id="analytics" className={`${styles.worldSection} ${styles.analyticsSection}`}>
        <SectionHeading
          index="05"
          eyebrow="Analytics command"
          title="La ciudad se observa a sí misma."
          description="Métricas, rankings e insights se regeneran desde el grafo sin convertirse en una nueva fuente de verdad."
        />
        <div className={styles.analyticsStage}>
          <div className={styles.hologramGlobe} aria-hidden="true">
            <span className={styles.globeRingOne} />
            <span className={styles.globeRingTwo} />
            <span className={styles.globeAxis} />
          </div>
          <div className={`${styles.floatPanel} ${styles.analyticsLeft}`}>
            <small>Tecnologías dominantes</small>
            {topTechnologies.slice(0, 5).map((technology) => (
              <div className={styles.barRow} key={technology.technology}>
                <span>{technology.technology}</span>
                <i style={{ width: `${Math.max(18, technology.projects * 16.6)}%` }} />
              </div>
            ))}
          </div>
          <div className={`${styles.floatPanel} ${styles.analyticsRight}`}>
            <small>Señales del conocimiento</small>
            <p><strong>{evidence.statistics.architecturePatterns}</strong> patrones arquitectónicos</p>
            <p><strong>{evidence.capabilities.length}</strong> capacidades derivadas</p>
            <p><strong>{graphStats.edges}</strong> conexiones navegables</p>
          </div>
          <div className={styles.analyticsMetrics}>
            <Metric value={evidence.statistics.projects} label="Proyectos" />
            <Metric value={evidence.statistics.engineeringDecisions} label="Decisiones" />
            <Metric value={evidence.statistics.technologies} label="Tecnologías" />
            <Metric value={evidence.capabilities.length} label="Capacidades" />
          </div>
        </div>
        <a className={styles.sectionAction} href="#evidence">
          Seguir hacia la evidencia <span aria-hidden="true">↓</span>
        </a>
      </section>

      <section id="evidence" className={`${styles.worldSection} ${styles.evidenceSection}`}>
        <SectionHeading
          index="06"
          eyebrow="Evidence engine"
          title="Nada se afirma sin evidencia."
          description="Cada capacidad puede rastrearse hasta proyectos, decisiones, lecciones y milestones concretos."
        />
        <div className={styles.evidenceLayout}>
          <div className={styles.codeMonolith} aria-hidden="true">
            <div className={styles.codeTop} />
            {Array.from({ length: 14 }, (_, index) => (
              <span key={index} style={{ width: `${42 + ((index * 17) % 48)}%` }} />
            ))}
            <div className={styles.codeBase} />
          </div>
          <div className={styles.evidenceFeed}>
            <div className={styles.traceability}>
              <span>{evidence.statistics.projects}</span>
              <strong>Fuentes de proyecto</strong>
              <small>Datos tipados y validados</small>
            </div>
            <div className={styles.traceability}>
              <span>{evidence.statistics.engineeringDecisions}</span>
              <strong>Decisiones rastreables</strong>
              <small>Contexto, razonamiento e impacto</small>
            </div>
            <div className={styles.traceability}>
              <span>100%</span>
              <strong>Derivación reproducible</strong>
              <small>Sin claims escritos manualmente</small>
            </div>
          </div>
        </div>
        <button className={styles.sectionAction} type="button" onClick={() => enter('capabilities')}>
          Examinar capacidades <span aria-hidden="true">↗</span>
        </button>
      </section>

      <section id="about" className={`${styles.worldSection} ${styles.aboutSection}`}>
        <SectionHeading
          index="07"
          eyebrow="About the engineer"
          title="Construyo sistemas que explican cómo fueron construidos."
          description="Arquitectura limpia, dominio explícito y automatización orientada a resultados."
        />
        <div className={styles.aboutConsole}>
          <div className={styles.engineerIdentity}>
            <div className={styles.engineerMark}>4U</div>
            <div>
              <small>Software Engineer · Bogotá, Colombia</small>
              <h3>4U Studio</h3>
              <p>Diseño productos digitales donde la ingeniería también forma parte de la experiencia.</p>
            </div>
          </div>
          <div className={styles.principles}>
            <span>Arquitectura limpia</span>
            <span>Interfaces espaciales</span>
            <span>Automatización</span>
            <span>Knowledge systems</span>
            <span>AI integration</span>
          </div>
          <button className={styles.primaryAction} type="button" onClick={() => enter('profile')}>
            Abrir perfil del sistema <span aria-hidden="true">↗</span>
          </button>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <span className={styles.brandMark} aria-hidden="true">C</span>
          <span>Command Center</span>
        </div>
        <p>Engineering Knowledge Platform</p>
        <small>Built by 4U Studio · 2026</small>
      </footer>
    </main>
  );
}

function Metric({ value, label }: { value: number; label: string }) {
  return (
    <div className={styles.metric}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <header className={styles.sectionHeading}>
      <p className={styles.sectionIndex}>{index} · {eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </header>
  );
}
