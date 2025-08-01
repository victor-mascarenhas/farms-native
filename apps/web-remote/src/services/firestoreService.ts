import { db } from "@farms/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  DocumentData,
  QueryConstraint,
} from "firebase/firestore";

export async function getAllFromCollection<T = DocumentData>(
  col: string,
  constraints: QueryConstraint[] = []
) {
  const q = query(collection(db, col), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })) as T[];
}

export async function addToCollection<T = DocumentData>(col: string, data: T) {
  const ref = await addDoc(collection(db, col), data as any);
  return ref.id;
}

export async function updateInCollection<T = DocumentData>(
  col: string,
  id: string,
  data: Partial<T>
) {
  await updateDoc(doc(db, col, id), data);
}

export async function deleteFromCollection(col: string, id: string) {
  await deleteDoc(doc(db, col, id));
}
