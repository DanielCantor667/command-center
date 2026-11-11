import type { Dictionary } from '../../i18n/es';

/** Display names of the fixed places (entrance, overview, project wall, the three stations) in the page's language. */
export const placeNames = ({ points, stations }: Dictionary['workshop']) => ({
  ...points,
  technologies: stations.technologies.name, trajectory: stations.trajectory.name, contact: stations.contact.name,
});
