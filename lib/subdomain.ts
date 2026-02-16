// lib/subdomain.ts
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';

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
  
  // Handle localhost for development
  if (hostname.includes('localhost')) {
    // Check for subdomain in localhost (e.g., flux.localhost:3000)
    const parts = hostname.split('.');
    if (parts.length > 1 && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }
  
  // Production domain handling
  const parts = hostname.split('.');
  
  // If domain has 3+ parts (subdomain.domain.tld), extract subdomain
  if (parts.length >= 3) {
    const subdomain = parts[0];
    // Ignore www subdomain
    if (subdomain === 'www') {
      return null;
    }
    return subdomain;
  }
  
  // No subdomain (just domain.tld or www.domain.tld)
  return null;
}

/**
 * Get subdomain configuration from database
 */
export async function getSubdomainConfig(subdomain: string) {
  try {
    const config = await prisma.subdomain.findUnique({
      where: { name: subdomain, isActive: true },
    });
    return config;
  } catch (error) {
    console.error('Error fetching subdomain config:', error);
    return null;
  }
}

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
