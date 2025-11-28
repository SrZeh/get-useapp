# Configuração de Notificações por Email

Este documento explica como configurar as notificações por email usando SendGrid.

## Pré-requisitos

1. Conta no SendGrid (https://sendgrid.com)
2. API Key do SendGrid criada
3. Firebase CLI instalado e autenticado

## Passo 1: Criar API Key no SendGrid

1. Acesse https://app.sendgrid.com
2. Vá em **Settings** > **API Keys**
3. Clique em **Create API Key**
4. Dê um nome (ex: "GetAndUse Notifications")
5. Selecione **Full Access** ou **Restricted Access** com permissões de **Mail Send**
6. Copie a API Key (você só verá uma vez!)

## Passo 2: Configurar Secret no Firebase

Execute o comando abaixo no terminal, substituindo `SUA_API_KEY_AQUI` pela API Key que você copiou:

```bash
firebase functions:secrets:set SENDGRID_API_KEY
```

Quando solicitado, cole a API Key e pressione Enter.

## Passo 3: Configurar Email Remetente (Opcional)

Por padrão, o email será enviado de `no-reply@getanduse.app`. Se quiser usar outro email:

1. Configure o domínio no SendGrid (Settings > Sender Authentication)
2. Configure o secret:

```bash
firebase functions:secrets:set SENDGRID_FROM
```

Quando solicitado, digite o email (ex: `noreply@seudominio.com`)

## Passo 4: Fazer Deploy das Functions

Após configurar os secrets, faça o deploy:

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

## Passo 5: Verificar Logs

Para verificar se os emails estão sendo enviados:

```bash
firebase functions:log
```

Procure por mensagens como:
- `email failed` - indica erro no envio
- `SendGrid error` - indica problema com a API Key

## Notificações Implementadas

As seguintes ações enviam email automaticamente:

1. ✅ **Nova reserva criada** - Notifica o dono
2. ✅ **Reserva aceita** - Notifica o locatário
3. ✅ **Reserva rejeitada** - Notifica o locatário
4. ✅ **Reserva cancelada** - Notifica ambos
5. ✅ **Pagamento confirmado** - Notifica dono e locatário
6. ✅ **Item recebido** - Notifica o dono
7. ✅ **Item devolvido** - Notifica o locatário
8. ✅ **Pagamento liberado** - Notifica o dono (payout)
9. ✅ **Estorno processado** - Notifica ambos
10. ✅ **Nova mensagem** - Notifica o destinatário

## Preferências do Usuário

Os usuários podem desativar notificações por email nas preferências do perfil. Por padrão, todas estão ativadas.

## Troubleshooting

### Email não está sendo enviado

1. Verifique se o secret está configurado:
   ```bash
   firebase functions:secrets:access SENDGRID_API_KEY
   ```

2. Verifique os logs:
   ```bash
   firebase functions:log --only onReservationCreated
   ```

3. Verifique se o email do usuário está correto no Firestore (coleção `users`)

### Erro "SENDGRID_API_KEY ausente"

- O secret não foi configurado ou não foi feito deploy após configurar
- Execute: `firebase deploy --only functions`

### Emails indo para spam

- Configure SPF/DKIM no SendGrid
- Use um domínio verificado
- Adicione o email do SendGrid à lista de contatos

## Testando

Para testar, crie uma nova reserva e verifique:
1. Se o email chegou na caixa de entrada
2. Se o email está na pasta de spam
3. Os logs do Firebase Functions

