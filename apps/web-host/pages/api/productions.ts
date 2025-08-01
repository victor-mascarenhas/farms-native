import { NextApiRequest, NextApiResponse } from 'next';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyIdToken } from '../../src/services/firebaseAdmin';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Não autenticado' });
    await verifyIdToken(token);
    const db = getFirestore();
    const collection = db.collection('productions');

    if (req.method === 'GET') {
      const snapshot = await collection.get();
      const productions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return res.status(200).json(productions);
    }
    if (req.method === 'POST') {
      const docRef = await collection.add(req.body);
      return res.status(201).json({ id: docRef.id });
    }
    if (req.method === 'PUT') {
      const { id, ...data } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      await collection.doc(id).update(data);
      return res.status(200).json({ ok: true });
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'ID obrigatório' });
      await collection.doc(id).delete();
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: 'Método não permitido' });
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
}