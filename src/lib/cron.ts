import cron from "node-cron";
import { prisma } from "./prisma";
import { sendWhatsAppNotification } from "./notifications";
import { format, addHours, startOfHour } from "date-fns";

// Run every hour at minute 0
export function initCronJobs() {
  console.log("Initializing cron jobs...");
  
  cron.schedule("0 * * * *", async () => {
    console.log("Checking for upcoming appointments to send reminders...");
    
    const now = new Date();
    const in24Hours = addHours(now, 24);
    
    // Find appointments happening in approximately 24 hours
    const upcoming = await prisma.appointment.findMany({
      where: {
        date: {
          gte: startOfHour(in24Hours),
          lt: addHours(startOfHour(in24Hours), 1)
        },
        status: "CONFIRMED"
      },
      include: {
        service: true,
        company: true
      }
    });

    for (const app of upcoming) {
      const message = `Lembrete: Você tem um agendamento de ${app.service.name} na ${app.company.name} amanhã às ${app.startTime}. Nos vemos lá!`;
      await sendWhatsAppNotification(app.clientPhone, message);
    }
  });
}
