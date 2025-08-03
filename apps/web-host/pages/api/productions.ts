import { NextApiRequest, NextApiResponse } from "next";
import { getFirestore } from "firebase-admin/firestore";
import { verifyIdToken } from "../../src/services/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Não autenticado" });
    const decodedToken = await verifyIdToken(token);
    const db = getFirestore();
    const collection = db.collection("productions");

    if (req.method === "GET") {
      const snapshot = await collection
        .where("created_by", "==", decodedToken.uid)
        .get();
      const sales = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(sales);
    }
    if (req.method === "POST") {
      const docData = {
        ...req.body,
        created_by: decodedToken.uid,
      };
      const docRef = await collection.add(docData);
      return res.status(201).json({ id: docRef.id });
    }
    if (req.method === "PUT") {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await collection.doc(id).update(data);
      return res.status(200).json({ ok: true });
    }
    if (req.method === "DELETE") {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "ID obrigatório" });
      await collection.doc(id).delete();
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Método não permitido" });
  } catch (err) {
    res.status(401).json({ error: "Token inválido" });
  }
}
