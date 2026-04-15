import axios from 'axios';

// Configuration for WhatsApp (Z-API is common in Brazil)
const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

export async function sendWhatsAppNotification(phone: string, message: string) {
  if (ZAPI_INSTANCE && ZAPI_TOKEN) {
    try {
      await axios.post(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
        phone,
        message
      });
      return true;
    } catch (error) {
      console.error("Z-API Error:", error);
      return false;
    }
  }
  
  // Fallback to log for development/test
  console.log(`[NOTIFICATION MOCK] To: ${phone} | Message: ${message}`);
  return true;
}

export async function sendAppointmentConfirmation(appointment: any, service: any) {
  const message = `Olá ${appointment.clientName}! Seu agendamento para ${service.name} no dia ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.startTime} foi recebido. Confira os detalhes aqui: ${process.env.NEXT_PUBLIC_APP_URL}/booking/status/${appointment.id}`;
  return sendWhatsAppNotification(appointment.clientPhone, message);
}

export async function sendPaymentConfirmation(appointment: any) {
  const message = `Olá ${appointment.clientName}! Seu pagamento foi confirmado e seu horário às ${appointment.startTime} está garantido. Nos vemos lá!`;
  return sendWhatsAppNotification(appointment.clientPhone, message);
}
