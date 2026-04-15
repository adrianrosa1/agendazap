import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const professionals = await prisma.user.findMany({
    where: { companyId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    }
  });

  return NextResponse.json(professionals);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, companyId } = body;

    const professional = await prisma.user.create({
      data: {
        name,
        email,
        companyId
      }
    });

    return NextResponse.json(professional);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
