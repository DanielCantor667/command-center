import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://command-center-web-woad.vercel.app';
  return [
    { url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${url}/creditos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
