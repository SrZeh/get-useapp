// src/utils/deleteItem.ts
import { db } from "@/lib/firebase";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";

export async function deleteItemCascade(itemId: string) {
  const itemRef = doc(db, "items", itemId);

  // apaga subcoleção bookedDays
  const bookedSnap = await getDocs(collection(db, "items", itemId, "bookedDays"));
  await Promise.all(bookedSnap.docs.map(d => deleteDoc(d.ref)));

  // apaga subcoleção reviews
  const revSnap = await getDocs(collection(db, "items", itemId, "reviews"));
  await Promise.all(revSnap.docs.map(d => deleteDoc(d.ref)));

  // por fim, apaga o item
  await deleteDoc(itemRef);
}
