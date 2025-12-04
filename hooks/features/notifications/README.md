# Sistema de Notificações - Documentação

## Visão Geral

O sistema de notificações foi unificado para centralizar todos os badges e contadores de notificação em um único lugar. Isso resolve problemas de sincronização e facilita a manutenção.

## Hook Principal: `useNotificationBadges`

O hook `useNotificationBadges` é a fonte única de verdade para todos os badges de notificação no app.

### Uso Básico

```tsx
import { useNotificationBadges } from '@/hooks/features/notifications';

function MyComponent() {
  const badges = useNotificationBadges();
  
  // Verificar se há qualquer notificação
  if (badges.hasAny) {
    // Mostrar indicador geral
  }
  
  // Usar badge específico
  return (
    <TabIcon showDot={badges.messages} />
  );
}
```

### Propriedades Retornadas

```typescript
type NotificationBadges = {
  // Badges booleanos (true/false)
  messages: boolean;        // Mensagens não lidas
  transactions: boolean;    // Transações pendentes (reservations + payments)
  reservations: boolean;    // Reservas pendentes
  payments: boolean;       // Pagamentos pendentes
  interactions: boolean;    // Interações pendentes
  
  // Contadores numéricos
  counts: {
    messages: number;
    transactions: number;
    reservations: number;
    payments: number;
    interactions: number;
    total: number;
  };
  
  // Helper: verifica se há qualquer notificação
  hasAny: boolean;
};
```

### Exemplos de Uso

#### 1. Badge Simples (Dot)

```tsx
import { useNotificationBadges } from '@/hooks/features/notifications';
import { TabIcon } from '@/components/ui';

function TransactionsTab() {
  const badges = useNotificationBadges();
  
  return (
    <TabIcon 
      Icon={TransactionsIcon} 
      showDot={badges.transactions}
    />
  );
}
```

#### 2. Badge com Contador

```tsx
import { useNotificationBadges } from '@/hooks/features/notifications';
import { Badge } from '@/components/Badge';

function MessagesTab() {
  const badges = useNotificationBadges();
  
  return (
    <View>
      <Icon />
      {badges.counts.messages > 0 && (
        <Badge>{badges.counts.messages}</Badge>
      )}
    </View>
  );
}
```

#### 3. Múltiplos Badges

```tsx
import { useNotificationBadges } from '@/hooks/features/notifications';
import { NotificationDot } from '@/components/ui';

function NavigationBar() {
  const badges = useNotificationBadges();
  
  return (
    <View>
      <Icon name="messages" />
      <NotificationDot visible={badges.messages} />
      
      <Icon name="transactions" />
      <NotificationDot visible={badges.transactions} />
    </View>
  );
}
```

## Componente: `NotificationDot`

Componente reutilizável para exibir pontos de notificação.

### Props

```typescript
type NotificationDotProps = {
  visible?: boolean;        // Se o dot deve ser exibido
  size?: number;            // Tamanho do dot (padrão: 8)
  color?: string;           // Cor customizada
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  offset?: number;          // Distância da borda (padrão: 2)
  style?: ViewStyle;        // Estilo customizado
  testID?: string;          // Para testes
};
```

### Exemplo

```tsx
import { NotificationDot } from '@/components/ui';

function IconWithBadge() {
  return (
    <View style={{ position: 'relative' }}>
      <Icon />
      <NotificationDot 
        visible={hasNotifications}
        size={10}
        position="top-right"
        offset={4}
      />
    </View>
  );
}
```

## Como Funciona

O sistema usa uma abordagem em duas camadas:

1. **Fonte Principal**: Contadores do Firebase (`users/{uid}/counters/__root__`)
   - Atualizados por Cloud Functions
   - Mais eficiente e confiável

2. **Fallback**: Queries diretas do Firestore
   - Garante que não perdemos notificações
   - Usado quando os contadores ainda não foram atualizados

## Migração

### Antes (Sistema Antigo)

```tsx
// ❌ Múltiplos hooks separados
const showTxDot = useTransactionsDot();
const counters = useNotificationCounters();
const showMessagesDot = useUnreadMessagesDot();
const showDot = (counters.reservations + counters.payments) > 0 || showTxDot;
```

### Depois (Sistema Novo)

```tsx
// ✅ Hook unificado
const badges = useNotificationBadges();
const showDot = badges.transactions;
```

## Troubleshooting

### Badge não aparece

1. Verifique se o contador está sendo atualizado no Firebase
2. Verifique se o hook está sendo chamado corretamente
3. Use `badges.hasAny` para debug

### Badge aparece mas não some

1. Verifique se a função `markAsSeen` está sendo chamada
2. Verifique se os Cloud Functions estão atualizando os contadores

### Performance

O hook usa `useMemo` para otimizar re-renders. Se você notar problemas de performance:

1. Verifique quantas vezes o hook está sendo chamado
2. Considere usar `React.memo` nos componentes que usam o hook

