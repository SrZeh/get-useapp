# Configuração do SDK Mercado Pago no Frontend

Este documento explica como configurar o SDK do Mercado Pago no frontend para usar o checkout integrado no web.

## Instalação

Execute o seguinte comando no diretório raiz do projeto:

```bash
npm install @mercadopago/sdk-react
```

## Configuração da Public Key

Para usar o SDK no frontend, você precisa configurar a **Public Key** do Mercado Pago como variável de ambiente.

### 1. Obter a Public Key

1. Acesse o [Painel do Mercado Pago](https://www.mercadopago.com.br/developers/panel)
2. Vá em **Suas integrações** > **Credenciais**
3. Copie a **Public Key de PRODUÇÃO** (começa com `APP_USR-...`)

### 2. Configurar no Projeto

Crie ou edite o arquivo `.env` na raiz do projeto e adicione:

```env
EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=APP_USR-sua-public-key-aqui
```

**⚠️ IMPORTANTE:**
- Use a Public Key de **PRODUÇÃO** (não a de teste)
- A Public Key é segura para usar no frontend (não é um segredo)
- Não commite o arquivo `.env` no Git (já está no `.gitignore`)

## Como Funciona

### Web (Navegador)
- O SDK do Mercado Pago é carregado e inicializado
- O botão de pagamento é renderizado diretamente na página
- O usuário pode pagar sem sair do site

### Mobile (iOS/Android)
- O SDK não é usado (não é compatível com React Native)
- O checkout é aberto em um browser externo (expo-web-browser)
- Após o pagamento, o usuário é redirecionado de volta ao app via deep link

## Estrutura de Arquivos

```
components/
  features/
    payments/
      MercadoPagoCheckout.tsx  # Componente híbrido (web/mobile)
      index.ts                  # Barrel export

app/
  transaction/
    [id]/
      pay.tsx                   # Tela de pagamento (usa MercadoPagoCheckout)
```

## Uso no Código

O componente `MercadoPagoCheckout` já está integrado na tela de pagamento (`app/transaction/[id]/pay.tsx`).

### Exemplo de Uso Manual

```typescript
import { MercadoPagoCheckout } from '@/components/features/payments';

function MyPaymentScreen() {
  const [preferenceId, setPreferenceId] = useState<string | null>(null);

  async function createPayment() {
    // Criar preferência no backend
    const result = await createMercadoPagoPayment(...);
    setPreferenceId(result.preferenceId);
  }

  return (
    <View>
      {preferenceId && (
        <MercadoPagoCheckout
          preferenceId={preferenceId}
          onPaymentComplete={() => {
            console.log('Pagamento completo!');
          }}
          onPaymentError={(error) => {
            console.error('Erro:', error);
          }}
        />
      )}
    </View>
  );
}
```

## Troubleshooting

### SDK não carrega no web
- Verifique se `EXPO_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` está configurada
- Verifique se o pacote `@mercadopago/sdk-react` está instalado
- Verifique o console do navegador para erros

### Botão não aparece
- Verifique se `preferenceId` foi retornado pela função `createMercadoPagoPayment`
- Verifique se está acessando via web (não mobile)
- Verifique os logs do console

### Erro de inicialização
- Certifique-se de usar a Public Key de PRODUÇÃO (não de teste)
- Verifique se a Public Key está correta (sem espaços extras)

## Referências

- [Documentação do SDK React](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-your-integration)
- [Credenciais do Mercado Pago](https://www.mercadopago.com.br/developers/panel/credentials)




