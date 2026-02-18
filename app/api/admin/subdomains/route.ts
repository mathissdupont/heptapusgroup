// app/api/admin/subdomains/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - List all subdomains
export async function GET() {
  try {
    const subdomains = await prisma.subdomain.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(subdomains);
  } catch (error) {
    console.error("Error fetching subdomains:", error);
    return NextResponse.json({ error: "Failed to fetch subdomains" }, { status: 500 });
  }
}

// POST - Create new subdomain
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, title, description, logoUrl, themeColor, isActive, settings } = body;
    
    // Validate required fields
    if (!name || !title) {
      return NextResponse.json(
        { error: "Name and title are required" },
        { status: 400 }
      );
    }

    // Validate subdomain name format
    if (!/^[a-z0-9-]+$/.test(name)) {
      return NextResponse.json(
        { error: "Name must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }
    
    const subdomain = await prisma.subdomain.create({
      data: {
        name,
        title,
        description,
        logoUrl,
        themeColor,
        isActive: isActive ?? true,
        settings: settings ? (typeof settings === 'string' ? settings : JSON.stringify(settings)) : null,
      },
    });
    
    return NextResponse.json(subdomain, { status: 201 });
  } catch (error: any) {
    console.error("Error creating subdomain:", error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Subdomain with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: "Failed to create subdomain" }, { status: 500 });
  }
}
