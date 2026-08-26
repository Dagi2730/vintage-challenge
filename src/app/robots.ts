import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/dashboard', '/account', '/sell'],
    },
    sitemap: 'https://emerkato.com/sitemap.xml',
  };
}
