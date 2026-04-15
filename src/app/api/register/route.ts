import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, companyName } = body;

    if (!name || !email || !password || !companyName) {
      return NextResponse.json({ error: "Todos os campos são obrigatórios" }, { status: 400 });
    }

    // 1. Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 400 });
    }

    // 2. Create Company with default BRONZE plan
    const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const company = await prisma.company.create({
      data: {
        name: companyName,
        slug: slug,
        plan: "BRONZE",
      }
    });

    // 3. Create User linked to company
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // In a real app, hash password!
        companyId: company.id,
      }
    });

    return NextResponse.json({ 
      success: true,
      user: { id: user.id, email: user.email, name: user.name }, 
      company: { id: company.id, name: company.name, slug: company.slug, plan: company.plan } 
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Erro ao criar conta. Verifique sua conexão com o banco." }, { status: 500 });
  }
}
