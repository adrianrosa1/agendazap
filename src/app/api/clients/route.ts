import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const clients = await prisma.client.findMany({
    where: { companyId },
    include: {
      _count: {
        select: { appointments: true }
      },
      appointments: {
        orderBy: { date: 'desc' },
        take: 1,
        include: { service: true }
      }
    },
    orderBy: { name: 'asc' }
  });

  return NextResponse.json(clients);
}
