/**
 * Custom hook for image picking (gallery and camera)
 */

import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { logger } from "@/utils/logger";

export type ImagePickerOptions = {
  quality?: number;
  allowsEditing?: boolean;
  allowsMultipleSelection?: boolean;
};

const DEFAULT_OPTIONS: Required<ImagePickerOptions> = {
  quality: 0.85,
  allowsEditing: true,
  allowsMultipleSelection: false,
};

export function useImagePicker() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestGalleryPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Conceda acesso às fotos para selecionar uma imagem.");
        return false;
      }
      return true;
    } catch (error) {
      logger.error("Failed to request gallery permission", error);
      return false;
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permissão necessária", "Conceda acesso à câmera.");
        return false;
      }
      return true;
    } catch (error) {
      logger.error("Failed to request camera permission", error);
      return false;
    }
  };

  const pickFromGallery = async (options: ImagePickerOptions = {}) => {
    try {
      setIsLoading(true);
      const hasPermission = await requestGalleryPermission();
      if (!hasPermission) return null;

      const opts = { ...DEFAULT_OPTIONS, ...options };
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: opts.quality,
        allowsMultipleSelection: opts.allowsMultipleSelection,
        allowsEditing: opts.allowsEditing,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } catch (error) {
      logger.error("Failed to pick image from gallery", error);
      Alert.alert("Erro", "Não foi possível selecionar a imagem.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const pickFromCamera = async (options: ImagePickerOptions = {}) => {
    try {
      setIsLoading(true);
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return null;

      const opts = { ...DEFAULT_OPTIONS, ...options };
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: opts.quality,
        allowsEditing: opts.allowsEditing,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } catch (error) {
      logger.error("Failed to pick image from camera", error);
      Alert.alert("Erro", "Não foi possível capturar a imagem.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    setImageUri(null);
  };

  return {
    imageUri,
    isLoading,
    pickFromGallery,
    pickFromCamera,
    clearImage,
    setImageUri,
  };
}

