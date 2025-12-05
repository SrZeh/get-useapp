/**
 * Messages Screen - Centralized messages page
 * 
 * Displays all conversations:
 * - Threads (user-to-user): Shows other user's name
 * - Reservations (transaction messages): Shows item title
 */

import React, { useState, useEffect } from 'react';
import { ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAllConversations } from '@/hooks/features/messages/useAllConversations';
import { Ionicons } from '@expo/vector-icons';
import { formatTimestamp } from '@/utils/reservations';
import { db, auth } from '@/lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { deleteReservationMessages } from '@/services/cloudFunctions';

export default function MessagesScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { conversations, loading, error, refresh } = useAllConversations();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // Lista de IDs de conversas que foram removidas localmente (para ocultar da tela)
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  // Limpar removedIds quando uma conversa realmente não existe mais no backend
  // (ou seja, quando não aparece mais na lista retornada pelo hook após refresh)
  useEffect(() => {
    if (removedIds.size === 0) return;
    
    const currentIds = new Set(conversations.map(c => c.id));
    setRemovedIds(prev => {
      // Remove da lista de removidos apenas os IDs que não existem mais no backend
      const filtered = new Set([...prev].filter(id => currentIds.has(id)));
      // Se o tamanho mudou, houve limpeza (conversa foi realmente deletada)
      return filtered.size < prev.size ? filtered : prev;
    });
  }, [conversations]);

  const handleConversationPress = (conversation: typeof conversations[0]) => {
    if (conversation.type === 'thread') {
      router.push(`/chat/${conversation.id}`);
    } else if (conversation.type === 'reservation') {
      router.push(`/transaction/${conversation.id}/chat`);
    }
  };

  const handleDeleteConversation = async (conversation: typeof conversations[0]) => {
    console.log('[Messages] handleDeleteConversation called for:', conversation.id, conversation.type);
    
    // Remove imediatamente da lista local (remoção otimista)
    // Assim a conversa desaparece da tela mesmo se houver erro de permissão
    setRemovedIds(prev => new Set([...prev, conversation.id]));
    setDeletingId(conversation.id);
    
    try {
      if (conversation.type === 'thread') {
        // Tentar deletar thread completo
        const threadRef = doc(db, 'threads', conversation.id);
        console.log('[Messages] Deleting thread:', conversation.id);
        try {
          await deleteDoc(threadRef);
          console.log('[Messages] Thread deleted successfully');
        } catch (deleteError: any) {
          // Se falhar por permissão, apenas loga mas não reverte a remoção local
          console.warn('[Messages] Could not delete thread (possibly permission error):', deleteError?.code, deleteError?.message);
        }
      } else {
        // Tentar deletar todas as mensagens da reserva (apenas as do usuário atual) via Cloud Function
        console.log('[Messages] Deleting reservation messages via Cloud Function:', conversation.id);
        try {
          const result = await deleteReservationMessages(conversation.id);
          console.log('[Messages] Deletion result:', result);
        } catch (deleteError: any) {
          // Se falhar, apenas loga mas não reverte a remoção local
          console.warn('[Messages] Could not delete reservation messages (possibly permission error):', deleteError?.code, deleteError?.message);
        }
      }
      
      // Atualizar lista após deletar (para sincronizar com o backend)
      // Se não conseguiu deletar, a conversa pode voltar na próxima atualização
      // mas pelo menos desapareceu da tela momentaneamente
      refresh();
    } catch (error: any) {
      // Erro geral (não esperado) - apenas loga
      console.error('[Messages] Error deleting:', error);
      console.error('[Messages] Error code:', error?.code);
      console.error('[Messages] Error message:', error?.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (timestamp?: any) => {
    return formatTimestamp(timestamp);
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: Spacing.sm }}>Carregando conversas...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.sm }}>
        <ThemedText type="title-2" style={{ color: 'red', marginBottom: Spacing.sm }}>
          Erro ao carregar conversas
        </ThemedText>
        <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
          {error.message}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: Spacing.sm,
          paddingTop: Spacing.sm + insets.top + 90,
          paddingBottom: Spacing.lg,
        }}
      >
        <ThemedText type="large-title" style={{ marginBottom: Spacing.lg }}>
          Mensagens
        </ThemedText>

        {conversations.length === 0 ? (
          <LiquidGlassView
            intensity="subtle"
            cornerRadius={BorderRadius.xl}
            style={{ padding: Spacing.lg, alignItems: 'center' }}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={64}
              color={colors.isDark ? colors.text.tertiary : colors.text.secondary}
            />
            <ThemedText
              type="title-2"
              style={{ marginTop: Spacing.md, textAlign: 'center' }}
            >
              Nenhuma conversa ainda
            </ThemedText>
            <ThemedText
              type="body"
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
              style={{ marginTop: Spacing.sm, textAlign: 'center' }}
            >
              Suas conversas aparecerão aqui quando você começar a trocar mensagens.
            </ThemedText>
          </LiquidGlassView>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            {conversations
              .filter((conversation) => !removedIds.has(conversation.id))
              .map((conversation) => (
              <View key={conversation.id}>
                <TouchableOpacity
                  onPress={() => {
                    console.log('[Messages] Conversation pressed:', conversation.id);
                    handleConversationPress(conversation);
                  }}
                  activeOpacity={0.7}
                >
                  <LiquidGlassView
                    intensity="standard"
                    cornerRadius={BorderRadius.lg}
                    style={{ padding: Spacing.md }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    {/* Icon */}
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        backgroundColor: colors.isDark
                          ? colors.brand.primary + '20'
                          : colors.brand.dark + '20',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={
                          conversation.type === 'thread'
                            ? 'person-outline'
                            : 'cube-outline'
                        }
                        size={24}
                        color={colors.isDark ? colors.brand.primary : colors.brand.dark}
                      />
                    </View>

                    {/* Content */}
                    <View style={{ flex: 1, gap: Spacing['3xs'] }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <ThemedText
                          type="title-3"
                          style={{ fontWeight: '600', flex: 1 }}
                          numberOfLines={1}
                        >
                          {conversation.title}
                        </ThemedText>
                        {conversation.unreadCount > 0 && (
                          <View
                            style={{
                              backgroundColor: colors.isDark
                                ? colors.brand.primary
                                : colors.brand.dark,
                              borderRadius: 10,
                              minWidth: 20,
                              height: 20,
                              paddingHorizontal: 6,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <ThemedText
                              type="caption-2"
                              style={{
                                color: colors.isDark ? '#000' : '#fff',
                                fontWeight: '700',
                              }}
                            >
                              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                            </ThemedText>
                          </View>
                        )}
                      </View>

                      {conversation.lastMessage && (
                        <ThemedText
                          type="caption-1"
                          className="text-light-text-tertiary dark:text-dark-text-tertiary"
                          numberOfLines={1}
                        >
                          {conversation.lastMessage}
                        </ThemedText>
                      )}

                      {conversation.lastMessageAt && (
                        <ThemedText
                          type="caption-2"
                          className="text-light-text-tertiary dark:text-dark-text-tertiary"
                        >
                          {formatTime(conversation.lastMessageAt)}
                        </ThemedText>
                      )}
                    </View>

                    {/* Actions */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.xs }}>
                      {/* Delete button - para threads e reservas */}
                      <TouchableOpacity
                        onPress={(e) => {
                          console.log('[Messages] Delete button pressed for:', conversation.id, conversation.type);
                          e.stopPropagation?.();
                          handleDeleteConversation(conversation);
                        }}
                        disabled={deletingId === conversation.id}
                        style={{ 
                          padding: Spacing.xs,
                          minWidth: 40,
                          minHeight: 40,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        activeOpacity={0.7}
                      >
                        {deletingId === conversation.id ? (
                          <ActivityIndicator size="small" color={colors.semantic.error} />
                        ) : (
                          <Ionicons
                            name="trash-outline"
                            size={20}
                            color={colors.semantic.error}
                          />
                        )}
                      </TouchableOpacity>
                      
                      {/* Arrow */}
                      <Ionicons
                        name="chevron-forward-outline"
                        size={20}
                        color={colors.text.tertiary}
                      />
                    </View>
                    </View>
                  </LiquidGlassView>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

