# Subdomain Implementation

This document describes the subdomain implementation for the Heptapus Group website.

## Overview

The Heptapus Group website now supports multiple subdomains (e.g., `flux.heptapusgroup.com`, `net.heptapusgroup.com`) that can be managed from the main site's admin panel at `heptapusgroup.com/admin`.

## Features

- **Dynamic Subdomain Detection**: Automatically detects subdomain from the hostname
- **Database-Driven Configuration**: Each subdomain's settings are stored in the database
- **Centralized Management**: All subdomains are managed from a single admin interface
- **Custom Branding**: Each subdomain can have its own title, description, logo, and theme color
- **Active/Inactive Status**: Subdomains can be enabled or disabled without deletion

## Architecture

### Database Schema

A new `Subdomain` model has been added to the Prisma schema:

```prisma
model Subdomain {
  id          String   @id @default(cuid())
  name        String   @unique  // e.g., "flux", "net"
  title       String              // e.g., "HeptaFlux"
  description String?
  logoUrl     String?
  themeColor  String?             // Primary color for the subdomain
  isActive    Boolean  @default(true)
  settings    Json?               // Additional subdomain-specific settings
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Middleware

The middleware (`middleware.ts`) has been updated to:
1. Detect subdomains from the hostname
2. Pass subdomain information to the app via headers
3. Prevent admin access from subdomains

### Components

- **SubdomainLayout**: Provides consistent layout for subdomain pages
- **SubdomainHome**: Default landing page for subdomains

### API Routes

- `GET /api/admin/subdomains` - List all subdomains
- `POST /api/admin/subdomains` - Create new subdomain
- `GET /api/admin/subdomains/[id]` - Get single subdomain
- `PUT /api/admin/subdomains/[id]` - Update subdomain
- `DELETE /api/admin/subdomains/[id]` - Delete subdomain

## Setup

### Development

For local development, you can test subdomains by:

1. Using a service like [nip.io](https://nip.io) or editing your `/etc/hosts` file:
   ```
   127.0.0.1 flux.localhost
   127.0.0.1 net.localhost
   ```

2. Access the subdomain at `http://flux.localhost:3000`

### Production

1. Configure DNS records for your subdomains to point to your server
2. Ensure your Next.js deployment handles wildcard subdomains
3. Add subdomains through the admin panel at `/admin/subdomains`

## Environment Variables

Required environment variables:

```env
DATABASE_URL="file:./prisma/dev.db"
AUTH_SECRET="your-secret-key-at-least-32-characters"
```

## Initial Data

To seed initial subdomain data:

```bash
node seed-subdomains.js
```

This creates:
- **flux**: HeptaFlux - Energy & Thermal Systems Division
- **net**: HeptaNet - Infrastructure & Backend Division

## Admin Panel

Access the subdomain management interface at:
```
https://heptapusgroup.com/admin/subdomains
```

From here you can:
- View all subdomains
- Create new subdomains
- Edit existing subdomains
- Activate/deactivate subdomains
- Delete subdomains
- Visit subdomain sites

## Future Enhancements

Potential improvements for the subdomain system:

1. **Content Management**: Allow each subdomain to have its own pages and content
2. **Analytics**: Track visits and metrics per subdomain
3. **Custom Domains**: Support mapping custom domains to subdomains
4. **Theming**: More granular control over subdomain appearance
5. **User Permissions**: Assign users to specific subdomains
