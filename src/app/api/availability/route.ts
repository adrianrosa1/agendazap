import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const availability = await prisma.availability.findMany({
    where: { companyId },
  });

  return NextResponse.json(availability);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { availabilities, companyId } = body;

  if (!companyId || !Array.isArray(availabilities)) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  // Delete existing availability for this company and create new ones
  await prisma.$transaction([
    prisma.availability.deleteMany({ where: { companyId } }),
    prisma.availability.createMany({
      data: availabilities.map((a: any) => ({
        dayOfWeek: parseInt(a.dayOfWeek),
        startTime: a.startTime,
        endTime: a.endTime,
        companyId,
      })),
    }),
  ]);

  return NextResponse.json({ success: true });
}
