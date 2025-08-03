import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  DocumentData,
  Firestore,
} from "firebase/firestore";

import { db } from "@farms/firebase";

// Add document ensuring user ownership
export async function addToCollection<T = DocumentData>(
  col: string,
  data: T,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
) {
  const docData = { ...data, [userField]: userId } as any;
  const ref = await addDoc(collection(dbInstance, col), docData);
  return ref.id;
}

// Update document verifying ownership
export async function updateInCollection<T = DocumentData>(
  col: string,
  id: string,
  data: Partial<T>,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
) {
  const ref = doc(dbInstance, col, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Documento não encontrado");
  const docData = snap.data();
  if (docData[userField] !== userId) throw new Error("Acesso negado");
  await updateDoc(ref, data as any);
}

// Remove document verifying ownership
export async function removeFromCollection(
  col: string,
  id: string,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
) {
  const ref = doc(dbInstance, col, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Documento não encontrado");
  const docData = snap.data();
  if (docData[userField] !== userId) throw new Error("Acesso negado");
  await deleteDoc(ref);
}

