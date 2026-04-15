import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { name: true, plan: true, slug: true }
    });

    const now = new Date();

    // 1. Appointments Today
    const appointmentsToday = await prisma.appointment.count({
      where: {
        companyId,
        date: {
          gte: startOfDay(now),
          lte: endOfDay(now)
        }
      }
    });

    // 2. Monthly Revenue
    const monthlyApps = await prisma.appointment.findMany({
      where: {
        companyId,
        paymentStatus: "PAID",
        date: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      },
      include: { service: true }
    });

    const revenue = monthlyApps.reduce((acc, curr) => acc + curr.service.price, 0);

    // 3. New Clients
    const newClients = await prisma.client.count({
      where: {
        companyId,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now)
        }
      }
    });

    // 4. No-Show Rate
    const totalCompleted = await prisma.appointment.count({
      where: { companyId, status: { in: ["COMPLETED", "CANCELLED"] } }
    });
    const totalCancelled = await prisma.appointment.count({
      where: { companyId, status: "CANCELLED" }
    });

    const noShowRate = totalCompleted > 0 
      ? `${((totalCancelled / totalCompleted) * 100).toFixed(0)}%` 
      : "0%";

    // 5. Recent Appointments
    const recentAppointments = await prisma.appointment.findMany({
      where: { companyId },
      include: { service: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      company,
      stats: {
        appointmentsToday,
        monthlyRevenue: revenue,
        newClients,
        noShowRate
      },
      recentAppointments
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
