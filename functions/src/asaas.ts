// functions/src/asaas.ts
import axios, { AxiosInstance } from 'axios';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
let asaasClient: AxiosInstance | null = null;

export interface AsaasCustomer {
  object: string;
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  country?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  canDelete?: boolean;
  cannotBeDeletedReason?: string;
  canEdit?: boolean;
  cannotEditReason?: string;
  personType?: string;
  companyType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AsaasPaymentRequest {
  customer: string;
  billingType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO' | 'UNDEFINED';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value?: number;
    dueDateLimitDays?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  fine?: {
    value?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value?: number;
    type?: 'FIXED' | 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: {
    walletId: string;
    fixedValue?: number;
    totalValue?: number;
    percentualValue?: number;
    totalValueToPay?: number;
    description?: string;
  }[];
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
}

export interface AsaasPaymentResponse {
  object: string;
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  originalValue?: number;
  interestValue?: number;
  description?: string;
  billingType: string;
  status: string;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted?: boolean;
  anticipated?: boolean;
  anticipable?: boolean;
  refunds?: any;
  chargeback?: any;
  split?: {
    walletId: string;
    fixedValue: number;
    totalValue: number;
    percentualValue?: number;
    totalValueToPay?: number;
    grossValue?: number;
    description?: string;
    releaseDate?: string;
  }[];
  pixTransaction?: {
    id: string;
    qrCode: string;
    qrCodeBase64: string;
    endToEndIdentifier?: string;
  };
}

export interface AsaasWebhookEvent {
  event: string;
  payment?: AsaasPaymentResponse;
  customer?: AsaasCustomer;
  [key: string]: any;
}

export function getAsaasClient(): AxiosInstance {
  if (!asaasClient) {
    const apiKey = process.env.ASAAS_API_KEY;
    
    if (!apiKey) {
      console.error('[getAsaasClient] ❌ ASAAS_API_KEY não configurado!');
      console.error('[getAsaasClient] Configure com: firebase functions:secrets:set ASAAS_API_KEY');
      throw new Error('ASAAS_API_KEY não configurado. Execute: firebase functions:secrets:set ASAAS_API_KEY');
    }

    console.log('[getAsaasClient] Criando cliente Asaas...');
    console.log('[getAsaasClient] API URL:', ASAAS_API_URL);
    console.log('[getAsaasClient] API Key presente:', !!apiKey);
    console.log('[getAsaasClient] API Key prefixo:', apiKey.substring(0, 10) + '...');

    asaasClient = axios.create({
      baseURL: ASAAS_API_URL,
      headers: {
        'access_token': apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Interceptor para logs
    asaasClient.interceptors.request.use(
      (config) => {
        console.log('[Asaas] Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('[Asaas] Request error:', error);
        return Promise.reject(error);
      }
    );

    asaasClient.interceptors.response.use(
      (response) => {
        console.log('[Asaas] Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        console.error('[Asaas] Response error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );

    console.log('[getAsaasClient] ✅ Cliente criado com sucesso');
  }

  return asaasClient;
}

/**
 * Criar cliente no Asaas
 */
export async function createAsaasCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj?: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  city?: string;
  state?: string;
  externalReference?: string;
}): Promise<AsaasCustomer> {
  const client = getAsaasClient();
  const response = await client.post<AsaasCustomer>('/customers', data);
  return response.data;
}

/**
 * Buscar cliente no Asaas
 */
export async function getAsaasCustomer(customerId: string): Promise<AsaasCustomer> {
  const client = getAsaasClient();
  const response = await client.get<AsaasCustomer>(`/customers/${customerId}`);
  return response.data;
}

/**
 * Criar pagamento no Asaas
 */
export async function createAsaasPayment(payment: AsaasPaymentRequest): Promise<AsaasPaymentResponse> {
  const client = getAsaasClient();
  const response = await client.post<AsaasPaymentResponse>('/payments', payment);
  return response.data;
}

/**
 * Buscar pagamento no Asaas
 */
export async function getAsaasPayment(paymentId: string): Promise<AsaasPaymentResponse> {
  const client = getAsaasClient();
  const response = await client.get<AsaasPaymentResponse>(`/payments/${paymentId}`);
  return response.data;
}

/**
 * Cancelar pagamento no Asaas
 */
export async function cancelAsaasPayment(paymentId: string): Promise<AsaasPaymentResponse> {
  const client = getAsaasClient();
  const response = await client.delete<AsaasPaymentResponse>(`/payments/${paymentId}`);
  return response.data;
}

