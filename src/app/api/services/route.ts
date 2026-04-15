import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const slug = searchParams.get("slug");

    if (!companyId && !slug) {
      return NextResponse.json({ error: "Company ID or Slug is required" }, { status: 400 });
    }

    if (slug) {
      const company = await prisma.company.findUnique({
        where: { slug },
        include: { services: true }
      });
      return NextResponse.json({ company, services: company?.services || [] });
    }

    const services = await prisma.service.findMany({
      where: { companyId: companyId as string },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
