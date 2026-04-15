import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { createAsaasCustomer, createAsaasPixCharge } from "../../../lib/asaas";
import { addMinutes, format, parseISO } from "date-fns";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      serviceId, 
      date, // ISO date string
      startTime, // "HH:mm"
      companyId,
      professionalId
    } = body;

    // 1. Validate service
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // 2. Calculate end time with buffer (10 mins default)
    const BUFFER_TIME = 10;
    const startDateTime = parseISO(`${date.split('T')[0]}T${startTime}:00`);
    const serviceEndDateTime = addMinutes(startDateTime, service.duration);
    const totalEndDateTime = addMinutes(serviceEndDateTime, BUFFER_TIME);
    
    const endTime = format(serviceEndDateTime, "HH:mm");
    const collisionEndTime = format(totalEndDateTime, "HH:mm");

    // 3. Check for existing appointments (collision check with buffer)
    const existing = await prisma.appointment.findFirst({
      where: {
        companyId,
        date: new Date(date),
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime }
          },
          {
            startTime: { lt: collisionEndTime },
            endTime: { gte: collisionEndTime }
          }
        ]
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Time slot already booked" }, { status: 400 });
    }

    // 4. Handle client existence
    const client = await prisma.client.upsert({
      where: { companyId_phone: { companyId, phone: clientPhone } },
      update: { name: clientName, email: clientEmail },
      create: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        companyId
      }
    });

    // 5. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        clientName,
        clientEmail,
        clientPhone,
        date: new Date(date),
        startTime,
        endTime,
        serviceId,
        companyId,
        professionalId: professionalId || null,
        clientId: client.id,
        status: "PENDING",
        paymentStatus: "PENDING"
      }
    });

    // 5. Create Asaas Customer and Pix Charge
    try {
      const customer = await createAsaasCustomer({
        name: clientName,
        email: clientEmail,
        phone: clientPhone
      });

      const charge = await createAsaasPixCharge({
        customerId: customer.id,
        value: service.price,
        description: `Agendamento: ${service.name}`,
        dueDate: format(new Date(), "yyyy-MM-dd"),
        externalReference: appointment.id
      });

      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { asaasPaymentId: charge.id }
      });

      return NextResponse.json({ 
        appointment, 
        paymentId: charge.id,
        invoiceUrl: charge.invoiceUrl // Asaas provides a link to the invoice/payment page
      });
    } catch (paymentError) {
      console.error("Payment creation failed:", paymentError);
      // We still have the appointment, but without payment integration for now
      return NextResponse.json({ appointment, warning: "Payment integration failed" });
    }

  } catch (error: any) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const appointments = await prisma.appointment.findMany({
    where: { companyId },
    include: { service: true },
    orderBy: { date: 'asc' }
  });

  return NextResponse.json(appointments);
}
