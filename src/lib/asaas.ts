import axios from 'axios';

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = 'https://www.asaas.com/api/v3';

const asaasClient = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    access_token: ASAAS_API_KEY,
  },
});

export async function createAsaasCustomer(data: {
  name: string;
  email: string;
  phone: string;
}) {
  try {
    const response = await asaasClient.post('/customers', {
      name: data.name,
      email: data.email,
      mobilePhone: data.phone,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating Asaas customer:', error.response?.data || error.message);
    throw error;
  }
}

export async function createAsaasPixCharge(data: {
  customerId: string;
  value: number;
  description: string;
  dueDate: string;
  externalReference?: string;
}) {
  try {
    const response = await asaasClient.post('/payments', {
      customer: data.customerId,
      billingType: 'PIX',
      value: data.value,
      dueDate: data.dueDate,
      description: data.description,
      externalReference: data.externalReference,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating Asaas Pix charge:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAsaasPixQrCode(paymentId: string) {
  try {
    const response = await asaasClient.get(`/payments/${paymentId}/pixQrCode`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting Asaas Pix QR Code:', error.response?.data || error.message);
    throw error;
  }
}

export async function getAsaasPayment(paymentId: string) {
  try {
    const response = await asaasClient.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error getting Asaas payment:', error.response?.data || error.message);
    throw error;
  }
}
