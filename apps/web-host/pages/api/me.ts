import type { NextApiRequest, NextApiResponse } from "next";
import { verifyIdToken } from "../../src/services/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Não autenticado" });
  try {
    const user = await verifyIdToken(token);
    return res.status(200).json({ ok: true, uid: user.uid });
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}
