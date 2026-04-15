import axios from 'axios';

// Mock for WhatsApp/SMS notifications
// In a real scenario, you would use Z-API, Twilio, etc.

export async function sendWhatsAppNotification(phone: string, message: string) {
  console.log(`[MOCK NOTIFICATION] Sending WhatsApp to ${phone}: ${message}`);
  return true;
}

export async function sendAppointmentConfirmation(appointment: any, service: any) {
  const message = `Olá ${appointment.clientName}! Seu agendamento para ${service.name} no dia ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.startTime} foi recebido e aguarda confirmação de pagamento.`;
  return sendWhatsAppNotification(appointment.clientPhone, message);
}

export async function sendPaymentConfirmation(appointment: any) {
  const message = `Olá ${appointment.clientName}! Seu pagamento foi confirmado e seu horário às ${appointment.startTime} está garantido. Nos vemos lá!`;
  return sendWhatsAppNotification(appointment.clientPhone, message);
}
