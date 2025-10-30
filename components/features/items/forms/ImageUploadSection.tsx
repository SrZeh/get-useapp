/**
 * ImageUploadSection - Form section for item image upload
 * 
 * Handles:
 * - Image picker from camera
 * - Image picker from gallery
 * - Image preview
 * - Image removal
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ImageUploadSectionProps = {
  imageUri: string | null;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  onRemoveImage?: () => void;
  saving: boolean;
  colors: UseThemeColorsReturn;
};

export const ImageUploadSection = React.memo(function ImageUploadSection({
  imageUri,
  onPickFromCamera,
  onPickFromGallery,
  onRemoveImage,
  saving,
  colors,
}: ImageUploadSectionProps) {
  return (
    <LiquidGlassView
      intensity="subtle"
      cornerRadius={BorderRadius.xl}
      style={styles.sectionGlass}
    >
      <View style={styles.section}>
        <ThemedText type="subhead" style={styles.sectionTitle}>
          Foto do Item
        </ThemedText>

        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity 
            style={[styles.imageButton, { borderColor: colors.border.default }]}
            onPress={onPickFromCamera} 
            disabled={saving}
          >
            <Ionicons name="camera" size={20} color={colors.icon.default} />
            <ThemedText type="defaultSemiBold">Câmera</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.imageButton, { borderColor: colors.border.default }]}
            onPress={onPickFromGallery} 
            disabled={saving}
          >
            <Ionicons name="images" size={20} color={colors.icon.default} />
            <ThemedText type="defaultSemiBold">
              {imageUri ? "Alterar" : "Galeria"}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {imageUri && (
          <View style={styles.imagePreview}>
            <ExpoImage
              source={{ uri: imageUri }}
              style={styles.previewImage}
              contentFit="cover"
            />
            {onRemoveImage && (
              <TouchableOpacity
                style={[styles.removeImageButton, { backgroundColor: colors.semantic.error }]}
                onPress={onRemoveImage}
              >
                <Ionicons name="close" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </LiquidGlassView>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    padding: Spacing.md,
    width: '100%',
  },
  sectionGlass: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xs'],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  imagePreview: {
    marginTop: Spacing.sm,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

