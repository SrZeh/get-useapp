/**
 * Help Request Layout
 * 
 * Layout for help request screens (Socorro!)
 */

import { Stack } from 'expo-router';
import { HeaderMenu } from '@/components/HeaderMenu';

export default function HelpLayout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <HeaderMenu />,
        headerTitle: 'Socorro!',
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Pedidos de Ajuda',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          title: 'Novo Pedido',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detalhes do Pedido',
        }}
      />
    </Stack>
  );
}

