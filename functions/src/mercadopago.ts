// functions/src/mercadopago.ts
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

let mercadoPagoClient: MercadoPagoConfig | null = null;

export function getMercadoPago(): MercadoPagoConfig {
  if (!mercadoPagoClient) {
    console.log('[getMercadoPago] Inicializando cliente...');
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    console.log('[getMercadoPago] Access Token presente:', !!accessToken);
    console.log('[getMercadoPago] Access Token length:', accessToken?.length || 0);
    
    if (!accessToken) {
      console.error('[getMercadoPago] ❌ MERCADO_PAGO_ACCESS_TOKEN não configurado!');
      console.error('[getMercadoPago] Configure com: firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN');
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado. Execute: firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN');
    }
    
    // Verificar se é token de produção ou teste
    const isProduction = accessToken.startsWith('APP_USR-');
    const isTest = accessToken.startsWith('TEST-');
    console.log('[getMercadoPago] Tipo de token:', isProduction ? 'PRODUÇÃO ✅' : isTest ? 'TESTE (SANDBOX) ⚠️' : 'DESCONHECIDO ❌');
    
    if (!isProduction && !isTest) {
      console.warn('[getMercadoPago] ⚠️ Token não reconhecido! Deve começar com APP_USR- (produção) ou TEST- (teste)');
    }
    
    console.log('[getMercadoPago] Criando MercadoPagoConfig...');
    mercadoPagoClient = new MercadoPagoConfig({
      accessToken,
      options: {
        timeout: 5000,
      },
    });
    console.log('[getMercadoPago] ✅ Cliente criado com sucesso');
  }
  return mercadoPagoClient;
}

export function getPaymentClient(): Payment {
  const client = getMercadoPago();
  return new Payment(client);
}

export function getPreferenceClient(): Preference {
  const client = getMercadoPago();
  return new Preference(client);
}

