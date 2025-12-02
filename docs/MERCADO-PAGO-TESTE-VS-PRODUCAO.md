# Mercado Pago: Teste vs Produção

## Como Funciona

O código **detecta automaticamente** se está em modo teste ou produção baseado no **Access Token**:

- **Token de PRODUÇÃO** (`APP_USR-...`) → Modo Produção (sem marca d'água)
- **Token de TESTE** (`TEST-...`) → Modo Sandbox (com marca d'água "SANDBOX")

**Não precisa mudar nada no código!** Apenas altere o Access Token no Firebase Functions.

## Como Fazer Compra Teste

### Passo 1: Obter Token de Teste

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Vá em **Suas integrações** > **Credenciais**
3. Copie o **Access Token de TESTE** (começa com `TEST-`)

### Passo 2: Configurar Token de Teste Temporariamente

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole o token de TESTE quando solicitado
```

### Passo 3: Fazer Deploy

```bash
cd functions
npm run deploy
```

### Passo 4: Fazer Compra Teste

- O checkout aparecerá com marca d'água "SANDBOX"
- Use os cartões de teste do Mercado Pago
- Complete a compra teste

### Passo 5: Voltar para Produção

Após fazer a compra teste e o Mercado Pago aprovar:

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
# Cole o token de PRODUÇÃO (APP_USR-...)
```

```bash
cd functions
npm run deploy
```

## Cartões de Teste

Para testar pagamentos, use os cartões de teste do Mercado Pago:

### Cartão Aprovado
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Data: Qualquer data futura
- Nome: Qualquer nome

### Cartão Recusado
- Número: `5031 4332 1540 6351`
- CVV: `123`
- Data: Qualquer data futura

## Verificação

### Em Modo Teste
Os logs devem mostrar:
```
[getMercadoPago] Tipo de token: TESTE (SANDBOX) ⚠️
[createMercadoPagoPayment] Modo: ⚠️ SANDBOX (TESTE)
```
URL começa com: `sandbox.mercadopago.com.br`

### Em Modo Produção
Os logs devem mostrar:
```
[getMercadoPago] Tipo de token: PRODUÇÃO ✅
[createMercadoPagoPayment] Modo: ✅ PRODUÇÃO
```
URL começa com: `www.mercadopago.com.br`

## Importante

1. **Não precisa mudar código** - apenas o Access Token
2. **Faça deploy após cada mudança** de token
3. **Use token de teste** apenas para compras teste
4. **Volte para produção** após aprovação

## Fluxo Recomendado

1. ✅ Configurar token de TESTE
2. ✅ Fazer deploy
3. ✅ Fazer compra teste
4. ✅ Aguardar aprovação do Mercado Pago
5. ✅ Configurar token de PRODUÇÃO
6. ✅ Fazer deploy
7. ✅ Usar em produção


