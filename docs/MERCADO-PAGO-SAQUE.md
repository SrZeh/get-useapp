# Saques no Mercado Pago - Como Funciona

Este documento explica como os usuários podem sacar os valores recebidos dos alugueis no Mercado Pago.

## Como Funciona o Saque no Mercado Pago

### 1. Saldo Disponível

Quando um pagamento é aprovado, o valor fica disponível na conta do Mercado Pago:

- **Saldo Disponível**: Valor que pode ser sacado imediatamente
- **Saldo Pendente**: Valor aguardando liberação (geralmente 14 dias para novos vendedores)
- **Saldo em Processamento**: Valor sendo transferido para conta bancária

### 2. Período de Liberação

O Mercado Pago tem um período de liberação do saldo:

- **Vendedores Novos**: 14 dias após o pagamento
- **Vendedores Antigos**: Liberação mais rápida (7 dias ou menos)
- **Vendedores Verificados**: Pode ser imediato em alguns casos

### 3. Formas de Saque

O usuário pode sacar de várias formas:

#### A. Transferência Bancária (PIX/TED)
- **PIX**: Transferência instantânea (disponível 24h)
- **TED**: Transferência bancária tradicional (1 dia útil)
- **Taxa**: Geralmente gratuita

#### B. Conta Mercado Pago
- Deixar o dinheiro na conta para usar em outras transações
- Pode usar para pagar outras coisas no Mercado Pago

#### C. Cartão de Débito
- Alguns casos permitem saque via cartão
- Taxas podem aplicar

## Como Implementar no App

### Opção 1: Link Direto para Saque (Recomendado)

Redirecionar o usuário para o painel do Mercado Pago:

```typescript
// No app, criar botão "Sacar Dinheiro"
function WithdrawButton() {
  const handleWithdraw = () => {
    // Abrir painel do Mercado Pago em browser
    const url = 'https://www.mercadopago.com.br/activities/balance';
    Linking.openURL(url);
  };
  
  return (
    <Button onPress={handleWithdraw}>
      Sacar Dinheiro
    </Button>
  );
}
```

### Opção 2: API de Saques (Avançado)

Usar a API do Mercado Pago para criar saques programaticamente:

```typescript
// Backend: functions/src/index.ts
export const createWithdrawal = onCall(
  { region: "southamerica-east1", secrets: ["MERCADO_PAGO_ACCESS_TOKEN"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");
    
    const { amount, bankAccountId } = data as {
      amount: number;
      bankAccountId: string;
    };
    
    // Obter access_token do usuário (via OAuth)
    const userProfile = await db.doc(`users/${uid}`).get();
    const userAccessToken = userProfile.data()?.mercadoPagoAccessToken;
    
    if (!userAccessToken) {
      throw new HttpsError("failed-precondition", "Conecte sua conta Mercado Pago primeiro");
    }
    
    // Criar saque via API
    const mp = new MercadoPagoConfig({ accessToken: userAccessToken });
    const withdrawal = await mp.withdrawals.create({
      amount: amount,
      bank_account_id: bankAccountId,
    });
    
    return { withdrawalId: withdrawal.id, status: withdrawal.status };
  }
);
```

## Fluxo Recomendado (Simples)

### 1. Mostrar Saldo Disponível

```typescript
// Componente para mostrar saldo
function BalanceDisplay({ userId }: { userId: string }) {
  const [balance, setBalance] = useState(0);
  
  useEffect(() => {
    // Buscar saldo do Firestore (atualizado via webhook)
    const unsubscribe = db
      .doc(`users/${userId}`)
      .onSnapshot((snap) => {
        const data = snap.data();
        setBalance(data?.mercadoPagoBalance || 0);
      });
    
    return () => unsubscribe();
  }, [userId]);
  
  return (
    <View>
      <Text>Saldo Disponível: R$ {balance.toFixed(2)}</Text>
      <Button onPress={() => Linking.openURL('https://www.mercadopago.com.br/activities/balance')}>
        Sacar Dinheiro
      </Button>
    </View>
  );
}
```

### 2. Atualizar Saldo via Webhook

Quando um pagamento é aprovado, atualizar o saldo do vendedor:

```typescript
// functions/src/index.ts - mercadoPagoWebhook
export const mercadoPagoWebhook = onRequest(
  { region: "southamerica-east1", secrets: ["MERCADO_PAGO_ACCESS_TOKEN"] },
  async (req, res) => {
    // ... processar pagamento ...
    
    if (payment.status === 'approved') {
      // Atualizar saldo do vendedor no Firestore
      const ownerRef = db.doc(`users/${itemOwnerUid}`);
      await ownerRef.set({
        mercadoPagoBalance: admin.firestore.FieldValue.increment(ownerPayout),
        lastBalanceUpdate: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
    }
  }
);
```

## Estrutura de Dados no Firestore

```typescript
// users/{uid}
{
  mercadoPagoBalance: 15000, // Em centavos (R$ 150,00)
  mercadoPagoPendingBalance: 5000, // Em centavos (R$ 50,00)
  lastBalanceUpdate: Timestamp,
  mercadoPagoAccountId: "123456789", // ID da conta (se OAuth)
  mercadoPagoAccessToken: "APP_USR-...", // Se OAuth configurado
}
```

## Considerações Importantes

### 1. Período de Liberação
- Novos vendedores: 14 dias
- Vendedores antigos: 7 dias ou menos
- Verificados: Pode ser imediato

### 2. Taxas
- Transferência bancária: Geralmente gratuita
- Alguns métodos podem ter taxas

### 3. Limites
- Limite mínimo de saque: Geralmente R$ 10,00
- Limite diário: Varia conforme verificação da conta

### 4. Segurança
- Usuário precisa estar logado no Mercado Pago
- Verificação de identidade pode ser necessária
- 2FA recomendado

## Implementação Futura (OAuth)

Com OAuth implementado, podemos:

1. **Acessar saldo via API**
   ```typescript
   const balance = await mp.balance.get();
   ```

2. **Criar saques programaticamente**
   ```typescript
   const withdrawal = await mp.withdrawals.create({...});
   ```

3. **Rastrear histórico de saques**
   ```typescript
   const withdrawals = await mp.withdrawals.list();
   ```

## Referências

- [Painel de Saldo Mercado Pago](https://www.mercadopago.com.br/activities/balance)
- [API de Saques](https://www.mercadopago.com.br/developers/pt/reference)
- [Período de Liberação](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/payment-methods)




