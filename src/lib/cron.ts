import cron from "node-cron";
import { prisma } from "./prisma";
import { sendWhatsAppNotification } from "./notifications";
import { format, addHours, startOfHour, isAfter } from "date-fns";

export function initCronJobs() {
  console.log("Initializing AgendaZap Automation Engine...");
  
  // Every hour: Check for 2h and 24h reminders
  cron.schedule("0 * * * *", async () => {
    const now = new Date();
    
    // 1. Find upcoming appointments for 24h reminder
    const tomorrow = addHours(now, 24);
    const upcoming24h = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfHour(tomorrow), lt: addHours(startOfHour(tomorrow), 1) },
        status: "CONFIRMED"
      },
      include: { service: true, company: true }
    });

    for (const app of upcoming24h) {
      const msg = `Lembrete AgendaZap: Você tem ${app.service.name} amanhã às ${app.startTime} em ${app.company.name}. Nos vemos lá!`;
      await sendWhatsAppNotification(app.clientPhone, msg);
    }

    // 2. Find upcoming appointments for 2h reminder
    const in2h = addHours(now, 2);
    const upcoming2h = await prisma.appointment.findMany({
      where: {
        date: { gte: startOfHour(in2h), lt: addHours(startOfHour(in2h), 1) },
        status: "CONFIRMED"
      },
      include: { service: true, company: true }
    });

    for (const app of upcoming2h) {
      const msg = `Lembrete: Seu horário de ${app.service.name} é daqui a 2 horas (${app.startTime}). Até logo!`;
      await sendWhatsAppNotification(app.clientPhone, msg);
    }
  });

  // Daily: Customer Reactivation (30 days without visit)
  cron.schedule("0 9 * * *", async () => {
    console.log("Running daily customer reactivation...");
    // Logic for reactivation can be added here
  });
}
