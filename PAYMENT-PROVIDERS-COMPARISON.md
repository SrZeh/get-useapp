# Comparação de Provedores de Pagamento

## 📊 Resumo Executivo

Este documento compara **Mercado Pago**, **Asaas**, **Transfeera** e **PagBank** em termos de tarifas, facilidade de implementação e funcionalidades para o projeto Get & Use App.

---

## 💰 Comparação de Tarifas

### Mercado Pago (Atual)

| Método | Tarifa | Observações |
|--------|--------|-------------|
| **PIX** | 1,99% | Sem taxa fixa |
| **Cartão de Crédito** | 3,99% + R$ 0,39 | À vista |
| **Cartão Parcelado** | 4,99% - 14,99% | Varia conforme parcelas |
| **Boleto** | R$ 3,50 | Por boleto compensado |

**Problemas Identificados:**
- ❌ Split de pagamentos requer OAuth (não implementado)
- ❌ Taxas altas para cartão parcelado
- ❌ Necessidade de transferência manual para vendedores

---

### Asaas

| Método | Tarifa | Observações |
|--------|--------|-------------|
| **PIX** | R$ 1,99 | Taxa fixa (independente do valor) |
| **Cartão à Vista** | 1,99% + R$ 0,49 | |
| **Cartão Parcelado (2-6x)** | 2,49% + R$ 0,49 | |
| **Cartão Parcelado (7-12x)** | 2,99% + R$ 0,49 | |
| **Cartão Parcelado (13-21x)** | 3,29% + R$ 0,49 | |
| **Cartão de Débito** | 1,89% + R$ 0,35 | |
| **Boleto** | R$ 1,99 | Por boleto compensado |

**Vantagens:**
- ✅ **Split nativo** - Divisão automática entre contas Asaas
- ✅ Taxas competitivas para cartão
- ✅ API moderna e bem documentada
- ✅ Checkout personalizável
- ✅ Ambiente sandbox para testes

**Desvantagens:**
- ⚠️ PIX tem taxa fixa (pode ser caro para valores baixos)
- ⚠️ Requer conta Asaas para cada vendedor

---

### Transfeera

| Método | Tarifa | Observações |
|--------|--------|-------------|
| **PIX (Pagamento)** | R$ 1,00 | Por transação |
| **PIX (Recebimento)** | 0,90% | Do valor recebido |
| **Boleto** | R$ 1,00 | Por transação |
| **Boleto com QR Code Pix** | R$ 2,00 | Por boleto |
| **Cartão à Vista** | 4,76% | |
| **Cartão Parcelado (2-6x)** | 13,42% | |
| **Cartão Parcelado (7-12x)** | 23,74% | |
| **Cartão Parcelado (13-18x)** | 35,09% | |
| **Cartão Parcelado (19-24x)** | 45,39% | |
| **Recebimento Cartão** | D+30 | Liberação em 30 dias |

**Vantagens:**
- ✅ Taxa de PIX muito competitiva (0,90%)
- ✅ Split de pagamentos disponível
- ✅ API bem documentada
- ✅ Ambiente sandbox

**Desvantagens:**
- ❌ Taxas de cartão muito altas (especialmente parcelado)
- ❌ Recebimento de cartão em D+30 (não imediato)

---

### PagBank

| Método | Tarifa | Observações |
|--------|--------|-------------|
| **PIX** | 0% | Primeiros 30 dias |
| **PIX (após 30 dias)** | Consultar | |
| **Cartão Débito (D+0)** | 1,99% | À vista, 1º ano |
| **Cartão Débito (D+0)** | 2,39% | Após 1º ano |
| **Cartão Crédito (D+0)** | 4,99% | À vista |
| **Cartão Crédito (D+0)** | 5,59% | Parcelado |
| **Cartão Crédito (D+14)** | 3,99% | À vista |
| **Cartão Crédito (D+14)** | 4,59% | Parcelado |
| **Cartão Crédito (D+30)** | 3,19% | À vista |
| **Cartão Crédito (D+30)** | 3,79% | Parcelado |
| **Boleto (D+14)** | 4,99% + R$ 0,40 + R$ 1,00 | |
| **Boleto (D+30)** | 3,99% + R$ 0,40 + R$ 1,00 | |

**Vantagens:**
- ✅ PIX grátis nos primeiros 30 dias
- ✅ Split de pagamentos disponível
- ✅ Taxas competitivas para D+30
- ✅ Checkout transparente

**Desvantagens:**
- ⚠️ Taxas mais altas para recebimento imediato (D+0)
- ⚠️ Informações de tarifas menos transparentes

---

## 🔧 Facilidade de Implementação

### Mercado Pago (Atual)

**Status:** ✅ Implementado

**Complexidade:** Média-Alta
- ✅ SDK oficial disponível
- ✅ Documentação completa
- ❌ Split requer OAuth (complexo)
- ❌ Webhook requer configuração manual
- ⚠️ Múltiplos ambientes (sandbox/produção)

**Código Atual:**
- `functions/src/mercadopago.ts` - Cliente MP
- `functions/src/index.ts` - `createMercadoPagoPayment`
- `functions/src/index.ts` - `mercadoPagoWebhook`
- `app/transaction/[id]/pay.tsx` - Tela de pagamento

**Problemas:**
```typescript
// TODO: Implementar OAuth para usar marketplace_fee e split automático
// Por enquanto, o pagamento vai para a conta do marketplace
// Depois, precisamos fazer transferência manual para o vendedor
```

---

### Asaas

**Status:** ❌ Não implementado

**Complexidade:** Baixa-Média
- ✅ API RESTful moderna
- ✅ Documentação clara e exemplos
- ✅ Collections Postman/Insomnia disponíveis
- ✅ Split nativo (sem OAuth necessário)
- ✅ Webhook simples
- ✅ Ambiente sandbox

**Implementação Estimada:**
- Criar cliente Asaas: ~2-3 horas
- Implementar criação de cobrança: ~2-3 horas
- Implementar webhook: ~1-2 horas
- Implementar split: ~1-2 horas
- **Total: ~6-10 horas**

**Estrutura Sugerida:**
```
functions/src/
  - asaas.ts          # Cliente Asaas
  - index.ts          # createAsaasPayment, asaasWebhook
app/transaction/[id]/
  - pay.tsx           # Atualizar para usar Asaas
```

---

### Transfeera

**Status:** ❌ Não implementado

**Complexidade:** Média
- ✅ API RESTful
- ✅ Documentação detalhada
- ✅ Ambiente sandbox
- ✅ Autenticação via token
- ⚠️ Menos exemplos na comunidade

**Implementação Estimada:**
- Criar cliente Transfeera: ~3-4 horas
- Implementar criação de pagamento: ~3-4 horas
- Implementar webhook: ~2-3 horas
- Implementar split: ~2-3 horas
- **Total: ~10-14 horas**

---

### PagBank

**Status:** ❌ Não implementado

**Complexidade:** Média-Alta
- ✅ API disponível
- ✅ Split de pagamentos
- ⚠️ Documentação menos detalhada
- ⚠️ Menos exemplos na comunidade
- ⚠️ Requer conta PagBank

**Implementação Estimada:**
- Criar cliente PagBank: ~4-5 horas
- Implementar criação de pagamento: ~3-4 horas
- Implementar webhook: ~2-3 horas
- Implementar split: ~3-4 horas
- **Total: ~12-16 horas**

---

## 🎯 Funcionalidades Comparadas

| Funcionalidade | Mercado Pago | Asaas | Transfeera | PagBank |
|----------------|--------------|-------|------------|---------|
| **PIX** | ✅ | ✅ | ✅ | ✅ |
| **Cartão de Crédito** | ✅ | ✅ | ✅ | ✅ |
| **Boleto** | ✅ | ✅ | ✅ | ✅ |
| **Split de Pagamentos** | ⚠️ (OAuth) | ✅ | ✅ | ✅ |
| **Webhook** | ✅ | ✅ | ✅ | ✅ |
| **Checkout Pronto** | ✅ | ✅ | ⚠️ | ✅ |
| **Ambiente Sandbox** | ✅ | ✅ | ✅ | ⚠️ |
| **API RESTful** | ✅ | ✅ | ✅ | ✅ |
| **Documentação** | ✅ | ✅ | ✅ | ⚠️ |
| **Suporte Técnico** | ✅ | ✅ | ✅ | ✅ |

---

## 💡 Recomendações

### Para o Get & Use App

#### 🥇 **Recomendação Principal: ASAAS**

**Motivos:**
1. ✅ **Split nativo** - Resolve o problema atual do Mercado Pago
2. ✅ **Taxas competitivas** - Especialmente para cartão
3. ✅ **Implementação simples** - API moderna e bem documentada
4. ✅ **Checkout personalizável** - Mantém UX similar
5. ✅ **Ambiente sandbox** - Facilita testes

**Cenário Ideal:**
- Valores médios/altos: Asaas é mais econômico
- Split automático: Sem necessidade de OAuth
- Implementação rápida: ~6-10 horas

**Quando NÃO usar:**
- Valores muito baixos (< R$ 100): Taxa fixa de PIX pode ser alta

---

#### 🥈 **Alternativa: TRANSFEERA**

**Motivos:**
1. ✅ **PIX muito barato** (0,90%)
2. ✅ **Split disponível**
3. ⚠️ **Cartão caro** - Só recomendado se PIX for o método principal

**Cenário Ideal:**
- Foco em PIX
- Valores variados
- Não depende de parcelamento

---

#### 🥉 **Alternativa: PAGBANK**

**Motivos:**
1. ✅ **PIX grátis** nos primeiros 30 dias
2. ✅ **Split disponível**
3. ⚠️ **Documentação menos clara**
4. ⚠️ **Implementação mais complexa**

**Cenário Ideal:**
- Período inicial (30 dias grátis)
- Foco em PIX
- Valores altos

---

## 📋 Plano de Migração Sugerido (Asaas)

### Fase 1: Preparação (1-2 dias)
1. Criar conta Asaas
2. Configurar ambiente sandbox
3. Obter API keys
4. Testar endpoints básicos

### Fase 2: Implementação Backend (2-3 dias)
1. Criar `functions/src/asaas.ts`
2. Implementar `createAsaasPayment`
3. Implementar `asaasWebhook`
4. Atualizar `computeFees` para Asaas
5. Testar em sandbox

### Fase 3: Implementação Frontend (1-2 dias)
1. Atualizar `app/transaction/[id]/pay.tsx`
2. Criar componente `AsaasCheckout` (se necessário)
3. Atualizar fluxo de pagamento
4. Testar integração completa

### Fase 4: Testes e Deploy (1-2 dias)
1. Testes end-to-end
2. Configurar webhook em produção
3. Deploy gradual (feature flag)
4. Monitoramento

**Total Estimado: 5-9 dias**

---

## 🔄 Comparação de Custos (Exemplo)

### Cenário: Pagamento de R$ 500,00

| Provedor | PIX | Cartão (à vista) | Total Cliente Paga |
|----------|-----|------------------|-------------------|
| **Mercado Pago** | R$ 9,95 (1,99%) | R$ 20,34 (3,99% + R$0,39) | R$ 509,95 / R$ 520,34 |
| **Asaas** | R$ 1,99 (fixo) | R$ 10,44 (1,99% + R$0,49) | R$ 501,99 / R$ 510,44 |
| **Transfeera** | R$ 4,50 (0,90%) | R$ 23,80 (4,76%) | R$ 504,50 / R$ 523,80 |
| **PagBank (D+0)** | R$ 0,00 (30 dias) | R$ 24,95 (4,99%) | R$ 500,00 / R$ 524,95 |
| **PagBank (D+30)** | Consultar | R$ 15,95 (3,19%) | R$ 500,00 / R$ 515,95 |

**Vencedor por método:**
- **PIX:** PagBank (grátis) ou Transfeera (0,90%)
- **Cartão:** Asaas (1,99% + R$0,49)

---

## 📝 Próximos Passos

1. **Decidir provedor** baseado nas necessidades
2. **Criar conta sandbox** do provedor escolhido
3. **Implementar integração** seguindo plano de migração
4. **Testar extensivamente** antes de produção
5. **Configurar webhooks** e monitoramento
6. **Fazer deploy gradual** com feature flag

---

## 🔗 Links Úteis

- [Asaas - Documentação API](https://docs.asaas.com/reference/comece-por-aqui)
- [Transfeera - Documentação](https://docs.transfeera.dev/docs/comece-por-aqui-introducao)
- [PagBank - Split de Pagamento](https://pagbank.com.br/para-seu-negocio/online-integracao/split-de-pagamento)
- [Mercado Pago - Documentação](https://www.mercadopago.com.br/developers/pt/docs)

---

**Última atualização:** 2024
**Autor:** Análise comparativa para Get & Use App



