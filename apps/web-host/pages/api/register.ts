import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "firebase-admin/auth";
import { verifyIdToken } from "../../src/services/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha obrigatórios" });
  }
  try {
    const auth = getAuth();
    const userRecord = await auth.createUser({ email, password });
    return res.status(201).json({ ok: true, uid: userRecord.uid });
  } catch (err: any) {
    let errorMsg = "Erro ao cadastrar usuário";
    if (err.code === "auth/email-already-exists") {
      errorMsg = "E-mail já cadastrado";
    } else if (err.code === "auth/invalid-password") {
      errorMsg = "Senha inválida (mínimo 6 caracteres)";
    }
    return res.status(400).json({ error: errorMsg });
  }
}
