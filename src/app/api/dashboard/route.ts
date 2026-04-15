import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

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

  // 2. Monthly Revenue (Confirmed/Paid appointments)
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

  // 3. New Clients this month
  const newClients = await prisma.client.count({
    where: {
      companyId,
      createdAt: {
        gte: startOfMonth(now),
        lte: endOfMonth(now)
      }
    }
  });

  // 4. No-Show Rate calculation
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
    orderBy: { date: 'desc' },
    take: 5
  });

  return NextResponse.json({
    stats: {
      appointmentsToday,
      monthlyRevenue: revenue,
      newClients,
      noShowRate
    },
    recentAppointments
  });
}
