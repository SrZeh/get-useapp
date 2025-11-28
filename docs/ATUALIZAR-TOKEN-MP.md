# Atualizar Access Token do Mercado Pago

## Token de Produção

```
APP_USR-1433516116948338-112814-f46efa9a267377a8aa66540444ff84f7-3023406350
```

## Passo a Passo

### 1. ✅ Atualizar Secret no Firebase (JÁ EXECUTADO)

O comando já foi executado. **Cole o token quando solicitado no terminal:**

```
APP_USR-1433516116948338-112814-f46efa9a267377a8aa66540444ff84f7-3023406350
```

### 2. Fazer Deploy das Functions

**IMPORTANTE**: Após atualizar o secret, você DEVE fazer deploy novamente:

```bash
cd functions
npm run deploy
```

Ou:

```bash
firebase deploy --only functions
```

### 3. Verificar se Funcionou

Após o deploy, teste um pagamento e verifique os logs:

```bash
firebase functions:log --only createMercadoPagoPayment --limit 10
```

**Deve aparecer:**
- ✅ `[getMercadoPago] Tipo de token: PRODUÇÃO ✅`
- ✅ `[createMercadoPagoPayment] Modo: ✅ PRODUÇÃO`
- ✅ URL deve começar com `www.mercadopago.com.br` (não `sandbox.`)

## Nota sobre Compra Teste

O Mercado Pago pode exigir uma compra teste antes de liberar produção. Se ainda aparecer sandbox após seguir os passos:

1. Faça uma compra teste no modo sandbox
2. Complete a verificação da conta no painel
3. Aguarde aprovação (pode levar algumas horas)
4. Teste novamente

## Verificação Rápida

Para verificar se o token foi atualizado corretamente:

```bash
firebase functions:secrets:access MERCADO_PAGO_ACCESS_TOKEN
```

Deve mostrar o token que começa com `APP_USR-...`

## Próximos Passos

1. ✅ Cole o token no terminal (quando solicitado)
2. ⏳ Execute: `cd functions && npm run deploy`
3. ⏳ Teste um pagamento
4. ⏳ Verifique os logs para confirmar produção
