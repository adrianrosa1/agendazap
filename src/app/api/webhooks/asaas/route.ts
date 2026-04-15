import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event, payment } = body;

    console.log(`Received Asaas webhook event: ${event}`, payment);

    if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED") {
      const appointmentId = payment.externalReference;

      if (appointmentId) {
        await prisma.appointment.update({
          where: { id: appointmentId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID"
          }
        });
        console.log(`Appointment ${appointmentId} confirmed via webhook.`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
