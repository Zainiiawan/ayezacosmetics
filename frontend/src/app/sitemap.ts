import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const now = new Date();

  const staticPages = [
    '',
    '/shop',
    '/categories',
    '/offers',
    '/about',
    '/contact',
    '/help',
    '/track-order',
    '/login',
    '/register',
  ];

  return staticPages.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '' ? 'daily' : 'weekly',
    priority: path === '' ? 1 : 0.8,
  }));
}
