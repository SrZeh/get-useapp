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
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerShown: false, // Custom header in component
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false, // Redirects to item detail
        }}
      />
      <Stack.Screen
        name="verify-required"
        options={{
          headerShown: false, // Custom header in component
        }}
      />
    </Stack>
  );
}


