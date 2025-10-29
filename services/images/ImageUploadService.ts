/**
 * Image Upload Service
 * 
 * Provides unified image upload functionality with:
 * - Image picking from camera or gallery
 * - Automatic optimization and compression
 * - Firebase Storage upload
 * - Consistent error handling
 */

import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { uploadImageAsync } from '@/utils';
import { uploadUserImage } from '@/services/uploadImage';
import { logger } from '@/utils';

export type ImagePickerSource = 'camera' | 'gallery';

export type ImagePickerOptions = {
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: ImagePicker.MediaTypeOptions;
};

export type UploadOptions = {
  path?: string;
  maxBytes?: number;
  targetWidth?: number;
  forceFormat?: 'jpeg' | 'png' | 'webp';
};

/**
 * Request camera permission
 * @returns true if permission granted, false otherwise
 */
async function requestCameraPermission(): Promise<boolean> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (perm.status !== 'granted') {
    Alert.alert('Permissão', 'Precisamos da câmera para tirar a foto.');
    return false;
  }
  return true;
}

/**
 * Request media library permission
 * @returns true if permission granted, false otherwise
 */
async function requestGalleryPermission(): Promise<boolean> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.status !== 'granted') {
    Alert.alert('Permissão', 'Precisamos acessar sua galeria para selecionar a imagem.');
    return false;
  }
  return true;
}

/**
 * Pick an image from camera or gallery
 * @param source - 'camera' or 'gallery'
 * @param options - ImagePicker options
 * @returns Local URI of picked image, or null if cancelled/failed
 */
export async function pickImage(
  source: ImagePickerSource,
  options: ImagePickerOptions = {}
): Promise<string | null> {
  try {
    // Request appropriate permission
    const hasPermission =
      source === 'camera'
        ? await requestCameraPermission()
        : await requestGalleryPermission();
    
    if (!hasPermission) {
      return null;
    }

    // Launch picker
    const pickerOptions: ImagePicker.ImagePickerOptions = {
      quality: options.quality ?? 0.8,
      allowsEditing: options.allowsEditing ?? true,
      mediaTypes: options.mediaTypes ?? ImagePicker.MediaTypeOptions.Images,
    };

    if (options.aspect) {
      pickerOptions.aspect = options.aspect;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

    if (!result.canceled && result.assets[0]) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    logger.error('Failed to pick image', error, { source, options });
    Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
    return null;
  }
}

/**
 * Pick and upload image - picks from camera/gallery and uploads to Firebase Storage
 * @param source - 'camera' or 'gallery'
 * @param uploadPath - Storage path (e.g., 'items/{uid}/photo.jpg')
 * @param pickerOptions - ImagePicker options
 * @param uploadOptions - Upload optimization options
 * @returns Download URL of uploaded image
 */
export async function pickAndUploadImage(
  source: ImagePickerSource,
  uploadPath: string,
  pickerOptions: ImagePickerOptions = {},
  uploadOptions: UploadOptions = {}
): Promise<string> {
  try {
    // Pick image
    const localUri = await pickImage(source, pickerOptions);
    if (!localUri) {
      throw new Error('Image selection cancelled or failed');
    }

    // Upload
    const url = await uploadImageAsync(localUri, uploadPath, uploadOptions.forceFormat === 'png');
    return url;
  } catch (error) {
    logger.error('Failed to pick and upload image', error, { source, uploadPath });
    throw error;
  }
}

/**
 * Upload user image (profile or item photo) with automatic path generation
 * Uses `uploadUserImage` from services which handles path generation
 * @param localUri - Local file URI
 * @param uploadOptions - Upload options
 * @returns Upload result with URL, path, contentType, and size
 */
export async function uploadUserImageFromUri(
  localUri: string,
  uploadOptions: UploadOptions = {}
): Promise<{ url: string; path: string; contentType: string; size: number }> {
  try {
    return await uploadUserImage(localUri, {
      maxBytes: uploadOptions.maxBytes,
      targetWidth: uploadOptions.targetWidth,
      forceFormat: uploadOptions.forceFormat ?? 'jpeg',
    });
  } catch (error) {
    logger.error('Failed to upload user image', error, { localUri, uploadOptions });
    throw error;
  }
}

/**
 * Pick photo for return confirmation
 * Shorthand for picking from camera and uploading with standard settings
 * @param uploadPath - Storage path for the return photo
 * @returns Download URL of uploaded photo
 */
export async function pickAndUploadReturnPhoto(uploadPath: string): Promise<string> {
  return pickAndUploadImage(
    'camera',
    uploadPath,
    {
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    },
    {
      forceFormat: 'jpeg',
    }
  );
}

