import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAsaasPixQrCode } from "@/lib/asaas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { service: true, company: true }
    });

    if (!appointment) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let pixData = null;
    if (appointment.asaasPaymentId && appointment.paymentStatus === "PENDING") {
      try {
        pixData = await getAsaasPixQrCode(appointment.asaasPaymentId);
      } catch (e) {
        console.error("Error fetching PIX data", e);
      }
    }

    return NextResponse.json({ appointment, pixData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
