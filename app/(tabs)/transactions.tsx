// app/(tabs)/transactions.tsx
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { markTransactionsSeen } from '@/hooks/useTransactionsDot';
import { HapticFeedback } from '@/utils';
import { OwnerInbox, MyReservations } from './transactions/_components';
import { useThemeColors, useBrandColorsWithOpacity, useBorderColorsWithOpacity } from '@/utils/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';

// ---------- tela ----------
export default function TransactionsScreen() {
  useFocusEffect(
    useCallback(() => {
      // marca como visto sempre que a tela entra em foco
      markTransactionsSeen();
      return () => {};
    }, [])
  );
  const [tab, setTab] = useState<'owner' | 'renter'>('owner');
  const colors = useThemeColors();
  const brandOpacity = useBrandColorsWithOpacity();
  const borderOpacity = useBorderColorsWithOpacity();
  
  // Theme-aware brand color: use dark green in light mode for contrast, light green in dark mode
  const brandColor = colors.isDark ? colors.brand.primary : colors.brand.dark;
  const brandOpacityValue = colors.isDark ? brandOpacity.primary.medium : brandOpacity.dark.medium;

  return (
    <ThemedView style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', gap: Spacing.xs, padding: Spacing.sm, paddingBottom: Spacing['2xs'] }}>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.selection();
            setTab('owner');
          }}
          style={{
            flex: 1,
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.sm,
            borderRadius: BorderRadius.md,
            backgroundColor: tab === 'owner' ? brandOpacityValue : 'transparent',
            borderWidth: tab === 'owner' ? 2 : 1,
            borderColor: tab === 'owner' ? brandColor : borderOpacity.default,
          }}
        >
          <ThemedText
            type={tab === 'owner' ? 'defaultSemiBold' : 'default'}
            style={{ textAlign: 'center', color: tab === 'owner' ? brandColor : undefined }}
          >
            Recebidas
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            HapticFeedback.selection();
            setTab('renter');
          }}
          style={{
            flex: 1,
            paddingVertical: Spacing.xs,
            paddingHorizontal: Spacing.sm,
            borderRadius: BorderRadius.md,
            backgroundColor: tab === 'renter' ? brandOpacityValue : 'transparent',
            borderWidth: tab === 'renter' ? 2 : 1,
            borderColor: tab === 'renter' ? brandColor : borderOpacity.default,
          }}
        >
          <ThemedText
            type={tab === 'renter' ? 'defaultSemiBold' : 'default'}
            style={{ textAlign: 'center', color: tab === 'renter' ? brandColor : undefined }}
          >
            Minhas reservas
          </ThemedText>
        </TouchableOpacity>
      </View>
      {tab === 'owner' ? <OwnerInbox /> : <MyReservations />}
    </ThemedView>
  );
}
