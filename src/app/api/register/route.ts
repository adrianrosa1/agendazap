import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName } = body;

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // 2. Create Company
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: slug,
      }
    });

    // 3. Create User linked to company
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // In real app, hash password!
        companyId: company.id,
      }
    });

    return NextResponse.json({ user, company });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
