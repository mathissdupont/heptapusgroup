// app/api/admin/subdomains/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET - Get single subdomain
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const subdomain = await prisma.subdomain.findUnique({
      where: { id: params.id },
    });
    
    if (!subdomain) {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
    }
    
    return NextResponse.json(subdomain);
  } catch (error) {
    console.error("Error fetching subdomain:", error);
    return NextResponse.json({ error: "Failed to fetch subdomain" }, { status: 500 });
  }
}

// PUT - Update subdomain
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { name, title, description, logoUrl, themeColor, isActive, settings } = body;
    
    const subdomain = await prisma.subdomain.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(themeColor !== undefined && { themeColor }),
        ...(isActive !== undefined && { isActive }),
        ...(settings !== undefined && { settings: settings ? JSON.stringify(settings) : null }),
      },
    });
    
    return NextResponse.json(subdomain);
  } catch (error: any) {
    console.error("Error updating subdomain:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Subdomain with this name already exists" },
        { status: 409 }
      );
    }
    
    return NextResponse.json({ error: "Failed to update subdomain" }, { status: 500 });
  }
}

// DELETE - Delete subdomain
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.subdomain.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({ message: "Subdomain deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting subdomain:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 });
    }
    
    return NextResponse.json({ error: "Failed to delete subdomain" }, { status: 500 });
  }
}
