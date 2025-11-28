# Configurar Secrets do Firebase Functions

No Firebase Functions, os secrets **não** são configurados via arquivos `.env`. Eles são gerenciados pelo Firebase Secret Manager e configurados via comandos CLI.

## Secrets Necessários

O projeto precisa dos seguintes secrets configurados:

1. **MERCADO_PAGO_ACCESS_TOKEN** - Token de acesso do Mercado Pago
2. **SENDGRID_API_KEY** - Chave da API do SendGrid para envio de emails
3. **SENDGRID_FROM** - Email remetente do SendGrid

## Como Configurar

### 1. Mercado Pago Access Token

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
```

Quando solicitado, cole o token:
- **Produção**: `APP_USR-...` (obtido no painel do Mercado Pago)
- **Teste/Sandbox**: `TEST-...` (obtido no painel do Mercado Pago)

**Onde encontrar:**
- Acesse: https://www.mercadopago.com.br/developers/panel
- Vá em "Suas integrações" > "Credenciais"
- Copie o "Access Token" (produção ou teste)

### 2. SendGrid API Key

```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

Quando solicitado, cole a chave da API do SendGrid.

**Onde encontrar:**
- Acesse: https://app.sendgrid.com/settings/api_keys
- Clique em "Create API Key"
- Dê um nome (ex: "Get&Use Functions")
- Selecione "Full Access" ou apenas "Mail Send"
- Copie a chave (ela só aparece uma vez!)

### 3. SendGrid From Email

```bash
firebase functions:secrets:set SENDGRID_FROM
```

Quando solicitado, cole o email remetente (ex: `noreply@geteuse.com.br`).

**Importante:**
- O email deve estar verificado no SendGrid
- Acesse: https://app.sendgrid.com/settings/sender_auth
- Configure "Single Sender Verification" ou "Domain Authentication"

## Verificar Secrets Configurados

Para listar todos os secrets configurados:

```bash
firebase functions:secrets:access
```

## Atualizar um Secret

Para atualizar um secret existente:

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
```

## Remover um Secret

```bash
firebase functions:secrets:destroy MERCADO_PAGO_ACCESS_TOKEN
```

**⚠️ Cuidado:** Remover um secret pode quebrar as functions que dependem dele!

## Após Configurar

Após configurar os secrets, você precisa **fazer o deploy novamente** das functions que os utilizam:

```bash
cd functions
npm run build
firebase deploy --only functions
```

Ou deploy apenas de uma function específica:

```bash
firebase deploy --only functions:createMercadoPagoPayment
```

## Troubleshooting

### Erro: "Secret não encontrado"

Se você receber um erro dizendo que o secret não está configurado:

1. Verifique se o secret foi configurado:
   ```bash
   firebase functions:secrets:access
   ```

2. Verifique se o nome do secret está correto (case-sensitive):
   - ✅ `MERCADO_PAGO_ACCESS_TOKEN`
   - ❌ `mercado_pago_access_token`
   - ❌ `MERCADO_PAGO_TOKEN`

3. Faça o deploy novamente após configurar:
   ```bash
   firebase deploy --only functions
   ```

### Erro: "SENDGRID_API_KEY ausente"

1. Configure o secret:
   ```bash
   firebase functions:secrets:set SENDGRID_API_KEY
   ```

2. Faça o deploy novamente:
   ```bash
   firebase deploy --only functions
   ```

### Erro: "MERCADO_PAGO_ACCESS_TOKEN não configurado"

1. Configure o secret:
   ```bash
   firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
   ```

2. Verifique se o token está correto:
   - Deve começar com `APP_USR-` (produção) ou `TEST-` (teste)
   - Não deve ter espaços ou quebras de linha

3. Faça o deploy novamente:
   ```bash
   firebase deploy --only functions
   ```

## Functions que Usam Secrets

### Mercado Pago
- `createMercadoPagoPayment` - Usa `MERCADO_PAGO_ACCESS_TOKEN`
- `mercadoPagoWebhook` - Usa `MERCADO_PAGO_ACCESS_TOKEN`

### SendGrid (Emails)
- `onReservationCreated` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `onMessageCreated` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `acceptReservation` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `rejectReservation` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `cancelAcceptedReservation` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `cancelWithRefund` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `confirmCheckoutSession` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `releasePayoutToOwner` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `markPickup` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `confirmReturn` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`
- `createUserReview` - Usa `SENDGRID_API_KEY` e `SENDGRID_FROM`

## Notas Importantes

1. **Secrets são seguros**: Eles são armazenados no Google Secret Manager e não aparecem nos logs
2. **Case-sensitive**: Os nomes dos secrets são case-sensitive
3. **Deploy necessário**: Após configurar um secret, você precisa fazer deploy novamente
4. **Não use `.env`**: Firebase Functions não usa arquivos `.env` para secrets
5. **Ambiente local**: Para testar localmente, use `firebase emulators:start` que carregará os secrets automaticamente

## Referências

- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env#secret-manager)
- [SendGrid API Keys](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
- [Mercado Pago Credentials](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/credentials)

