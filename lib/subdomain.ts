// lib/subdomain.ts
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { subdomainFromHost } from '@/lib/hostname';
import { publicSubdomainSettings } from '@/lib/subdomain-content';
import { cache } from 'react';
import { divisionVariants } from '@/lib/division-locales';

/**
 * Extract subdomain from hostname
 * e.g., "flux.heptapusgroup.com" => "flux"
 *       "net.heptapusgroup.com" => "net"
 *       "heptapusgroup.com" => null
 *       "www.heptapusgroup.com" => null
 */
export async function getSubdomain(): Promise<string | null> {
  const headersList = await headers();
  const hostname = headersList.get('host') || '';
  
  return subdomainFromHost(hostname);
}

/**
 * Get subdomain configuration from database
 */
// Reuse the same published snapshot across metadata/layout/page in one render.
// React cache is request-scoped; later admin saves are visible on the next request.
export const getSubdomainConfig = cache(async (subdomain: string) => {
  const locale = (await headers()).get('x-division-locale') || '';
  try {
    const config = await prisma.subdomain.findUnique({
      where: { name: subdomain, isActive: true },
    });
    return config ? divisionVariants({ ...config, settings: publicSubdomainSettings(config.settings) }).find(variant => variant.localePrefix === (locale ? `/${locale}` : '')) || null : null;
  } catch (error) {
    console.error('Error fetching subdomain config:', error);
    return null;
  }
});

/**
 * Get all active subdomains
 */
export async function getAllSubdomains() {
  try {
    return await prisma.subdomain.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Error fetching subdomains:', error);
    return [];
  }
}

/**
 * Check if current request is on a subdomain
 */
export async function isSubdomain(): Promise<boolean> {
  const subdomain = await getSubdomain();
  return subdomain !== null;
}
