/**
 * Image upload utility with optimization
 * 
 * Features:
 * - Resize to max width 1600px (maintains aspect ratio)
 * - Compression ~82%
 * - Converts to JPEG (or PNG if requested)
 * - Uploads with proper contentType metadata (required for Firebase Storage rules)
 */

import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";
import { logger } from "./logger";

export async function uploadImageAsync(
  localUri: string,
  path: string,
  preferPng = false
): Promise<string> {
  try {
    logger.debug('Starting image upload', { path, preferPng });
    
    // 1) Resize/compress and set final format
    const manip = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1600 } }],
      {
        compress: 0.82,
        format: preferPng ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
      }
    );

    // 2) Generate blob
    const resp = await fetch(manip.uri);
    const blob = await resp.blob();

    // 3) Metadata consistent with chosen format
    const contentType = preferPng ? "image/png" : "image/jpeg";

    // 4) Upload with metadata (required for Storage rules)
    const storageRef = ref(storage, path);
    await uploadBytesResumable(storageRef, blob, { contentType });

    // 5) Get public URL
    const url = await getDownloadURL(storageRef);
    
    logger.debug('Image upload successful', { path, url });
    return url;
  } catch (error) {
    logger.error('Image upload failed', error, { path, preferPng });
    throw error;
  }
}
