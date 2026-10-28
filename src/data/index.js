// Une los datos editables (projects.json, cases.json…) con lo que genera
// `npm run media` (media-manifest.json: duración, orientación, tamaño).

import projectsRaw from './projects.json';
import manifest from './media-manifest.json';
import cases from './cases.json';
import testimonials from './testimonials.json';
import reviewHighlights from './review-highlights.json';
import covers from './covers.json';
import { posterUrl, videoUrl } from '../config';

export const projects = projectsRaw
  .filter((p) => !p.hidden && manifest[p.id])
  .map((p) => ({
    ...p,
    rubro: p.rubro || 'otros',
    duration: manifest[p.id].duration,
    orientation: manifest[p.id].orientation,
    src: videoUrl(p.id),
    poster: posterUrl(p.id),
  }));

export const projectById = (id) => projects.find((p) => p.id === id);

// Rubros en el orden en que aparecen por primera vez
export const rubros = [...new Set(projects.map((p) => p.rubro))];

export const featuredProjects = () => {
  const featured = projects.filter((p) => p.featured);
  return featured.length ? featured : projects.slice(0, 10);
};

export const heroProjects = () => {
  const hero = projects.filter((p) => p.hero && p.orientation === 'vertical');
  return (hero.length ? hero : projects.filter((p) => p.orientation === 'vertical')).slice(0, 3);
};

export { cases, testimonials, reviewHighlights, covers };

export const formatDuration = (secs) => {
  const m = Math.floor(secs / 60);
  const s = String(Math.round(secs % 60)).padStart(2, '0');
  return `${m}:${s}`;
};
