# Configurar Credenciais do Mercado Pago

## 🎯 Objetivo

Este guia mostra como configurar as credenciais do Mercado Pago para usar no **modo sandbox (teste)** ou **produção**.

## 📋 Passo 1: Obter Credenciais do Mercado Pago

### Para Modo Sandbox (Teste)

1. Acesse o painel de desenvolvedores: https://www.mercadopago.com.br/developers/panel
2. Faça login na sua conta do Mercado Pago
3. Vá em **"Suas integrações"** > **"Credenciais"**
4. Na seção **"Credenciais de teste"**, copie o **Access Token de TESTE**
   - Deve começar com `TEST-` (exemplo: `TEST-1234567890-...`)
5. (Opcional) Copie também a **Public Key de TESTE** se precisar no frontend

### Para Modo Produção

1. Acesse o mesmo painel: https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas integrações"** > **"Credenciais"**
3. Na seção **"Credenciais de produção"**, copie o **Access Token de PRODUÇÃO**
   - Deve começar com `APP_USR-` (exemplo: `APP_USR-1234567890-...`)
4. (Opcional) Copie também a **Public Key de PRODUÇÃO**

⚠️ **Importante**: Para usar produção, sua conta precisa estar aprovada pelo Mercado Pago.

## 🔐 Passo 2: Adicionar Access Token como Secret

Execute no terminal (na raiz do projeto):

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
```

Quando solicitado:
- **Para TESTE**: Cole o Access Token que começa com `TEST-`
- **Para PRODUÇÃO**: Cole o Access Token que começa com `APP_USR-`

O terminal não mostrará o que você digitou (por segurança). Apenas pressione Enter após colar.

## 🔑 Passo 3: (Opcional) Adicionar Public Key

Se quiser usar a Public Key no frontend (para validações), você pode adicionar também:

```bash
firebase functions:secrets:set MERCADO_PAGO_PUBLIC_KEY
```

Quando solicitado, cole a Public Key correspondente (de teste ou produção).

## ✅ Passo 4: Verificar Secrets Configurados

Para verificar se o secret foi configurado corretamente:

```bash
firebase functions:secrets:access MERCADO_PAGO_ACCESS_TOKEN
```

**Deve mostrar:**
- Para teste: Token começando com `TEST-...`
- Para produção: Token começando com `APP_USR-...`

Para listar todos os secrets:

```bash
firebase functions:secrets:access
```

## 🚀 Passo 5: Deploy das Functions

⚠️ **IMPORTANTE**: Após configurar os secrets, você **DEVE** fazer deploy novamente das functions:

```bash
cd functions
npm run build
firebase deploy --only functions
```

Ou deploy apenas da function específica:

```bash
firebase deploy --only functions:createMercadoPagoPayment
```

## 🧪 Passo 6: Verificar se Está Funcionando

Após o deploy, teste um pagamento e verifique os logs:

```bash
firebase functions:log --only createMercadoPagoPayment --limit 10
```

### Em Modo Teste (Sandbox)
Os logs devem mostrar:
```
[getMercadoPago] Tipo de token: TESTE (SANDBOX) ⚠️
[createMercadoPagoPayment] Modo sandbox: true
[createMercadoPagoPayment] Modo: ⚠️ SANDBOX (TESTE)
```

A URL do checkout deve começar com: `sandbox.mercadopago.com.br`

### Em Modo Produção
Os logs devem mostrar:
```
[getMercadoPago] Tipo de token: PRODUÇÃO ✅
[createMercadoPagoPayment] Modo sandbox: false
[createMercadoPagoPayment] Modo: ✅ PRODUÇÃO
```

A URL do checkout deve começar com: `www.mercadopago.com.br`

## 💳 Testando Pagamentos no Sandbox

Para testar pagamentos no modo sandbox, use **APENAS** os cartões de teste do Mercado Pago:

### Cartão Mastercard (Aprovado)
- **Número**: `5031 4332 1540 6351`
- **CVV**: `123`
- **Data**: Qualquer data futura (ex: `11/30`)
- **Nome**: Qualquer nome

### Cartão Visa (Aprovado)
- **Número**: `4235 6477 2802 5682`
- **CVV**: `123`
- **Data**: Qualquer data futura
- **Nome**: Qualquer nome

⚠️ **NÃO use cartões reais no sandbox!** Eles não funcionarão.

## 📝 Notas Importantes

1. **O Access Token é SENSÍVEL** - nunca commite no código
2. **Use sempre secrets do Firebase** para credenciais
3. **O código detecta automaticamente** se está em teste ou produção baseado no prefixo do token
4. **Faça deploy após cada mudança** de token
5. **Para produção**, sua conta precisa estar aprovada pelo Mercado Pago

## 🔄 Alternando Entre Teste e Produção

Para alternar entre modo teste e produção, basta atualizar o secret:

```bash
# Para usar TESTE
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole token que começa com TEST-

# Para usar PRODUÇÃO
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole token que começa com APP_USR-
```

**Lembre-se**: Após cada mudança, faça deploy novamente!

## 🆘 Troubleshooting

### Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"

1. Verifique se o secret foi configurado:
   ```bash
   firebase functions:secrets:access MERCADO_PAGO_ACCESS_TOKEN
   ```

2. Verifique se o nome está correto (case-sensitive):
   - ✅ `MERCADO_PAGO_ACCESS_TOKEN`
   - ❌ `mercado_pago_access_token`

3. Faça deploy novamente após configurar

### Erro: "Token não reconhecido"

O token deve começar com:
- `TEST-` para sandbox
- `APP_USR-` para produção

Verifique se copiou o token correto do painel do Mercado Pago.

### Checkout não aparece

1. Verifique os logs da function
2. Confirme que o token está correto
3. Verifique se fez deploy após configurar o secret
4. No sandbox, certifique-se de usar cartões de teste

## 📚 Referências

- [Painel de Desenvolvedores - Mercado Pago](https://www.mercadopago.com.br/developers/panel)
- [Credenciais - Documentação MP](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials)
- [Cartões de Teste - Documentação MP](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-test/test-cards)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)


