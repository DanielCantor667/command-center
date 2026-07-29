export interface HeroData {
  name: string;
  role: string;
  missionStatement: string;
  status: string;
  availability: string;
}

export interface QuickStat {
  label: string;
  value: string;
}

export interface CurrentFocusData {
  title: string;
  status: string;
}

export interface ActivityItem {
  id: string;
  label: string;
}

export interface SystemStatusItem {
  label: string;
  value: string;
}

export const HERO_DATA: HeroData = {
  name: 'Daniel Cantor',
  role: 'Software Engineer · Product Owner',
  missionStatement: 'Diseño productos y sistemas de ingeniería donde las decisiones, la evidencia y la experiencia de usuario forman parte del mismo sistema.',
  status: 'Portfolio público',
  availability: 'Disponible para proyectos freelance',
};

export const CURRENT_FOCUS: CurrentFocusData = {
  title: 'Command Center',
  status: 'Evolución continua',
};

export const RECENT_ACTIVITY: readonly ActivityItem[] = [
  { id: 'command-city', label: 'Command City publicada como experiencia de navegación' },
  { id: 'analytics-engine', label: 'Analytics derivado del Knowledge Graph' },
  { id: 'evidence-engine', label: 'Evidence Engine conectado a proyectos y decisiones' },
  { id: 'launch-hardening', label: 'Preparación de lanzamiento público en curso' },
];

export const SYSTEM_STATUS: readonly SystemStatusItem[] = [
  { label: 'Estado', value: 'Público' },
  { label: 'Arquitectura', value: 'Modular' },
  { label: 'Contenido', value: 'Documentado' },
  { label: 'Evidencia', value: 'Trazable' },
];
