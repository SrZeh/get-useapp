// services/uploadImage.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, auth } from "../lib/firebase";

// Opcional (para comprimir abaixo de 5MB)
import * as ImageManipulator from "expo-image-manipulator";

type UploadOptions = {
  maxBytes?: number;                   // default 5MB
  targetWidth?: number;                // para reduzir resolução (ex. 1280)
  forceFormat?: "jpeg" | "png" | "webp";
};

export async function uploadUserImage(uri: string, opts: UploadOptions = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Usuário não autenticado");
  const uid = user.uid;

  const {
    maxBytes = 5 * 1024 * 1024,
    targetWidth = 1280,
    forceFormat = "jpeg",
  } = opts;

  // 1) (Opcional) Comprime para garantir <5MB
  const manipulated = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: targetWidth } }],
    { compress: 0.7, format: forceFormat === "png" ? ImageManipulator.SaveFormat.PNG
                                                   : forceFormat === "webp" ? ImageManipulator.SaveFormat.WEBP
                                                   : ImageManipulator.SaveFormat.JPEG }
  );

  // 2) Converte para Blob
  const res = await fetch(manipulated.uri);
  const blob = await res.blob();

  if (blob.size >= maxBytes) {
    throw new Error(`Imagem ainda maior que ${Math.round(maxBytes/1024/1024)}MB após compressão`);
  }

  // 3) Define contentType compatível com a regra
  const contentType = blob.type || (forceFormat === "png" ? "image/png" :
                                    forceFormat === "webp" ? "image/webp" : "image/jpeg");

  // 4) Gera nome e caminho exigido pela regra: items/{uid}/...
  const ext = contentType.split("/")[1] || "jpg";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const objectPath = `items/${uid}/${filename}`;
  const objectRef = ref(storage, objectPath);

  // 5) Sobe com metadata (contentType!)
  await uploadBytes(objectRef, blob, { contentType });

  // 6) URL pública (suas regras dão read público)
  const downloadURL = await getDownloadURL(objectRef);

  return { url: downloadURL, path: objectPath, contentType, size: blob.size };
}
