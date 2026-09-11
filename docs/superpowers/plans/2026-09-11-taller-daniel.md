# Taller de Daniel Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Usuario aprobó el diseño y pidió continuar hasta completar la entrega local.

**Goal:** Entregar el taller personal 3D, catálogo de tecnologías con iconos volumétricos, proyectos vinculados y trayectoria real del CV.

**Architecture:** La experiencia pública sigue usando ExperienceGate y PortfolioCase. ExperienceModule compone una maqueta principal, TechnologyExplorer y trayectoria; la maqueta recibe estado de selección. Catálogo estático con fuentes explícitas separado del motor de analytics.

**Tech Stack:** Next.js 15, React 19, TypeScript, React Three Fiber 9, drei, Three.js; estilos CSS Modules existentes. No cambiar dependencias para esta fase.

**Spec:** docs/product/taller-daniel-propuesta-2026-09-11.md. Aprobada el 11-09-2026, con adición explícita: tecnologías como iconos 3D.

## Global Constraints

- Mantener cambios locales de fases anteriores. No commit/push/deploy en esta solicitud.
- Paleta papel/piedra/tinta/verde; cuatro proyectos publicados, materiales e iluminación coherentes.
- Sin métricas, porcentajes de dominio, seniority ni biografía inventados.
- CV fuente de trayectoria; tecnologías/proyectos derivados del CV y registros locales, con alias normalizados.
- Contenido funcional sin WebGL y a 320 px. Movimiento reducido y teclado.
- Un visor principal activo por sección; no crear un contexto WebGL por icono.
- Contacto conserva canal actual hasta resolver diferencia de LinkedIn; no publicar teléfono ni copia completa del CV.

## Task 1: Catálogo y perfil

**Files:** apps/web/data/portfolio-technologies.ts; apps/web/data/public-profile.ts; apps/web/data/portfolio-career.ts; apps/web/data/projects/drokex.ts; pruebas en apps/web/data/tests/portfolio-technologies.test.ts.

**Interfaces:**
```ts
type TechnologyCategory = 'languages' | 'frontend' | 'backend' | 'data' | 'integrations' | 'tools';
interface PortfolioTechnology {
 id: string; name: string; shortName: string; category: TechnologyCategory;
 color: string; description: string; aliases: readonly string[];
 projectIds: readonly string[]; source: 'cv' | 'project' | 'cv-and-project';
}
// export PORTFOLIO_TECHNOLOGIES, TECHNOLOGY_CATEGORIES ({id,label}[])
// export filterTechnologies(query: string, category?: TechnologyCategory | 'all'): PortfolioTechnology[]
```
- [x] Validar alias, enlaces a proyectos existentes, categorías y búsqueda normalizada con tests.
- [x] Cargar habilidades del CV y cruces con proyectos; sin convertir confidence a nivel personal.
- [x] Añadir trayectoria/educación; actualizar participación Drokex como declaración del CV sin autoría exclusiva.

## Task 2: Maqueta de cuatro proyectos y biblioteca central

**Files:** apps/web/modules/experience/components/city-navigator.tsx; city-navigator-loader.tsx; nuevos componentes de mesa/biblioteca y camera helpers dentro de experience/components. No alterar manifest de activos históricos innecesariamente.

**Interfaces:** extender CityNavigatorProps con `section?: 'projects' | 'technologies'`, `highlightedProjectIds?: readonly string[]`, `onTechnologiesOpen?: () => void`, `selectedTechnologyId?: string`; conservar props existentes.

- [x] Reutilizar los cuatro distritos, composición circular sobre base biselada y detalle personal DC/relieve de cerros.
- [x] Biblioteca central seleccionable; materiales y luz comunes; resaltar proyectos vinculados a tecnología.
- [x] Cámara orientada a vistas general/proyecto/tecnologías; interrupción y reducción de movimiento.
- [x] Fallback y carga diferida; selección y retorno accesibles con controles DOM.

## Task 3: Explorador e iconos 3D

**Files:** apps/web/modules/experience/components/technology-explorer.tsx; technology-explorer.module.css; technology-icon-3d.tsx y auxiliares; activos locales de logos con fuentes documentadas si se requieren.

**Interfaces:**
```ts
interface TechnologyExplorerProps {
 selectedId: string; onSelect: (id: string) => void;
 onProjectSelect: (id: string) => void;
}
```
- [x] Categorías, búsqueda por nombre/alias, catálogo y ficha de uso/proyectos.
- [x] Iconos con volumen perceptible, bisel y caras; visor de tecnología seleccionada realmente 3D con geometría, sin múltiples canvas por catálogo.
- [x] Fallback DOM, foco, empty state, cambiar/limpiar filtros y selección coherente.
- [x] Pruebas de búsqueda, filtrado y selección de proyecto.

## Task 4: Integración, trayectoria y continuidad

**Files:** experience/component.tsx; experience.module.css; experience-gate/component.tsx; portfolio-case/component.tsx y CSS; profile/communication según necesidad.

- [x] Portada inspirada en concepto, introducción breve, proyecto activo con captura real, navegación Proyectos/Tecnologías/Trayectoria/Contacto.
- [x] Tecnología seleccionada destaca proyectos relacionados; abrir caso conserva punto de retorno.
- [x] Trayectoria con experiencia, educación e idiomas desde CV; archivo/laboratorio secundario accesible.
- [x] Botones, títulos y paneles coherentes; móvil sin navegación oculta.

## Task 5: Verificación y entrega

- [x] Vitest, TypeScript y ESLint; build si la integración/carga diferida lo exige.
- [x] Navegador real: 1440 px, 390 px y 320 px, selección, filtro, búsqueda vacía y sin resultados, tecnología a caso y retorno, navegación de secciones y enlaces.
- [x] Activar/cerrar 3D, reducir movimiento, fallback sin WebGL, navegación de teclado y foco.
- [x] Inspeccionar capturas reales de portada y tecnologías; corregir problemas visibles antes de concluir.
- [x] Documentar resultado y URL local, sin afirmar despliegue.
