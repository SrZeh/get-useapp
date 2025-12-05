# Asaas: Requisitos de Cadastro para Usuários

## 📋 Resposta Direta

**SIM**, cada usuário que vai **receber valores** (dono do item) precisa criar uma conta no Asaas para poder sacar os valores dos aluguéis.

**NÃO**, usuários que apenas **pagam** (locatários) não precisam criar conta - eles apenas pagam via checkout.

---

## 👥 Quem Precisa Criar Conta?

### ✅ PRECISA criar conta:
- **Donos de itens** (vendedores) - Para receber o repasse de 90% do valor
- **Plataforma** - Para receber a taxa de 10% do valor

### ❌ NÃO precisa criar conta:
- **Locatários** (compradores) - Apenas pagam via checkout, sem necessidade de conta

---

## 📝 Dados Necessários para Cadastro

### 1. Dados Pessoais (Obrigatórios)

| Campo | Descrição | Exemplo |
|------|-----------|---------|
| **Nome completo** | Nome completo conforme documento | "João Silva" |
| **CPF ou CNPJ** | Documento de identificação | "123.456.789-00" |
| **Data de nascimento** | Apenas para pessoa física | "01/01/1990" |
| **E-mail** | E-mail válido e único | "joao@email.com" |
| **Telefone** | Celular e/ou fixo | "(11) 98765-4321" |

---

### 2. Endereço Completo (Obrigatório)

| Campo | Descrição |
|------|-----------|
| **Logradouro** | Rua, Avenida, etc. |
| **Número** | Número do endereço |
| **Complemento** | Apartamento, bloco, etc. (opcional) |
| **Bairro** | Bairro |
| **CEP** | CEP válido |
| **Cidade** | Cidade |
| **Estado** | UF (SP, RJ, etc.) |

---

### 3. Dados Bancários (Obrigatório para Saque)

| Campo | Descrição | Exemplo |
|------|-----------|---------|
| **Banco** | Código do banco | "001" (Banco do Brasil) |
| **Agência** | Número da agência | "1234" |
| **Conta Corrente** | Número da conta | "12345-6" |
| **Tipo de Conta** | Corrente ou Poupança | "CORRENTE" |

**Importante:** Os dados bancários devem estar no **mesmo CPF/CNPJ** da conta Asaas.

---

### 4. Documentos de Identificação (Obrigatório)

#### Para Pessoa Física:
- ✅ **RG** (frente e verso)
- ✅ **CNH** (frente e verso)
- ✅ **Passaporte**
- ✅ **RNE** (para estrangeiros)
- ✅ **CTPS** (Carteira de Trabalho)
- ✅ **Carteira Profissional** (OAB, CRO, CRC, CREA, etc.)

#### Para Pessoa Jurídica:
- ✅ **Contrato Social** ou **Estatuto Social**
- ✅ **Documento do representante legal** (RG/CNH)

#### Requisitos dos Documentos:
- 📸 Foto **legível** e **colorida**
- 📸 Sem cortes ou partes faltando
- 📸 Dados devem coincidir com a Receita Federal
- 📸 **Selfie segurando o documento** (pode ser solicitado)

---

## ⏱️ Processo de Validação

### Etapas do Cadastro:

1. **Cadastro Inicial** (5-10 minutos)
   - Preencher dados pessoais
   - Criar senha
   - Confirmar e-mail

2. **Completar Perfil** (10-15 minutos)
   - Preencher endereço
   - Adicionar dados bancários
   - Enviar documentos

3. **Análise Cadastral** (2-7 dias úteis)
   - Asaas analisa os documentos
   - Verifica dados na Receita Federal
   - Pode solicitar documentos adicionais

4. **Aprovação**
   - Conta aprovada: pode receber e sacar
   - Conta pendente: pode receber, mas não sacar ainda

---

## 🔄 Status da Conta

| Status | Pode Receber? | Pode Sacar? | Observação |
|--------|---------------|-------------|------------|
| **Pendente** | ✅ Sim | ❌ Não | Aguardando análise |
| **Aprovada** | ✅ Sim | ✅ Sim | Conta totalmente ativa |
| **Rejeitada** | ❌ Não | ❌ Não | Precisa corrigir dados |

---

## 💡 Alternativas e Soluções

### ❌ Não há alternativa sem conta

O Asaas **exige** que cada recebedor tenha uma conta própria para:
- ✅ Segurança e compliance
- ✅ Rastreabilidade financeira
- ✅ Split de pagamentos funcionar
- ✅ Conformidade com regulamentações

### ✅ Soluções para Facilitar o Onboarding

#### 1. **Cadastro via Link Personalizado**
```typescript
// Asaas oferece API para criar link de onboarding
POST /v3/customers/{customerId}/onboarding
{
  "redirectUrl": "https://app.com/asaas/onboarding/success"
}

// Retorna link para usuário completar cadastro
{
  "onboardingUrl": "https://asaas.com/onboarding/abc123"
}
```

**Vantagem:** Usuário completa cadastro direto no Asaas, sem precisar coletar todos os dados no seu app.

---

#### 2. **Criar Cliente via API (Dados Mínimos)**
```typescript
// Criar cliente com dados básicos
POST /v3/customers
{
  "name": "João Silva",
  "cpfCnpj": "123.456.789-00",
  "email": "joao@email.com",
  "phone": "11987654321",
  "postalCode": "01310-100",
  "address": "Av. Paulista",
  "addressNumber": "1000",
  "complement": "Apto 101",
  "province": "Centro",
  "city": "São Paulo",
  "state": "SP"
}

// Retorna customerId e walletId
{
  "object": "customer",
  "id": "cus_123456",
  "walletId": "wallet_123456",
  "status": "PENDING" // Precisa completar cadastro
}
```

**Vantagem:** Cria o cliente programaticamente, usuário só completa documentos depois.

---

#### 3. **Fluxo Híbrido Recomendado**

```typescript
// 1. Quando usuário se cadastra no seu app
async function onboardAsaasUser(userId: string, userData: UserData) {
  // Criar cliente no Asaas com dados básicos
  const customer = await createAsaasCustomer({
    name: userData.name,
    cpfCnpj: userData.cpf,
    email: userData.email,
    phone: userData.phone,
    // ... outros dados que você já tem
  });

  // Salvar IDs no Firestore
  await db.collection('users').doc(userId).set({
    asaasCustomerId: customer.id,
    asaasWalletId: customer.walletId,
    asaasStatus: 'PENDING', // Precisa completar
  }, { merge: true });

  // Gerar link de onboarding
  const onboardingLink = await createOnboardingLink(customer.id);
  
  return {
    customerId: customer.id,
    walletId: customer.walletId,
    onboardingUrl: onboardingLink.onboardingUrl,
  };
}

// 2. Usuário completa cadastro quando necessário
// (quando vai receber primeiro pagamento, por exemplo)
async function completeAsaasOnboarding(userId: string) {
  const user = await getUser(userId);
  const onboardingUrl = await getOnboardingLink(user.asaasCustomerId);
  
  // Redirecionar usuário para completar cadastro
  return onboardingUrl;
}
```

---

## 🎯 Fluxo Recomendado para Get & Use App

### Opção 1: Cadastro Proativo (Recomendado)

**Quando:** No momento que usuário cria primeiro item para alugar

```typescript
// 1. Usuário cria item para alugar
// 2. Sistema detecta que precisa de conta Asaas
// 3. Mostra tela: "Para receber pagamentos, você precisa criar conta no Asaas"
// 4. Botão: "Criar conta agora" → abre link de onboarding
// 5. Usuário completa cadastro no Asaas
// 6. Webhook do Asaas notifica quando aprovado
// 7. Sistema atualiza status do usuário
```

**Vantagens:**
- ✅ Usuário já está engajado (quer alugar item)
- ✅ Cadastro acontece antes do primeiro pagamento
- ✅ Não bloqueia fluxo de pagamento

---

### Opção 2: Cadastro no Primeiro Pagamento

**Quando:** Quando primeira reserva é paga

```typescript
// 1. Reserva é paga
// 2. Sistema detecta que dono não tem conta Asaas
// 3. Cria cliente no Asaas (dados básicos)
// 4. Valor fica "pendente" na conta Asaas
// 5. Notifica dono: "Complete seu cadastro para receber R$ X"
// 6. Dono completa cadastro
// 7. Após aprovação, valor é liberado automaticamente
```

**Vantagens:**
- ✅ Não interrompe cadastro inicial
- ✅ Usuário tem motivação (dinheiro esperando)

**Desvantagens:**
- ⚠️ Pode atrasar recebimento (2-7 dias de análise)

---

### Opção 3: Cadastro Opcional (Não Recomendado)

**Quando:** Usuário escolhe quando cadastrar

**Problema:** 
- ❌ Pode esquecer de cadastrar
- ❌ Valores ficam presos na conta da plataforma
- ❌ Requer transferência manual depois

---

## 📊 Comparação: Mercado Pago vs Asaas

| Aspecto | Mercado Pago | Asaas |
|--------|--------------|-------|
| **Cadastro necessário?** | ❌ Não (split via OAuth) | ✅ Sim (split nativo) |
| **Complexidade cadastro** | N/A | ⭐⭐ Média |
| **Tempo de aprovação** | N/A | 2-7 dias úteis |
| **Dados necessários** | N/A | Nome, CPF, endereço, banco, docs |
| **Split automático** | ❌ Não (requer OAuth) | ✅ Sim (nativo) |
| **Transferência manual** | ✅ Sim (necessário) | ❌ Não (automático) |

---

## ⚠️ Pontos de Atenção

### 1. **Prazo de Aprovação (2-7 dias)**
- Durante esse período, usuário **pode receber** pagamentos
- Mas **não pode sacar** até aprovação
- Valores ficam "presos" na conta Asaas até aprovação

**Solução:** Comunicar claramente ao usuário sobre o prazo.

---

### 2. **Documentos Rejeitados**
- Se documentos forem rejeitados, usuário precisa corrigir
- Pode atrasar recebimento significativamente

**Solução:** 
- Validar documentos antes de enviar (quando possível)
- Fornecer guia claro de como tirar foto dos documentos
- Suporte para ajudar em caso de rejeição

---

### 3. **Dados Bancários**
- Conta bancária deve estar no mesmo CPF/CNPJ
- Não pode ser conta de terceiros

**Solução:** Validar CPF antes de pedir dados bancários.

---

### 4. **Múltiplos Usuários**
- Cada vendedor precisa de conta própria
- Não pode compartilhar conta

**Solução:** Comunicar claramente que é obrigatório.

---

## 💻 Exemplo de Implementação

### 1. Criar Cliente no Asaas

```typescript
// functions/src/index.ts
export const createAsaasCustomer = onCall(
  { region: "southamerica-east1", secrets: ["ASAAS_API_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { name, cpf, email, phone, address } = data as {
      name: string;
      cpf: string;
      email: string;
      phone: string;
      address: {
        postalCode: string;
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
      };
    };

    // Criar cliente no Asaas
    const customer = await createAsaasCustomerAPI({
      name,
      cpfCnpj: cpf.replace(/\D/g, ''), // Remove formatação
      email,
      phone: phone.replace(/\D/g, ''),
      postalCode: address.postalCode.replace(/\D/g, ''),
      address: address.street,
      addressNumber: address.number,
      complement: address.complement,
      province: address.neighborhood,
      city: address.city,
      state: address.state,
    });

    // Salvar no Firestore
    await db.collection('users').doc(uid).set({
      asaasCustomerId: customer.id,
      asaasWalletId: customer.walletId,
      asaasStatus: customer.status, // PENDING, APPROVED, etc.
      updatedAt: TS(),
    }, { merge: true });

    // Gerar link de onboarding
    const onboardingLink = await createOnboardingLinkAPI(customer.id);

    return {
      customerId: customer.id,
      walletId: customer.walletId,
      status: customer.status,
      onboardingUrl: onboardingLink.onboardingUrl,
    };
  }
);
```

---

### 2. Verificar Status do Cadastro

```typescript
// functions/src/index.ts
export const checkAsaasStatus = onCall(
  { region: "southamerica-east1", secrets: ["ASAAS_API_KEY"] },
  async ({ auth }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const userSnap = await db.collection('users').doc(uid).get();
    if (!userSnap.exists) {
      throw new HttpsError("not-found", "Usuário não encontrado.");
    }

    const user = userSnap.data() as any;
    if (!user.asaasCustomerId) {
      return { hasAccount: false };
    }

    // Buscar status atual no Asaas
    const customer = await getAsaasCustomerAPI(user.asaasCustomerId);

    // Atualizar no Firestore
    await db.collection('users').doc(uid).set({
      asaasStatus: customer.status,
      updatedAt: TS(),
    }, { merge: true });

    return {
      hasAccount: true,
      customerId: customer.id,
      walletId: customer.walletId,
      status: customer.status, // PENDING, APPROVED, REJECTED
      canReceive: customer.status === 'APPROVED',
      canWithdraw: customer.status === 'APPROVED',
    };
  }
);
```

---

### 3. Webhook de Atualização de Status

```typescript
// functions/src/index.ts
export const asaasCustomerWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
    secrets: ["ASAAS_API_KEY"],
  },
  async (req, res) => {
    try {
      const { event, customer } = req.body as {
        event: string;
        customer: {
          id: string;
          status: string;
        };
      };

      // Eventos: CUSTOMER_STATUS_CHANGED, CUSTOMER_DOCUMENT_APPROVED, etc.
      if (event === 'CUSTOMER_STATUS_CHANGED') {
        // Buscar usuário pelo customerId
        const usersSnap = await db.collection('users')
          .where('asaasCustomerId', '==', customer.id)
          .get();

        if (!usersSnap.empty) {
          const userDoc = usersSnap.docs[0];
          await userDoc.ref.set({
            asaasStatus: customer.status,
            updatedAt: TS(),
          }, { merge: true });

          // Notificar usuário se aprovado
          if (customer.status === 'APPROVED') {
            await createNotification({
              recipientId: userDoc.id,
              type: 'asaas_approved',
              title: 'Conta Asaas aprovada!',
              body: 'Você já pode receber e sacar seus pagamentos.',
            });
          }
        }
      }

      res.json({ received: true });
    } catch (e: any) {
      console.error("[AsaasCustomerWebhook] Erro:", e?.message, e);
      res.status(500).send("Webhook handler error");
    }
  }
);
```

---

## 📋 Checklist de Implementação

- [ ] Criar função `createAsaasCustomer` no backend
- [ ] Criar função `checkAsaasStatus` no backend
- [ ] Configurar webhook de status do cliente
- [ ] Criar tela de onboarding no frontend
- [ ] Adicionar validação: verificar se tem conta antes de criar item
- [ ] Adicionar indicador de status no perfil do usuário
- [ ] Criar notificações para status aprovado/rejeitado
- [ ] Documentar processo para usuários
- [ ] Criar FAQ sobre cadastro Asaas

---

## 🎯 Resumo Final

### ✅ SIM, usuários precisam criar conta

**Quem:** Apenas donos de itens (vendedores)

**Dados necessários:**
1. Dados pessoais (nome, CPF, email, telefone)
2. Endereço completo
3. Dados bancários
4. Documentos de identificação

**Tempo:** 2-7 dias úteis para aprovação

**Solução:** 
- Criar cliente via API com dados básicos
- Gerar link de onboarding para completar cadastro
- Webhook notifica quando aprovado
- Usuário pode receber antes de aprovar, mas só saca depois

---

**Última atualização:** 2024-12-04
**Baseado em:** Documentação oficial Asaas + Requisitos do projeto

