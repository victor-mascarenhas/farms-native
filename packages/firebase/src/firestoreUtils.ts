import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  QueryConstraint,
  DocumentData,
  Firestore,
} from "firebase/firestore";
import { db } from "./index";

// Busca todos os documentos de uma coleção, filtrando pelo usuário autenticado
export async function getAllFromCollection<T = DocumentData>(
  col: string,
  userId: string,
  userField: string = "created_by",
  constraints: QueryConstraint[] = [],
  dbInstance: Firestore = db
): Promise<T[]> {
  const q = query(
    collection(dbInstance, col),
    where(userField, "==", userId),
    ...constraints
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as T[];
}

// Busca um documento por ID, garantindo que pertence ao usuário
export async function getByIdFromCollection<T = DocumentData>(
  col: string,
  id: string,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
): Promise<T | null> {
  const ref = doc(dbInstance, col, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) return null;
  const data = snapshot.data();
  if (data[userField] !== userId) return null;
  return { id: snapshot.id, ...data } as T;
}

// Adiciona um documento, garantindo o campo de usuário
export async function addToCollection<T = DocumentData>(
  col: string,
  data: T,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
): Promise<string> {
  const docData = { ...data, [userField]: userId };
  const ref = await addDoc(collection(dbInstance, col), docData as any);
  return ref.id;
}

// Atualiza um documento, garantindo que pertence ao usuário
export async function updateInCollection<T = DocumentData>(
  col: string,
  id: string,
  data: Partial<T>,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
): Promise<void> {
  const ref = doc(dbInstance, col, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Documento não encontrado");
  const docData = snapshot.data();
  if (docData[userField] !== userId) throw new Error("Acesso negado");
  await updateDoc(ref, data as any);
}

// Remove um documento, garantindo que pertence ao usuário
export async function removeFromCollection(
  col: string,
  id: string,
  userId: string,
  userField: string = "created_by",
  dbInstance: Firestore = db
): Promise<void> {
  const ref = doc(dbInstance, col, id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error("Documento não encontrado");
  const docData = snapshot.data();
  if (docData[userField] !== userId) throw new Error("Acesso negado");
  await deleteDoc(ref);
}
