import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { hasDbConfiguration } from '@/lib/account-store';
import { getAllMemoryListings } from '@/lib/listing-store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://emerkato.com';

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    },
  ];

  let listings: any[] = [];
  if (!hasDbConfiguration()) {
    listings = getAllMemoryListings();
  } else {
    try {
      listings = await prisma.listing.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, createdAt: true },
        take: 1000,
      });
    } catch (e) {
      console.error('Failed to fetch listings for sitemap:', e);
    }
  }

  const listingUrls = listings.map((listing) => ({
    url: `${baseUrl}/listings/${listing.id}`,
    lastModified: new Date(listing.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...routes, ...listingUrls];
}
