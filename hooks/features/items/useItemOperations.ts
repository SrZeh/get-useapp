/**
 * Custom hook for item management operations
 * 
 * Handles:
 * - Toggle item availability
 * - Delete item
 * - Loading states for individual operations
 * - Cache invalidation after mutations
 * 
 * Follows Single Responsibility Principle by focusing on item operations only
 */

import { useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useItemsStore } from '@/stores/itemsStore';
import type { Item } from '@/types';

type UseItemOperationsResult = {
  updatingId: string | null;
  toggleAvailability: (item: Item) => Promise<void>;
  deleteItem: (item: Item) => Promise<void>;
  confirmDelete: (item: Item) => void;
};

/**
 * Hook for managing item operations (toggle availability, delete)
 * Now invalidates Zustand cache after mutations
 */
export function useItemOperations(): UseItemOperationsResult {
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Get store actions for cache invalidation
  const invalidateItem = useItemsStore((state) => state.invalidateItem);
  const invalidateUserItems = useItemsStore((state) => state.invalidateUserItems);
  const setItem = useItemsStore((state) => state.setItem);

  const toggleAvailability = async (item: Item) => {
    try {
      setUpdatingId(item.id);
      const updatedItem = { ...item, available: !item.available };
      
      await updateDoc(doc(db, 'items', item.id), {
        available: !item.available,
        updatedAt: serverTimestamp(),
      });
      
      // Update cache with new item state
      setItem(updatedItem);
      
      // Invalidate item cache to force refetch
      invalidateItem(item.id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Erro', err?.message ?? String(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteItem = async (item: Item) => {
    try {
      setUpdatingId(item.id);
      await deleteDoc(doc(db, 'items', item.id));
      
      // Invalidate cache after deletion
      invalidateItem(item.id);
      invalidateUserItems(); // Refresh user items list
    } catch (error: unknown) {
      const err = error as { message?: string };
      Alert.alert('Erro ao excluir', err?.message ?? String(error));
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmDelete = (item: Item) => {
    Alert.alert(
      'Excluir item',
      `Tem certeza que deseja excluir "${item.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteItem(item),
        },
      ]
    );
  };

  return {
    updatingId,
    toggleAvailability,
    deleteItem,
    confirmDelete,
  };
}

