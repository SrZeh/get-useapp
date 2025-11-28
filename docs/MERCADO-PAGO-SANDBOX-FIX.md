# Como Resolver Problema de Sandbox no Mercado Pago

## Problema

O checkout está abrindo em modo **SANDBOX** (com marca d'água) mesmo usando credenciais de produção.

## Causas Possíveis

### 1. Access Token Incorreto
- Verifique se está usando o **Access Token de PRODUÇÃO** (começa com `APP_USR-`)
- Não use o Access Token de TESTE (começa com `TEST-`)

### 2. Conta Não Aprovada
- A conta do Mercado Pago precisa estar **totalmente aprovada** para produção
- Verifique no painel: https://www.mercadopago.com.br/developers/panel
- Pode haver pendências de documentação ou verificação

### 3. Secret Não Atualizado
- O secret no Firebase Functions pode estar desatualizado
- Execute: `firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN`
- Cole o token de PRODUÇÃO quando solicitado
- **IMPORTANTE**: Faça deploy novamente após atualizar o secret

### 4. Preferência Criada em Modo Teste
- Se o Access Token for de teste, a preferência será criada em modo sandbox
- O Mercado Pago retorna apenas `sandbox_init_point` quando em modo teste

## Como Verificar

### 1. Verificar Token no Código
Os logs devem mostrar:
```
[getMercadoPago] Tipo de token: PRODUÇÃO ✅
```

Se mostrar `TESTE (SANDBOX) ⚠️`, o token está errado.

### 2. Verificar Resposta da API
Os logs devem mostrar:
```
[createMercadoPagoPayment] init_point (PRODUÇÃO): https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...
[createMercadoPagoPayment] Modo: ✅ PRODUÇÃO
```

Se mostrar `⚠️ SANDBOX (TESTE)`, o problema está na criação da preferência.

### 3. Verificar Secret no Firebase
```bash
# Verificar se o secret está configurado
firebase functions:secrets:access MERCADO_PAGO_ACCESS_TOKEN

# Se não estiver ou estiver errado, atualizar:
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole o token de PRODUÇÃO (APP_USR-...)

# Fazer deploy novamente
cd functions && npm run deploy
```

## Solução Passo a Passo

### Passo 1: Obter Token de Produção
1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Suas integrações** > **Credenciais**
3. Copie o **Access Token de PRODUÇÃO** (começa com `APP_USR-`)

### Passo 2: Atualizar Secret
```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole o token quando solicitado
```

### Passo 3: Fazer Deploy
```bash
cd functions
npm run deploy
# ou
firebase deploy --only functions
```

### Passo 4: Verificar Logs
Após fazer um pagamento, verifique os logs:
```bash
firebase functions:log --only createMercadoPagoPayment
```

Deve aparecer:
- `Tipo de token: PRODUÇÃO ✅`
- `Modo: ✅ PRODUÇÃO`
- `init_point (PRODUÇÃO): https://www.mercadopago.com.br/...`

## Notas Importantes

1. **Token de Produção vs Teste**:
   - Produção: `APP_USR-...` → Sem marca d'água
   - Teste: `TEST-...` → Com marca d'água "SANDBOX"

2. **Aprovação da Conta**:
   - Mesmo com token de produção, se a conta não estiver aprovada, pode retornar sandbox
   - Verifique pendências no painel do Mercado Pago

3. **Cache do Secret**:
   - Após atualizar o secret, **sempre faça deploy novamente**
   - O secret antigo pode estar em cache

4. **Verificação Rápida**:
   - Se a URL começar com `sandbox.mercadopago.com.br` → Está em modo teste
   - Se começar com `www.mercadopago.com.br` → Está em produção

## Troubleshooting

### Ainda aparece sandbox após seguir os passos?

1. **Verifique os logs da função**:
   ```bash
   firebase functions:log --only createMercadoPagoPayment --limit 50
   ```

2. **Confirme o token usado**:
   - Os logs devem mostrar o prefixo do token
   - Deve começar com `APP_USR-`

3. **Verifique a conta**:
   - Acesse o painel do Mercado Pago
   - Verifique se há pendências ou avisos
   - Confirme que a conta está aprovada para produção

4. **Teste manualmente**:
   - Crie uma preferência manualmente via API
   - Use o mesmo Access Token
   - Verifique se retorna `init_point` ou apenas `sandbox_init_point`

## Referências

- [Credenciais do Mercado Pago](https://www.mercadopago.com.br/developers/panel/credentials)
- [Checkout Pro - Produção](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-your-integration)

