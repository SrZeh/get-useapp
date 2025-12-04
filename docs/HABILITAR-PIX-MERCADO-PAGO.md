# Como Habilitar PIX no Mercado Pago

## Problema

O PIX não aparece como opção no checkout do Mercado Pago, mesmo que o código esteja configurado corretamente.

## Causa

O PIX precisa estar **habilitado na sua conta do Mercado Pago**. Por padrão, algumas contas podem não ter o PIX habilitado.

## Solução: Habilitar PIX na Conta

### Passo 1: Acessar o Painel do Mercado Pago

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Faça login na sua conta
3. Vá em **"Suas integrações"** > **"Configurações"** ou **"Meios de pagamento"**

### Passo 2: Habilitar PIX

1. Procure pela seção **"Meios de pagamento"** ou **"Payment methods"**
2. Localize a opção **"PIX"**
3. Ative/habilite o PIX
4. Salve as alterações

### Passo 3: Verificar Configurações da Conta

1. Acesse: https://www.mercadopago.com.br/account/settings
2. Vá em **"Meios de pagamento"** ou **"Payment methods"**
3. Verifique se o PIX está ativo
4. Se não estiver, ative-o

### Passo 4: Verificar Status da Conta

O PIX pode não estar disponível se:
- A conta ainda não foi aprovada para produção
- A conta está em modo de teste (sandbox) e o PIX não está habilitado para testes
- Há pendências na verificação da conta

## Verificação no Código

O código já está configurado para permitir PIX:

```typescript
payment_methods: {
  // Quando method === "card": mostrar todos os métodos (incluindo PIX)
  // Quando method === "pix": mostrar apenas PIX
  excluded_payment_methods: method === "pix" ? [{ id: "credit_card" }, { id: "debit_card" }] : [],
  excluded_payment_types: method === "pix" ? [{ id: "credit_card" }, { id: "debit_card" }] : [],
  installments: method === "card" ? 12 : 1,
}
```

**O código NÃO exclui o PIX**, então ele deve aparecer se estiver habilitado na conta.

## Testando

Após habilitar o PIX:

1. Faça deploy das functions novamente:
   ```bash
   cd functions
   npm run build
   cd ..
   firebase deploy --only functions:createMercadoPagoPayment
   ```

2. Teste um pagamento no app
3. No checkout, o PIX deve aparecer como opção quando `paymentMethod === "card"`

## Troubleshooting

### PIX ainda não aparece após habilitar

1. **Aguarde alguns minutos**: Pode levar alguns minutos para as alterações serem aplicadas
2. **Verifique os logs**: Veja os logs da function para confirmar a configuração:
   ```bash
   firebase functions:log --only createMercadoPagoPayment --limit 20
   ```
3. **Verifique a conta**: Certifique-se de que a conta está aprovada para produção
4. **Teste em sandbox**: Se estiver em sandbox, verifique se o PIX está habilitado para testes

### Erro: "PIX não disponível"

Se você receber um erro dizendo que o PIX não está disponível:

1. Verifique se a conta está aprovada
2. Verifique se há pendências na verificação
3. Entre em contato com o suporte do Mercado Pago se necessário

## Referências

- [Painel de Desenvolvedores - Mercado Pago](https://www.mercadopago.com.br/developers/panel)
- [Configurações de Meios de Pagamento](https://www.mercadopago.com.br/account/settings)
- [Documentação PIX - Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/available-payment-methods)

