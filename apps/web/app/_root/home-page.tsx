import { ExperienceGate } from '@/shell/experience-gate';
import { WorkspaceProvider } from '@/shell/workspace-provider';
import { PUBLIC_PROFILE } from '@/data/public-profile';
import { SITE_URL as siteUrl } from '../../i18n/config';

const [locality, country] = PUBLIC_PROFILE.location.split(', ');
/** Structured data for search engines: who the site is about, from the same profile the page shows. */
const person = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: PUBLIC_PROFILE.name,
  jobTitle: PUBLIC_PROFILE.role,
  url: siteUrl,
  image: `${siteUrl}/og/workshop-v1.jpg`,
  address: { '@type': 'PostalAddress', addressLocality: locality, addressCountry: country },
  sameAs: [PUBLIC_PROFILE.github, PUBLIC_PROFILE.linkedin],
};

export default function HomePage() {
  return (
    <WorkspaceProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <ExperienceGate />
    </WorkspaceProvider>
  );
}
