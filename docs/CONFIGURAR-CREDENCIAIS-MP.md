# Configurar Credenciais do Mercado Pago

## Passo 1: Adicionar Access Token como Secret

Execute no terminal (na raiz do projeto):

```bash
firebase functions:secrets:set MERCADO_PAGO_ACCESS_TOKEN
```

Quando solicitado, cole o **Access Token** que você obteve do painel do Mercado Pago.

## Passo 2: (Opcional) Adicionar Public Key

Se quiser usar a Public Key no frontend (para validações), você pode adicionar também:

```bash
firebase functions:secrets:set MERCADO_PAGO_PUBLIC_KEY
```

## Passo 3: Verificar Secrets Configurados

Para listar todos os secrets:

```bash
firebase functions:secrets:access
```

## Passo 4: Deploy das Functions

Após configurar os secrets, faça o deploy:

```bash
cd functions
npm run build
firebase deploy --only functions
```

## Nota Importante

- O Access Token é **SENSÍVEL** - nunca commite no código
- Use sempre secrets do Firebase para credenciais
- O código já está configurado para usar `process.env.MERCADO_PAGO_ACCESS_TOKEN`

