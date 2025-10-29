/**
 * User profile service
 * Separates business logic from UI components following SOLID principles
 */

import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logger } from '@/utils';
import { 
  userNameSchema, 
  phoneSchema,
  safeValidate,
} from '@/utils/validation';
import { formatAddress } from '@/utils/address';
import type { UserProfile } from '@/types';
import { z } from 'zod';

/**
 * Profile update schema
 */
export const profileUpdateSchema = z.object({
  name: userNameSchema,
  phone: phoneSchema.optional(),
  address: z.object({
    cep: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
  photoURL: z.string().url().nullable().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

/**
 * Profile update result
 */
export type ProfileUpdateResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

/**
 * Upload avatar image
 */
export async function uploadAvatarImage(localUri: string, uid: string): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();
  const contentType = blob.type?.startsWith('image/') ? blob.type : 'image/jpeg';
  const ext = contentType.split('/')[1] || 'jpg';
  const filename = `avatar-${Date.now()}.${ext}`;
  const path = `avatars/${uid}/${filename}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, blob, { contentType });
  const downloadURL = await getDownloadURL(storageRef);
  
  return downloadURL;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  input: ProfileUpdateInput,
  options?: { uploadAvatar?: string }
): Promise<ProfileUpdateResult> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    return {
      success: false,
      error: 'Usuário não autenticado. Faça login novamente.',
    };
  }

  try {
    // Validate input
    const validation = safeValidate(profileUpdateSchema, input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.errors.forEach((err) => {
        const path = err.path.join('.');
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos.',
        fieldErrors,
      };
    }

    const validated = validation.data;

    // Upload avatar if provided
    let photoURL = validated.photoURL ?? null;
    if (options?.uploadAvatar) {
      try {
        photoURL = await uploadAvatarImage(options.uploadAvatar, uid);
      } catch (error) {
        logger.error('Failed to upload avatar', error);
        return {
          success: false,
          error: 'Não foi possível fazer upload da foto. Tente novamente.',
        };
      }
    }

    // Validate and format phone if provided
    let phoneClean: string | null = null;
    if (validated.phone) {
      const phoneResult = safeValidate(phoneSchema, validated.phone);
      if (!phoneResult.success) {
        return {
          success: false,
          error: phoneResult.errors.errors[0]?.message ?? 'Telefone inválido',
          fieldErrors: { phone: phoneResult.errors.errors[0]?.message ?? 'Telefone inválido' },
        };
      }
      phoneClean = phoneResult.data;
    }

    // Format address if provided
    let formattedAddress: string | null = null;
    if (validated.address) {
      const addr = validated.address;
      const hasAddressData = !!(addr.street || addr.number || addr.neighborhood || addr.city || addr.state);
      if (hasAddressData) {
        formattedAddress = formatAddress({
          street: addr.street || '',
          number: addr.number || '',
          complement: addr.complement,
          neighborhood: addr.neighborhood || '',
          city: addr.city || '',
          state: addr.state?.toUpperCase() || '',
          cep: addr.cep,
        });
      }
    }

    // Update Firestore
    await updateDoc(doc(db, 'users', uid), {
      name: validated.name,
      phone: phoneClean,
      address: formattedAddress,
      photoURL: photoURL,
      updatedAt: serverTimestamp(),
    });

    logger.info('Profile updated successfully', { uid });
    
    return { success: true };
  } catch (error: unknown) {
    logger.error('Profile update failed', error);
    
    const err = error as { message?: string };
    return {
      success: false,
      error: err?.message ?? 'Não foi possível atualizar o perfil. Tente novamente.',
    };
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) {
      return null;
    }
    return { id: snap.id, ...snap.data() } as UserProfile;
  } catch (error) {
    logger.error('Failed to get user profile', error);
    return null;
  }
}

