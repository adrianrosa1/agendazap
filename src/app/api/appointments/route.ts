import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAsaasCustomer, createAsaasPixCharge } from "../../../lib/asaas";
import { sendAppointmentConfirmation } from "../../../lib/notifications";
import { addMinutes, format, parseISO } from "date-fns";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, 
      startTime, 
      companyId 
    } = body;

    // 1. Get Company and Plan
    const company = await prisma.company.findUnique({
      where: { id: companyId }
    });

    if (!company) return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 });

    // 2. Validate service
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });

    // 3. Collision check
    const existing = await prisma.appointment.findFirst({
      where: {
        companyId,
        date: new Date(date),
        startTime,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    if (existing) return NextResponse.json({ error: "Horário já ocupado" }, { status: 400 });

    // 4. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        startTime,
        endTime: startTime, // Simple end time for now
        serviceId,
        companyId,
        status: company.plan === "OURO" ? "PENDING" : "CONFIRMED",
        paymentStatus: "PENDING"
      }
    });

    // 5. Handle WhatsApp (Prata and Ouro)
    if (company.plan !== "BRONZE") {
      await sendAppointmentConfirmation(appointment, service);
    }

    // 6. Handle Pix Payment (Ouro only)
    if (company.plan === "OURO") {
      try {
        const customer = await createAsaasCustomer({
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        });

        const charge = await createAsaasPixCharge({
          customerId: customer.id,
          value: 10.00, // For Ouro, we charge full price or signal
          description: `Reserva: ${service.name}`,
          dueDate: format(new Date(), "yyyy-MM-dd"),
          externalReference: appointment.id
        });

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: { asaasPaymentId: charge.id }
        });

        return NextResponse.json({ 
          success: true,
          appointment, 
          paymentRequired: true,
          invoiceUrl: charge.invoiceUrl 
        });
      } catch (error) {
        console.error("Payment Error:", error);
      }
    }

    return NextResponse.json({ success: true, appointment });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
