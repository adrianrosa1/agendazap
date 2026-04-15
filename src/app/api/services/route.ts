import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const services = await prisma.service.findMany({
    where: { companyId },
  });

  return NextResponse.json(services);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description, duration, price, companyId } = body;

  const service = await prisma.service.create({
    data: {
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price),
      companyId,
    },
  });

  return NextResponse.json(service);
}
