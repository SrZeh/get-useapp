# Setup Mercado Pago - Get & Use

## 1. Criar Conta no Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers
2. Clique em **"Criar conta"** ou **"Entrar"** se já tiver
3. Complete o cadastro com dados da empresa/pessoa jurídica (recomendado para marketplace)

## 2. Criar Aplicação (App)

1. No painel do desenvolvedor: https://www.mercadopago.com.br/developers/panel/app
2. Clique em **"Criar aplicação"**
3. Preencha:
   - **Nome**: `Get & Use - Produção` (ou `Get & Use - Teste` para sandbox)
   - **Plataforma**: Web
   - **Descrição**: Marketplace de aluguel de itens
4. Salve e anote o **Application ID**

## 3. Obter Credenciais

### ⚠️ IMPORTANTE: Use Credenciais de PRODUÇÃO

Para usar o checkout **SEM marca d'água de sandbox** e com **PIX disponível**, você DEVE usar credenciais de **PRODUÇÃO**.

### Access Token (Produção) - OBRIGATÓRIO
1. Na aplicação criada, vá em **"Credenciais"**
2. Copie o **Access Token de PRODUÇÃO** (começa com `APP_USR-...`)
   - ⚠️ **NÃO use** o Access Token de teste (começa com `TEST-...`)
   - Token de teste = Sandbox (com marca d'água e métodos limitados)
   - Token de produção = Produção (sem marca d'água, todos os métodos)
3. ⚠️ **MANTENHA SECRETO** - nunca commite no código!

### Public Key (Produção)
1. Na mesma página de credenciais
2. Copie a **Public Key de PRODUÇÃO** (começa com `APP_USR-...`)
3. Esta pode ser usada no frontend (segura para expor)

### Credenciais de Teste (Sandbox) - APENAS PARA TESTES
1. Role até a seção **"Credenciais de teste"**
2. ⚠️ **NÃO use para produção** - apenas para testes
3. Access Token de teste começa com `TEST-...`

## 4. Configurar Webhook (Notificações)

1. Na aplicação, vá em **"Webhooks"**
2. Adicione a URL: `https://southamerica-east1-upperreggae.cloudfunctions.net/mercadoPagoWebhook`
   - ⚠️ Substitua `upperreggae` pelo seu project ID do Firebase
3. Selecione os eventos:
   - `payment`
   - `merchant_order`
4. Salve

## 5. Configurar Split Payment (Marketplace)

1. No painel, vá em **"Marketplace"** ou **"Split de pagamento"**
2. Ative o modo **"Marketplace"**
3. Configure:
   - **Taxa da plataforma**: 10% (ou conforme seu modelo)
   - **Repasse automático**: Ativado
   - **Prazo de repasse**: 14 dias (padrão) ou D+1 (com taxa adicional)

## 6. Adicionar Credenciais ao Firebase Functions

### Via Terminal (Recomendado)
```bash
# Access Token (Produção)
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN

# Cole o token quando solicitado

# Public Key (Produção - opcional, pode ser env var)
firebase functions:secrets:set MERCADO_PAGO_PUBLIC_KEY

# Cole a public key quando solicitado
```

### Via Firebase Console
1. Firebase Console → Functions → Configurações
2. Seção "Secrets"
3. Adicione:
   - `MERCADO_PAGO_ACCESS_TOKEN` = (seu access token)
   - `MERCADO_PAGO_PUBLIC_KEY` = (sua public key)

## 7. Habilitar PIX na Conta

⚠️ **IMPORTANTE**: Para PIX aparecer no checkout, você precisa:

1. **Usar Access Token de PRODUÇÃO** (não de teste)
2. **Habilitar PIX na conta do Mercado Pago**:
   - Acesse o painel do Mercado Pago
   - Vá em **"Configurações"** → **"Meios de pagamento"**
   - Ative o **PIX** se ainda não estiver ativo
   - Verifique se sua conta está aprovada para receber pagamentos via PIX

## 8. Testar em Sandbox (Opcional)

⚠️ **Nota**: Sandbox tem limitações:
- Mostra marca d'água "SANDBOX"
- PIX pode não aparecer ou aparecer apenas boleto
- Use apenas para testes iniciais

Para testar em sandbox:
1. Use as credenciais de teste (começam com `TEST-...`)
2. Cartão de teste: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/testing
   - **Aprovado**: `5031 4332 1540 6351` (CVV: 123)
   - **Recusado**: `5031 4332 1540 6351` (CVV: 123)
3. PIX de teste: Pode não estar disponível ou mostrar apenas boleto

## 8. Taxas do Mercado Pago

### Cartão de Crédito
- **Taxa**: ~3,99% + R$0,39 por transação
- **Parcelamento**: Taxa adicional por parcela

### PIX
- **Taxa**: ~1,99% por transação
- **Sem taxa fixa**

### Split Payment (Marketplace)
- **Sem taxa adicional** para split automático
- A taxa é calculada sobre o valor total

## 9. Estrutura de Taxas do Get & Use

Mantendo a mesma lógica atual:
- **Taxa de serviço**: 7% do valor base (fica na plataforma)
- **Taxa do Mercado Pago**: 3,99% + R$0,39 (cartão) ou 1,99% (PIX)
- **Divisão**: 10% plataforma / 90% dono (do valor base)

## Próximos Passos

Após configurar:
1. ✅ Instalar SDK do Mercado Pago
2. ✅ Implementar criação de pagamento
3. ✅ Configurar split automático
4. ✅ Implementar webhook handler
5. ✅ Atualizar frontend

