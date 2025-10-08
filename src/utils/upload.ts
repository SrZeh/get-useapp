// src/utils/upload.ts
import { storage } from "../../lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

/**
 * Faz:
 * - resize p/ largura máx. 1600px (mantém proporção)
 * - compressão ~82%
 * - converte p/ JPEG (ou PNG se você pedir)
 * - sobe com metadata contentType adequado (passa nas regras)
 */
export async function uploadImageAsync(
  localUri: string,
  path: string,
  preferPng = false
): Promise<string> {
  // 1) Redimensiona/compacta e define formato final
  const manip = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1600 } }],
    {
      compress: 0.82,
      format: preferPng ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
    }
  );

  // 2) Gera blob
  const resp = await fetch(manip.uri);
  const blob = await resp.blob();

  // 3) Metadata coerente com o formato escolhido
  const contentType = preferPng ? "image/png" : "image/jpeg";

  // 4) Upload com metadata (obrigatório p/ passar nas suas rules)
  const storageRef = ref(storage, path);
  await uploadBytesResumable(storageRef, blob, { contentType });

  // 5) URL pública
  return await getDownloadURL(storageRef);
}
