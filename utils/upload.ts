// utils/upload.ts
import { storage } from "@/lib/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as ImageManipulator from "expo-image-manipulator";

export async function uploadImageAsync(
  localUri: string,
  path: string,
  preferPng = false
): Promise<string> {
  const manip = await ImageManipulator.manipulateAsync(
    localUri,
    [{ resize: { width: 1600 } }],
    {
      compress: 0.82,
      format: preferPng ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
    }
  );

  const resp = await fetch(manip.uri);
  const blob = await resp.blob();
  const contentType = preferPng ? "image/png" : "image/jpeg";

  const storageRef = ref(storage, path);
  await uploadBytesResumable(storageRef, blob, { contentType });
  return await getDownloadURL(storageRef);
}
