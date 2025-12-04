/**
 * NotificationDot - Componente de ponto de notificação reutilizável
 * 
 * Exibe um ponto vermelho indicando notificações não lidas.
 * Suporta diferentes tamanhos e posicionamento.
 * Funciona em todas as plataformas (iOS, Android, Web).
 */

import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { useThemeColors } from '@/utils/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';

type NotificationDotProps = {
  /** Se o dot deve ser exibido */
  visible?: boolean;
  /** Tamanho do dot (padrão: 8) */
  size?: number;
  /** Cor do dot (padrão: error/semantic.error) */
  color?: string;
  /** Posição do dot em relação ao container */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  /** Offset do dot (distância da borda) */
  offset?: number;
  /** Estilo customizado */
  style?: StyleProp<ViewStyle>;
  /** Test ID para testes */
  testID?: string;
};

/**
 * Componente de ponto de notificação
 * 
 * @example
 * ```tsx
 * // Uso básico
 * <NotificationDot visible={hasNotifications} />
 * 
 * // Com tamanho customizado
 * <NotificationDot visible={hasNotifications} size={10} />
 * 
 * // Em um ícone de tab
 * <View>
 *   <Icon />
 *   <NotificationDot visible={badges.messages} position="top-right" />
 * </View>
 * ```
 */
export function NotificationDot({
  visible = false,
  size = 8,
  color,
  position = 'top-right',
  offset = 2,
  style,
  testID,
}: NotificationDotProps) {
  const colors = useThemeColors();
  
  if (!visible) {
    return null;
  }
  
  const dotColor = color || colors.semantic.error;
  
  // Calcula posição baseado na prop position
  const positionStyle: ViewStyle = (() => {
    const baseOffset = -offset;
    const sizeOffset = size / 2;
    
    switch (position) {
      case 'top-right':
        return {
          position: 'absolute',
          top: baseOffset,
          right: baseOffset,
        };
      case 'top-left':
        return {
          position: 'absolute',
          top: baseOffset,
          left: baseOffset,
        };
      case 'bottom-right':
        return {
          position: 'absolute',
          bottom: baseOffset,
          right: baseOffset,
        };
      case 'bottom-left':
        return {
          position: 'absolute',
          bottom: baseOffset,
          left: baseOffset,
        };
      default:
        return {
          position: 'absolute',
          top: baseOffset,
          right: baseOffset,
        };
    }
  })();
  
  // Web precisa de um container com position relative
  const containerStyle: ViewStyle = Platform.OS === 'web' 
    ? { position: 'relative' as const }
    : {};
  
  return (
    <View style={containerStyle} testID={testID}>
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: dotColor,
            // Sombra sutil para melhor visibilidade
            ...(Platform.OS !== 'web' && {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.2,
              shadowRadius: 2,
              elevation: 2,
            }),
            // Borda branca para contraste (opcional, pode ser removida)
            borderWidth: Platform.OS === 'web' ? 0 : 1.5,
            borderColor: Platform.OS === 'web' ? 'transparent' : 'rgba(255, 255, 255, 0.9)',
          },
          positionStyle,
          style,
        ]}
        accessibilityRole="image"
        accessibilityLabel="Notificação não lida"
      />
    </View>
  );
}

