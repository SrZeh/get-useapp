# Problema: Cartões Não Funcionam no Sandbox

## Problema

O Mercado Pago está dizendo "não é possível usar esse cartão" no sandbox, mesmo usando cartões de teste.

## Soluções

### 1. Verificar Cartões de Teste Corretos

Use **APENAS** os cartões de teste do Mercado Pago:

#### Mastercard (Aprovado)
- **Número**: `5031 4332 1540 6351`
- **CVV**: `123`
- **Data**: `11/30` (ou qualquer data futura)
- **Nome**: Qualquer nome

#### Visa (Aprovado)
- **Número**: `4235 6477 2802 5682`
- **CVV**: `123`
- **Data**: `11/30`
- **Nome**: Qualquer nome

#### American Express
- **Número**: `3753 651535 56885`
- **CVV**: `1234`
- **Data**: `11/30`
- **Nome**: Qualquer nome

### 2. ⚠️ NÃO Use Cartões Reais

**Cartões reais NÃO funcionam no sandbox!** Apenas os cartões de teste listados acima.

### 3. Verificar Conta de Teste

Certifique-se de que:
1. Está usando **Access Token de TESTE** (`TEST-...`)
2. A conta de teste está configurada corretamente
3. Não há pendências na conta

### 4. Verificar Configuração da Preferência

O código já está configurado para permitir todos os métodos quando `method === "card"`. Se ainda não funcionar:

1. Verifique os logs da função
2. Confirme que não há erros na criação da preferência
3. Verifique se a URL do checkout está correta

### 5. Testar com Boleto ou PIX

Se os cartões não funcionarem, teste com:
- **Boleto**: Deve funcionar no sandbox
- **PIX**: Pode não estar habilitado na conta de teste

## Troubleshooting

### Erro: "Não é possível usar esse cartão"

**Causas possíveis:**
1. ❌ Usando cartão real (não funciona no sandbox)
2. ❌ Cartão de teste incorreto
3. ❌ Conta de teste não configurada
4. ❌ Access Token incorreto (deve ser `TEST-...`)

**Solução:**
1. Use APENAS cartões de teste do Mercado Pago
2. Verifique se está usando token de teste
3. Verifique se a conta está ativa

### Erro: "Método de pagamento não disponível"

**Causa:** Configuração da preferência bloqueando métodos

**Solução:** O código já permite todos os métodos para cartão. Se persistir, verifique os logs.

## Como Verificar

### 1. Verificar Token
```bash
firebase functions:secrets:access MERCADO_PAGO_ACCESS_TOKEN
```
Deve começar com `TEST-` para sandbox.

### 2. Verificar Logs
```bash
firebase functions:log --only createMercadoPagoPayment --limit 10
```

Deve mostrar:
- `Tipo de token: TESTE (SANDBOX) ⚠️`
- `Modo: ⚠️ SANDBOX (TESTE)`

### 3. Testar Checkout
- Use APENAS cartões de teste
- Não use cartões reais
- Verifique se a URL começa com `sandbox.mercadopago.com.br`

## Referências

- [Cartões de Teste - Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
- [Ambiente de Testes](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-your-integration)


