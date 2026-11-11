import type { CaseCopy } from './use-case-copy';

/** Texts shared by the four case studies, as [Spanish, English] (specs/i18n-english.md, I.3). */
export const commonCaseCopy = {
  backToCity: ['Volver a la ciudad', 'Back to the city'],
  danielCantorInicio: ['Daniel Cantor, inicio', 'Daniel Cantor, home'],
  desarrolloFullStackY: ['Desarrollo full-stack y producto', 'Full-stack development and product'],
  elProyecto: ['El proyecto', 'The project'],
  hablemosDeTuProyecto: ['Hablemos de tu proyecto', 'Let’s talk about your project'],
  participacion: ['Participación', 'Role'],
  proyectoAnterior: ['Proyecto anterior', 'Previous project'],
  recorridoDeProyectos: ['Recorrido de proyectos', 'Project navigation'],
  siguienteProyecto: ['Siguiente proyecto', 'Next project'],
  tecnologias: ['Tecnologías', 'Technologies'],
  visitarSitio: ['Visitar sitio', 'Visit site'],
} as const satisfies CaseCopy;
