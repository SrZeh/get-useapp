# Configurar PIX no Código - Mercado Pago

## Problema

O PIX não aparece no checkout do Mercado Pago, mesmo com a configuração correta no código.

## Solução: Configuração Completa

Segundo o suporte do Mercado Pago, o PIX precisa ser configurado tanto na conta quanto no código. Siga os passos abaixo:

### 1. Cadastrar Chave PIX na Conta

**⚠️ OBRIGATÓRIO**: Você precisa ter uma **Chave PIX cadastrada** na sua conta do Mercado Pago.

1. Acesse: https://www.mercadopago.com.br/account/settings
2. Vá em **"Chaves PIX"** ou **"Meios de pagamento"**
3. Cadastre uma Chave PIX (CPF, CNPJ, Email, Telefone ou Chave Aleatória)
4. Confirme a chave seguindo as instruções

### 2. Habilitar PIX nas Configurações

1. Acesse: https://www.mercadopago.com.br/account/settings
2. Vá em **"Meios de pagamento"**
3. Ative/habilite o **PIX**
4. Salve as alterações

### 3. Verificar Credenciais de Produção

O PIX **só funciona com credenciais de PRODUÇÃO**:

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas integrações"** > **"Credenciais"**
3. Certifique-se de usar o **Access Token de PRODUÇÃO** (começa com `APP_USR-...`)
4. **NÃO use** credenciais de teste (`TEST-...`) - PIX não aparece em sandbox

### 4. Configuração no Código

O código já está configurado corretamente:

```typescript
payment_methods: {
  excluded_payment_methods: [], // Vazio = permitir todos
  excluded_payment_types: [], // Vazio = permitir todos
  installments: 12,
}
```

**Não é necessário** adicionar configurações específicas para PIX - ele aparecerá automaticamente se:
- ✅ Chave PIX cadastrada na conta
- ✅ PIX habilitado nas configurações
- ✅ Credenciais de produção configuradas
- ✅ Conta aprovada para receber pagamentos via PIX

### 5. Verificar Aprovação da Conta

1. Acesse: https://www.mercadopago.com.br/account/settings
2. Verifique se há pendências na verificação da conta
3. Complete todas as verificações necessárias
4. Aguarde aprovação (pode levar algumas horas)

## Checklist de Verificação

Antes de testar, verifique:

- [ ] Chave PIX cadastrada na conta do Mercado Pago
- [ ] PIX habilitado em "Meios de pagamento"
- [ ] Access Token de PRODUÇÃO configurado (APP_USR-...)
- [ ] Conta aprovada para receber pagamentos
- [ ] Sem pendências na verificação da conta
- [ ] Código configurado para permitir todos os métodos (já está)

## Testando

Após seguir todos os passos:

1. Faça deploy das functions:
   ```bash
   firebase deploy --only functions:createMercadoPagoPayment
   ```

2. Teste um pagamento no app

3. Verifique os logs:
   ```bash
   firebase functions:log --only createMercadoPagoPayment --limit 20
   ```

4. No checkout, o PIX deve aparecer como opção

## Se PIX Ainda Não Aparecer

1. **Verifique os logs** da function para ver o que foi retornado
2. **Aguarde alguns minutos** após habilitar - pode levar tempo para propagar
3. **Teste em modo anônimo** para garantir que não é cache
4. **Entre em contato com o suporte do Mercado Pago** se persistir

## Referências

- [Cadastrar Chave PIX](https://www.mercadopago.com.br/account/settings)
- [Configurações de Meios de Pagamento](https://www.mercadopago.com.br/account/settings)
- [Documentação PIX - Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix)

