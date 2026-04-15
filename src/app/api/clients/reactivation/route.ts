import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { subDays } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  // Find clients whose last appointment was more than 30 days ago
  // OR who have never had an appointment but were created more than 30 days ago
  const inactiveClients = await prisma.client.findMany({
    where: {
      companyId,
      OR: [
        {
          appointments: {
            none: {
              date: { gte: thirtyDaysAgo }
            }
          }
        },
        {
          appointments: {
            every: {
              date: { lt: thirtyDaysAgo }
            }
          }
        }
      ]
    },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        take: 1
      }
    }
  });

  return NextResponse.json(inactiveClients);
}
